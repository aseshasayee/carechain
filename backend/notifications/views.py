"""
Views for the notifications app.
"""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, OuterRef, Subquery, Count, Max, F
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import (
    Notification, 
    EmailNotification, 
    ChatRoom,
    ChatMessage,
    MessageReceipt,
    UserPresence
)
from .serializers import (
    NotificationSerializer, 
    EmailNotificationSerializer, 
    ChatRoomSerializer,
    ChatMessageSerializer,
    MessageReceiptSerializer,
    UserPresenceSerializer,
    CreateChatRoomSerializer,
    UserSerializer
)

User = get_user_model()


class NotificationListView(generics.ListAPIView):
    """List all notifications for the current user."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a notification."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkAllNotificationsReadView(APIView):
    """Mark all notifications as read for the current user."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        notifications = Notification.objects.filter(
            user=request.user,
            read=False
        )
        
        now = timezone.now()
        
        for notification in notifications:
            notification.read = True
            notification.read_at = now
        
        if notifications:
            Notification.objects.bulk_update(notifications, ['read', 'read_at'])
        
        return Response({'status': 'success', 'message': 'All notifications marked as read'})


class EmailNotificationListView(generics.ListAPIView):
    """List all email notifications for the current user."""
    serializer_class = EmailNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return EmailNotification.objects.filter(user=self.request.user)


# New Chat System Views
class ChatRoomListView(generics.ListCreateAPIView):
    """
    List all chat rooms for the current user or create a new chat room.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateChatRoomSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(participants=user, is_active=True).distinct()

    def perform_create(self, serializer):
        return serializer.save()


class ChatRoomDetailView(generics.RetrieveAPIView):
    """
    Retrieve a specific chat room.
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(participants=user, is_active=True)


class ChatMessageListView(generics.ListCreateAPIView):
    """
    List all messages in a chat room or create a new message.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        room_id = self.kwargs.get('room_id')
        
        # Ensure the user is a participant in the room
        room = get_object_or_404(ChatRoom, id=room_id, participants=user)
        
        # Mark all messages as delivered when viewed
        self.mark_messages_delivered(room, user)
        
        return ChatMessage.objects.filter(room=room).order_by('created_at')
    
    def mark_messages_delivered(self, room, user):
        """Mark all undelivered messages in this room as delivered"""
        receipts = MessageReceipt.objects.filter(
            message__room=room,
            recipient=user,
            delivered=False
        )
        
        now = timezone.now()
        for receipt in receipts:
            receipt.delivered = True
            receipt.delivered_at = now
        
        if receipts:
            MessageReceipt.objects.bulk_update(receipts, ['delivered', 'delivered_at'])
    
    def perform_create(self, serializer):
        room_id = self.kwargs.get('room_id')
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Ensure the user is a participant in the room
        if self.request.user not in room.participants.all():
            return Response(
                {"detail": "You are not a participant in this chat room."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Save the message
        message = serializer.save(room=room, sender=self.request.user)
        
        # Create receipts for all participants except sender
        participants = room.participants.exclude(id=self.request.user.id)
        receipts = []
        for participant in participants:
            receipts.append(MessageReceipt(
                message=message,
                recipient=participant
            ))
        
        if receipts:
            MessageReceipt.objects.bulk_create(receipts)
        
        # Update the room's updated_at timestamp
        room.updated_at = timezone.now()
        room.save(update_fields=['updated_at'])
        
        return message


class MarkMessagesReadView(APIView):
    """
    Mark all messages in a room as read.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, room_id):
        user = request.user
        room = get_object_or_404(ChatRoom, id=room_id, participants=user)
        
        # Find all unread receipts for this user in this room
        receipts = MessageReceipt.objects.filter(
            message__room=room,
            recipient=user,
            read=False
        )
        
        now = timezone.now()
        for receipt in receipts:
            receipt.delivered = True
            receipt.delivered_at = now if not receipt.delivered_at else receipt.delivered_at
            receipt.read = True
            receipt.read_at = now
        
        if receipts:
            MessageReceipt.objects.bulk_update(receipts, ['delivered', 'delivered_at', 'read', 'read_at'])
        
        return Response({
            'status': 'success',
            'message': f'Marked {len(receipts)} messages as read'
        })


class UserPresenceView(generics.RetrieveUpdateAPIView):
    """
    Get or update a user's online presence.
    """
    serializer_class = UserPresenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        presence, created = UserPresence.objects.get_or_create(user=user)
        return presence
    
    def update(self, request, *args, **kwargs):
        presence = self.get_object()
        is_online = request.data.get('is_online', True)
        presence.update_presence(is_online)
        return Response(self.get_serializer(presence).data)


