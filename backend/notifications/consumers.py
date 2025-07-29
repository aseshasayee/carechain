"""
WebSocket consumers for the notifications app.
"""

import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.exceptions import ChannelFull
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.user_room = None  # Personal room for the user
        self.active_rooms = set()  # Track rooms the connection is in
        # Move model imports here to avoid AppRegistryNotReady
        global ChatRoom, ChatMessage, MessageReceipt, UserPresence
        from .models import ChatRoom, ChatMessage, MessageReceipt, UserPresence
        from django.contrib.auth import get_user_model
        self.User = get_user_model()

    async def connect(self):
        self.user = self.scope["user"]
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Check if Redis/channel layer is working
        is_healthy = await check_channel_layer()
        if not is_healthy:
            logger.warning(f"Channel layer health check failed for user {self.user.id}")
            # We'll still continue with the connection but log the issue
        
        # Set up personal room for the user
        self.user_room = f"user_{self.user.id}"
        try:
            await self.channel_layer.group_add(self.user_room, self.channel_name)
        except Exception as e:
            logger.error(f"Error adding user {self.user.id} to personal room: {str(e)}")
            # Continue anyway - we'll use fallback mechanisms later
            
        # Update user presence
        try:
            await self.update_presence(True)
        except Exception as e:
            logger.error(f"Error updating presence for user {self.user.id}: {str(e)}")
            # Non-critical, can continue
            
        # Accept the connection
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'welcome',
            'message': 'Connected to chat server',
            'user_id': self.user.id,
            'timestamp': timezone.now().isoformat(),
            'channel_healthy': is_healthy
        }))
        
        # Broadcast user online status
        try:
            await self.broadcast_presence(True)
        except Exception as e:
            logger.error(f"Error broadcasting presence for user {self.user.id}: {str(e)}")
            # Non-critical, can continue
    
    async def disconnect(self, close_code):
        # Leave all rooms
        if self.user_room:
            await self.channel_layer.group_discard(self.user_room, self.channel_name)
        
        for room_id in list(self.active_rooms):
            await self.leave_room(room_id)
        
        # Update user presence
        if self.user and self.user.is_authenticated:
            await self.update_presence(False)
            await self.broadcast_presence(False)
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            command = data.get('command')
            
            # Handle different commands
            if command == 'join_room':
                room_id = data.get('room_id')
                if room_id:
                    await self.join_room(room_id)
            
            elif command == 'leave_room':
                room_id = data.get('room_id')
                if room_id:
                    await self.leave_room(room_id)
            
            elif command == 'send_message':
                room_id = data.get('room_id')
                content = data.get('content')
                temp_id = data.get('temp_id')  # For optimistic UI updates
                
                if room_id and content:
                    message = await self.save_message(room_id, content)
                    if message:
                        # Send to the room
                        await self.channel_layer.group_send(
                            f"room_{room_id}",
                            {
                                'type': 'chat.message',
                                'message': {
                                    'id': message.id,
                                    'room_id': room_id,
                                    'sender_id': self.user.id,
                                    'content': content,
                                    'created_at': message.created_at.isoformat(),
                                    'temp_id': temp_id
                                }
                            }
                        )
                        
                        # Send confirmation back to sender
                        await self.send(text_data=json.dumps({
                            'type': 'message_sent',
                            'message': {
                                'id': message.id,
                                'room_id': room_id,
                                'temp_id': temp_id,
                                'created_at': message.created_at.isoformat(),
                            }
                        }))
                        
                        # Send notifications to participants not in the room
                        await self.send_message_notifications(message)
                        
            elif command == 'read_messages':
                room_id = data.get('room_id')
                if room_id:
                    count = await self.mark_messages_read(room_id)
                    
                    # Notify other users that messages were read
                    room_participants = await self.get_room_participants(room_id)
                    for participant_id in room_participants:
                        if participant_id != self.user.id:
                            await self.channel_layer.group_send(
                                f"user_{participant_id}",
                                {
                                    'type': 'read.receipt',
                                    'reader_id': self.user.id,
                                    'room_id': room_id,
                                    'timestamp': timezone.now().isoformat(),
                                }
                            )
            
            elif command == 'typing':
                room_id = data.get('room_id')
                is_typing = data.get('is_typing', True)
                
                if room_id:
                    await self.update_typing_status(room_id, is_typing)
                    
                    # Broadcast to the room
                    await self.channel_layer.group_send(
                        f"room_{room_id}",
                        {
                            'type': 'typing.indicator',
                            'user_id': self.user.id,
                            'room_id': room_id,
                            'is_typing': is_typing,
                        }
                    )
            
        except json.JSONDecodeError:
            pass
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e),
            }))
    
    # Room management
    async def join_room(self, room_id):
        """Join a chat room"""
        # Check if user has access to the room
        has_access = await self.check_room_access(room_id)
        if not has_access:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Access denied to this room'
            }))
            return
        
        room_group_name = f"room_{room_id}"
        
        # Add to group
        await self.channel_layer.group_add(room_group_name, self.channel_name)
        self.active_rooms.add(room_id)
        
        # Mark messages as delivered when joining the room
        await self.mark_messages_delivered(room_id)
        
        # Send confirmation
        await self.send(text_data=json.dumps({
            'type': 'room_joined',
            'room_id': room_id
        }))
    
    async def leave_room(self, room_id):
        """Leave a chat room"""
        room_group_name = f"room_{room_id}"
        
        # Remove from group
        await self.channel_layer.group_discard(room_group_name, self.channel_name)
        self.active_rooms.discard(room_id)
        
        # Send confirmation
        await self.send(text_data=json.dumps({
            'type': 'room_left',
            'room_id': room_id
        }))
    
    # Channel layer message handlers
    async def chat_message(self, event):
        """Handle incoming chat messages"""
        message = event['message']
        
        # If the message is not from current user, mark it as delivered
        if message['sender_id'] != self.user.id:
            await self.mark_message_delivered(message['id'])
            
            # If the user is currently in the room, mark as read
            if int(message['room_id']) in self.active_rooms:
                await self.mark_message_read(message['id'])
                
                # Send read receipt to sender
                await self.channel_layer.group_send(
                    f"user_{message['sender_id']}",
                    {
                        'type': 'read.receipt',
                        'reader_id': self.user.id,
                        'message_id': message['id'],
                        'room_id': message['room_id'],
                        'timestamp': timezone.now().isoformat()
                    }
                )
        
        # Forward the message to the WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))
    
    async def typing_indicator(self, event):
        """Handle typing indicators"""
        # Don't send typing indicators from the user to themselves
        if event['user_id'] == self.user.id:
            return
            
        # Forward the typing indicator
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user_id': event['user_id'],
            'room_id': event['room_id'],
            'is_typing': event['is_typing']
        }))
    
    async def delivery_receipt(self, event):
        """Handle delivery receipts"""
        await self.send(text_data=json.dumps({
            'type': 'delivery_receipt',
            'deliverer_id': event['deliverer_id'],
            'message_id': event['message_id']
        }))
    
    async def read_receipt(self, event):
        """Handle read receipts"""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'reader_id': event['reader_id'],
            'room_id': event.get('room_id'),
            'message_id': event.get('message_id'),
            'timestamp': event['timestamp']
        }))
    
    async def presence_update(self, event):
        """Handle user presence updates"""
        await self.send(text_data=json.dumps({
            'type': 'presence_update',
            'user_id': event['user_id'],
            'is_online': event['is_online'],
            'last_seen': event['last_seen']
        }))
    
    # Database operations
    @database_sync_to_async
    def check_room_access(self, room_id):
        """Check if the user has access to a room"""
        return ChatRoom.objects.filter(
            id=room_id,
            participants=self.user
        ).exists()
    
    @database_sync_to_async
    def get_room_participants(self, room_id):
        """Get all participant IDs for a room"""
        try:
            room = ChatRoom.objects.get(id=room_id)
            return list(room.participants.values_list('id', flat=True))
        except ChatRoom.DoesNotExist:
            return []
    
    @database_sync_to_async
    def save_message(self, room_id, content):
        """Save a new message to the database"""
        try:
            # Get the room
            room = ChatRoom.objects.get(id=room_id, participants=self.user)
            
            # Create the message
            message = ChatMessage.objects.create(
                room=room,
                sender=self.user,
                content=content
            )
            
            # Create receipts for all participants except sender
            receipts = []
            for participant in room.participants.exclude(id=self.user.id):
                receipts.append(MessageReceipt(
                    message=message,
                    recipient=participant
                ))
            
            if receipts:
                MessageReceipt.objects.bulk_create(receipts)
            
            # Update room timestamp
            room.updated_at = timezone.now()
            room.save(update_fields=['updated_at'])
            
            return message
        except ChatRoom.DoesNotExist:
            return None
    
    @database_sync_to_async
    def mark_messages_delivered(self, room_id):
        """Mark all undelivered messages in a room as delivered"""
        # Find all undelivered receipts for this user in this room
        receipts = MessageReceipt.objects.filter(
            message__room_id=room_id,
            recipient=self.user,
            delivered=False
        )
        
        # Mark them as delivered
        now = timezone.now()
        updated_ids = []
        sender_ids = set()
        
        for receipt in receipts:
            receipt.delivered = True
            receipt.delivered_at = now
            updated_ids.append(receipt.message_id)
            sender_ids.add(receipt.message.sender_id)
        
        if receipts:
            MessageReceipt.objects.bulk_update(receipts, ['delivered', 'delivered_at'])
        
        # Send delivery receipts to senders
        for sender_id in sender_ids:
            if sender_id:  # Skip None (system messages)
                message_ids = [r.message_id for r in receipts if r.message.sender_id == sender_id]
                if message_ids:
                    asyncio.create_task(
                        self.channel_layer.group_send(
                            f"user_{sender_id}",
                            {
                                'type': 'delivery_receipt',
                                'deliverer_id': self.user.id,
                                'message_ids': message_ids
                            }
                        )
                    )
        
        return len(receipts)
    
    @database_sync_to_async
    def mark_messages_read(self, room_id):
        """Mark all unread messages in a room as read"""
        # Find all unread receipts for this user in this room
        receipts = MessageReceipt.objects.filter(
            message__room_id=room_id,
            recipient=self.user,
            read=False
        )
        
        # Mark them as read
        now = timezone.now()
        count = 0
        
        for receipt in receipts:
            receipt.delivered = True
            receipt.delivered_at = now if not receipt.delivered_at else receipt.delivered_at
            receipt.read = True
            receipt.read_at = now
            count += 1
        
        if receipts:
            MessageReceipt.objects.bulk_update(receipts, ['delivered', 'delivered_at', 'read', 'read_at'])
        
        return count
    
    @database_sync_to_async
    def mark_message_delivered(self, message_id):
        """Mark a specific message as delivered"""
        try:
            receipt = MessageReceipt.objects.get(
                message_id=message_id,
                recipient=self.user,
                delivered=False
            )
            
            receipt.delivered = True
            receipt.delivered_at = timezone.now()
            receipt.save(update_fields=['delivered', 'delivered_at'])
            
            # Send delivery receipt to sender
            asyncio.create_task(
                self.channel_layer.group_send(
                    f"user_{receipt.message.sender_id}",
                    {
                        'type': 'delivery_receipt',
                        'deliverer_id': self.user.id,
                        'message_id': message_id
                    }
                )
            )
            
            return True
        except MessageReceipt.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark a specific message as read"""
        try:
            receipt = MessageReceipt.objects.get(
                message_id=message_id,
                recipient=self.user,
                read=False
            )
            
            # Ensure it's also marked as delivered
            receipt.delivered = True
            receipt.delivered_at = receipt.delivered_at or timezone.now()
            receipt.read = True
            receipt.read_at = timezone.now()
            receipt.save(update_fields=['delivered', 'delivered_at', 'read', 'read_at'])
            
            return True
        except MessageReceipt.DoesNotExist:
            return False
    
    @database_sync_to_async
    def update_presence(self, is_online):
        """Update the user's online presence"""
        presence, created = UserPresence.objects.get_or_create(user=self.user)
        
        presence.is_online = is_online
        presence.last_seen = timezone.now()
        
        if not is_online:
            # Clear typing state when going offline
            presence.typing_in_room = None
            presence.last_typing_update = None
        
        presence.save()
        return presence
    
    @database_sync_to_async
    def update_typing_status(self, room_id, is_typing):
        """Update user typing status"""
        try:
            presence, _ = UserPresence.objects.get_or_create(user=self.user)
            
            if is_typing:
                room = ChatRoom.objects.get(id=room_id)
                presence.typing_in_room = room
                presence.last_typing_update = timezone.now()
            else:
                presence.typing_in_room = None
                presence.last_typing_update = None
                
            presence.save(update_fields=['typing_in_room', 'last_typing_update'])
            return True
        except ChatRoom.DoesNotExist:
            return False 
    
    @database_sync_to_async
    def send_message_notifications(self, message):
        """Send notifications to participants not currently in the room"""
        # Get all participants in the room
        room_participants = list(message.room.participants.exclude(id=self.user.id))
        
        for participant in room_participants:
            # Get participant's current active channel
            asyncio.create_task(
                self.channel_layer.group_send(
                    f"user_{participant.id}",
                    {
                        'type': 'chat.message',
                        'message': {
                            'id': message.id,
                            'room_id': message.room.id,
                            'sender_id': self.user.id,
                            'content': message.content,
                            'created_at': message.created_at.isoformat(),
                        }
                    }
                )
            )
    
    # Broadcast presence
    async def broadcast_presence(self, is_online):
        """Broadcast presence status to all contacts"""
        if not self.user or not self.user.is_authenticated:
            return
            
        # Get all users who have chatted with this user
        room_participants = await self.get_user_contacts()
        last_seen = timezone.now().isoformat()
        
        # Broadcast to all contacts
        for participant_id in room_participants:
            if participant_id != self.user.id:
                asyncio.create_task(
                    self.channel_layer.group_send(
                        f"user_{participant_id}",
                        {
                            'type': 'presence_update',
                            'user_id': self.user.id,
                            'is_online': is_online,
                            'last_seen': last_seen
                        }
                    )
                )
    
    @database_sync_to_async
    def get_user_contacts(self):
        """Get all users who have chatted with this user"""
        # Get all rooms this user is in
        rooms = ChatRoom.objects.filter(participants=self.user)
        
        # Get all participants from these rooms
        contact_ids = set()
        for room in rooms:
            participant_ids = room.participants.values_list('id', flat=True)
            contact_ids.update(participant_ids)
        
        return list(contact_ids)