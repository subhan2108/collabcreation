import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth import get_user_model  # lazy import
        from django.utils import timezone
        User = get_user_model()

        self.user = self.scope['user']

        # Disconnect anonymous users
        if not self.user.is_authenticated:
            await self.close()
            return

        try:
            self.other_user_id = int(self.scope['url_route']['kwargs']['user_id'])
        except (KeyError, TypeError, ValueError):
            await self.close()
            return

        # Ensure other user exists
        try:
            self.other_user = await database_sync_to_async(User.objects.get)(id=self.other_user_id)
        except User.DoesNotExist:
            await self.close()
            return

        # Update user online status
        await database_sync_to_async(self.update_user_status)(True)

        # Unique room name for both users
        self.room_name = f"chat_{min(self.user.id, self.other_user_id)}_{max(self.user.id, self.other_user_id)}"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ WebSocket connected: {self.user.username} <-> {self.other_user.username}")

    def update_user_status(self, is_online):
        from django.utils import timezone
        self.user.is_online = is_online
        if is_online:
            self.user.last_seen = timezone.now()
        self.user.save()

    async def disconnect(self, close_code):
        # Update user offline status
        await database_sync_to_async(self.update_user_status)(False)

        # Only discard if room_group_name exists
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            print(f"❌ WebSocket disconnected: {self.user.username} <-> {getattr(self, 'other_user', None)}")
        else:
            print(f"❌ WebSocket disconnected before room was created for user {getattr(self, 'user', None)}")


    async def receive(self, text_data):
        from django.contrib.auth import get_user_model
        from .models import ChatMessage
        User = get_user_model()

        data = json.loads(text_data)
        message = data.get('message', '').strip()
        msg_type = data.get('type')

        if msg_type == 'typing_start':
            # Send typing start to the other user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_start',
                    'sender_username': self.user.username,
                }
            )
            return
        elif msg_type == 'typing_stop':
            # Send typing stop to the other user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_stop',
                    'sender_username': self.user.username,
                }
            )
            return
        elif msg_type == 'edit_message':
            # Handle message edit
            message_id = data.get('message_id')
            new_message = data.get('new_message', '').strip()

            if not message_id or not new_message:
                return

            # Update message in database
            try:
                from .models import ChatMessage
                from django.utils import timezone
                msg = await database_sync_to_async(ChatMessage.objects.get)(id=message_id, sender=self.user)
                msg.message = new_message
                msg.edited_at = timezone.now()
                await database_sync_to_async(msg.save)()

                # Send edit event to both users
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_edited',
                        'message_id': message_id,
                        'new_message': new_message,
                        'edited_at': msg.edited_at.isoformat(),
                    }
                )
            except ChatMessage.DoesNotExist:
                pass  # Message not found or not authorized
            return
        elif msg_type == 'delete_message':
            # Handle message delete
            message_id = data.get('message_id')

            if not message_id:
                return

            # Mark message as deleted in database
            try:
                from .models import ChatMessage
                msg = await database_sync_to_async(ChatMessage.objects.get)(id=message_id, sender=self.user)
                msg.is_deleted = True
                await database_sync_to_async(msg.save)()

                # Send delete event to both users
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_deleted',
                        'message_id': message_id,
                    }
                )
            except ChatMessage.DoesNotExist:
                pass  # Message not found or not authorized
            return

        if not message:
            return

        # Save message
        chat_msg = await database_sync_to_async(ChatMessage.objects.create)(
            sender=self.user,
            receiver=self.other_user,
            message=message
        )

        # Inside receive() after saving the message
        await self.channel_layer.group_send(
        self.room_group_name,
    {
        'type': 'chat_message',
        'sender_id': self.user.id,
        'sender_username': self.user.username,
        'receiver_id': self.other_user.id,
        'receiver_username': self.other_user.username,
        'message': message,

    }
)


    # consumers.py -> chat_message
    async def chat_message(self, event):
        # Only send to WS if not the sender's own WS
        if self.user.id != event['sender_id']:
            await self.send(text_data=json.dumps({
                'type': 'new_message',
                'sender_id': event['sender_id'],
                'sender_username': event['sender_username'],
                'receiver_id': event['receiver_id'],
                'receiver_username': event['receiver_username'],
                'message': event['message'],
                'id': event.get('id'),
                'timestamp': event.get('timestamp'),
            }))

    # Handle message edit
    async def message_edited(self, event):
        # Send to both users in the chat
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message_id': event['message_id'],
            'new_message': event['new_message'],
            'edited_at': event['edited_at'],
        }))

    # Handle message delete
    async def message_deleted(self, event):
        # Send to both users in the chat
        await self.send(text_data=json.dumps({
            'type': 'message_deleted',
            'message_id': event['message_id'],
        }))

    # Handle typing start
    async def typing_start(self, event):
        # Only send to WS if not the sender's own WS
        if self.user.username != event['sender_username']:
            await self.send(text_data=json.dumps({
                'type': 'typing_start',
                'sender_username': event['sender_username'],
            }))

    # Handle typing stop
    async def typing_stop(self, event):
        # Only send to WS if not the sender's own WS
        if self.user.username != event['sender_username']:
            await self.send(text_data=json.dumps({
                'type': 'typing_stop',
                'sender_username': event['sender_username'],
            }))