class ContactsListView(APIView):
    """
    Get a list of users the current user has chatted with.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Find all rooms this user is in
        rooms = ChatRoom.objects.filter(participants=user, is_active=True)
        
        # For each room, get other participants and last message
        contacts = []
        
        for room in rooms:
            # Get other participants
            other_participants = room.participants.exclude(id=user.id)
            
            # Skip if no other participants (shouldn't happen in direct chats)
            if not other_participants.exists():
                continue
            
            # Get last message in the room
            last_message = room.messages.order_by('-created_at').first()
            
            # Skip rooms with no messages
            if not last_message:
                continue
            
            # Get unread count for this user in this room
            unread_count = MessageReceipt.objects.filter(
                message__room=room,
                recipient=user,
                read=False
            ).count()
            
            # For direct chats, show the other user as the contact
            if room.room_type == 'direct' and other_participants.count() == 1:
                other_user = other_participants.first()
                contacts.append({
                    'id': other_user.id,
                    'room_id': room.id,
                    'name': other_user.get_full_name() if hasattr(other_user, 'get_full_name') and other_user.get_full_name() else other_user.email,
                    'email': other_user.email,
                    'last_message': last_message.content,
                    'last_message_time': last_message.created_at,
                    'unread_count': unread_count,
                    'is_online': hasattr(other_user, 'presence') and other_user.presence.is_online,
                })
            else:
                # For group chats, show the room name
                contacts.append({
                    'id': room.id,
                    'room_id': room.id,
                    'name': room.name,
                    'is_group': True,
                    'participant_count': other_participants.count() + 1,  # +1 for the current user
                    'last_message': last_message.content,
                    'last_message_time': last_message.created_at,
                    'unread_count': unread_count,
                })
        
        # Sort by last message time
        contacts.sort(key=lambda x: x['last_message_time'], reverse=True)
        
        return Response(contacts)


class DirectMessageView(APIView):
    """
    Start a direct message with a user based on job application.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Get recipient information
        recipient_id = request.data.get('recipient_id')
        job_application_id = request.data.get('job_application_id')
        content = request.data.get('content')
        candidate_name = request.data.get('candidate_name')
        
        if not content:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle direct messaging with candidate name (no user account)
        if candidate_name and job_application_id:
            from jobs.models import JobApplication
            
            try:
                job_application = JobApplication.objects.get(id=job_application_id)
                
                # Create or get chat room for this candidate
                room_name = f"Chat with {candidate_name}"
                room, created = ChatRoom.objects.get_or_create(
                    name=room_name,
                    room_type='direct',
                    related_job_application=job_application,
                )
                
                # Add current user as participant
                room.participants.add(user)
                
                # Add candidate user if available
                if job_application.candidate and job_application.candidate.user:
                    room.participants.add(job_application.candidate.user)
                
                # Create message
                message = ChatMessage.objects.create(
                    room=room,
                    sender=user,
                    content=content
                )
                
                # Create receipts for other participants
                for participant in room.participants.exclude(id=user.id):
                    MessageReceipt.objects.create(
                        message=message,
                        recipient=participant
                    )
                
                # Update room timestamp
                room.save()  # This updates the auto_now field
                
                return Response({
                    'room_id': room.id,
                    'message_id': message.id,
                    'content': content
                }, status=status.HTTP_201_CREATED)
                
            except JobApplication.DoesNotExist:
                return Response(
                    {'error': 'Job application not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Handle direct messaging with user ID
        elif recipient_id:
            try:
                recipient = User.objects.get(id=recipient_id)
                
                # Check if a direct chat already exists between these users
                existing_rooms = ChatRoom.objects.filter(
                    room_type='direct',
                    participants=user
                ).filter(
                    participants=recipient
                )
                
                if existing_rooms.exists():
                    room = existing_rooms.first()
                else:
                    # Create a new direct chat room
                    room = ChatRoom.objects.create(
                        name=f"Chat between {user.get_full_name() if hasattr(user, 'get_full_name') else user.email} and {recipient.get_full_name() if hasattr(recipient, 'get_full_name') else recipient.email}",
                        room_type='direct'
                    )
                    room.participants.add(user, recipient)
                    
                    # Link to job application if provided
                    if job_application_id:
                        from jobs.models import JobApplication
                        try:
                            job_application = JobApplication.objects.get(id=job_application_id)
                            room.related_job_application = job_application
                            room.save()
                        except JobApplication.DoesNotExist:
                            pass
                
                # Create message
                message = ChatMessage.objects.create(
                    room=room,
                    sender=user,
                    content=content
                )
                
                # Create receipt for recipient
                MessageReceipt.objects.create(
                    message=message,
                    recipient=recipient
                )
                
                # Update room timestamp
                room.updated_at = timezone.now()
                room.save(update_fields=['updated_at'])
                
                return Response({
                    'room_id': room.id,
                    'message_id': message.id,
                    'content': content
                }, status=status.HTTP_201_CREATED)
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'Recipient not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(
            {'error': 'Either recipient_id or candidate_name with job_application_id must be provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        ) 