import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from django.contrib.auth import get_user_model  # lazy import
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

        # Unique room name for both users
        self.room_name = f"chat_{min(self.user.id, self.other_user_id)}_{max(self.user.id, self.other_user_id)}"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ WebSocket connected: {self.user.username} <-> {self.other_user.username}")

    async def disconnect(self, close_code):
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
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'receiver_id': event['receiver_id'],
            'receiver_username': event['receiver_username'],
            'message': event['message'],
        }))


