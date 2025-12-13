import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        # Get other user ID
        try:
            self.other_user_id = int(self.scope['url_route']['kwargs']['user_id'])
        except:
            await self.close()
            return

        # Verify other user exists
        try:
            self.other_user = await database_sync_to_async(User.objects.get)(id=self.other_user_id)
        except User.DoesNotExist:
            await self.close()
            return

        # Mark current user online
        await database_sync_to_async(self.update_user_status)(True)

        # Create room
        self.room_name = f"chat_{min(self.user.id, self.other_user_id)}_{max(self.user.id, self.other_user_id)}"
        self.room_group_name = f"chat_{self.room_name}"

        # Join WS room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        print(f"✅ CONNECTED → {self.user.username}")

        # 🔥 BROADCAST TO OTHER USER: user_online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "status": "online"
            }
        )

    def update_user_status(self, is_online):
        from django.utils import timezone
        self.user.is_online = is_online
        if is_online:
            self.user.last_seen = timezone.now()
        self.user.save()

    async def disconnect(self, close_code):
        # Mark offline
        await database_sync_to_async(self.update_user_status)(False)

        # 🔥 BROADCAST TO OTHER USER: user_offline
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "status": "offline"
                }
            )

            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        print(f"❌ DISCONNECTED → {self.user.username}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get('type')
        message = data.get('message', '').strip()

        # ==========================
        # TYPING EVENTS
        # ==========================
        if msg_type == "typing_start":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_start",
                    "sender_username": self.user.username,
                }
            )
            return

        if msg_type == "typing_stop":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_stop",
                    "sender_username": self.user.username,
                }
            )
            return

        # ==========================
        # EDIT MESSAGE
        # ==========================

        if msg_type == "edit_message":
            from .models import ChatMessage
            from django.utils import timezone

            message_id = data.get("message_id")
            new_message = data.get("new_message", "").strip()

            if not message_id or not new_message:
                return

            try:
                msg = await database_sync_to_async(ChatMessage.objects.get)(
                    id=message_id, sender=self.user
                )
                msg.message = new_message
                msg.edited_at = timezone.now()
                await database_sync_to_async(msg.save)()

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "message_edited",
                        "message_id": msg.id,
                        "new_message": new_message,
                        "edited_at": msg.edited_at.isoformat(),
                    }
                )

            except ChatMessage.DoesNotExist:
                pass

            return

        # ==========================
        # DELETE MESSAGE
        # ==========================
        if msg_type == "delete_message":
            from .models import ChatMessage

            message_id = data.get("message_id")
            if not message_id:
                return

            try:
                msg = await database_sync_to_async(ChatMessage.objects.get)(
                    id=message_id, sender=self.user
                )
                msg.is_deleted = True
                await database_sync_to_async(msg.save)()

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "message_deleted",
                        "message_id": msg.id,
                    }
                )

            except ChatMessage.DoesNotExist:
                pass

            return

        # ==========================
        # SEND NORMAL MESSAGE
        # ==========================

        if not message:
            return

        from .models import ChatMessage

        chat_msg = await database_sync_to_async(ChatMessage.objects.create)(
            sender=self.user,
            receiver=self.other_user,
            message=message
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "sender_id": self.user.id,
                "sender_username": self.user.username,
                "receiver_id": self.other_user.id,
                "receiver_username": self.other_user.username,
                "message": message,
            }
        )

    # ==========================
    # WS EVENT HANDLERS
    # ==========================

    async def chat_message(self, event):
        if self.user.id != event["sender_id"]:
            await self.send(text_data=json.dumps({
                "type": "new_message",
                **event
            }))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            "type": "message_edited",
            **event
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            "type": "message_deleted",
            **event
        }))

    async def typing_start(self, event):
        if self.user.username != event["sender_username"]:
            await self.send(text_data=json.dumps({
                "type": "typing_start",
                "sender_username": event["sender_username"]
            }))

    async def typing_stop(self, event):
        if self.user.username != event["sender_username"]:
            await self.send(text_data=json.dumps({
                "type": "typing_stop",
                "sender_username": event["sender_username"]
            }))

    # ==========================
    # REALTIME ONLINE/OFFLINE
    # ==========================
    async def user_status(self, event):
        status_type = "user_online" if event["status"] == "online" else "user_offline"

        await self.send(text_data=json.dumps({
            "type": status_type,
            "user_id": event["user_id"]
        }))
