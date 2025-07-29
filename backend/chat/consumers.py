import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        # Handle both text and binary messages
        if text_data is None and bytes_data is not None:
            try:
                text_data = bytes_data.decode('utf-8')
            except Exception as e:
                print(f"[ChatConsumer] Failed to decode bytes_data: {e}, raw: {bytes_data}")
                return

        if not text_data or not isinstance(text_data, str):
            print(f"[ChatConsumer] Received empty or non-string text_data: {text_data}")
            return

        try:
            data = json.loads(text_data)
        except Exception as e:
            print(f"[ChatConsumer] Failed to parse JSON: {e}, raw: {text_data}")
            return

        if not isinstance(data, dict) or 'message' not in data:
            print(f"[ChatConsumer] Received data without 'message' key: {data}")
            return

        message = data['message']
        user = self.scope['user']
        sender_username = user.username if user.is_authenticated else 'Anonymous'
        recipient_id = data.get('recipient_id')

        # Save message to DB and ensure both users are participants
        await self.save_message_to_db(self.room_name, user, message, recipient_id)

        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_username
            }
        )

    @database_sync_to_async
    def save_message_to_db(self, room_name, sender, message, recipient_id):
        from .models import ChatRoom, ChatMessage
        from django.contrib.auth import get_user_model
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        if recipient_id:
            User = get_user_model()
            try:
                recipient = User.objects.get(id=recipient_id)
                room.participants.add(sender, recipient)
            except User.DoesNotExist:
                room.participants.add(sender)
        else:
            room.participants.add(sender)
        ChatMessage.objects.create(room=room, sender=sender, content=message)

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))
