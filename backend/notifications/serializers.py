"""
Serializers for the notifications app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Notification, 
    EmailNotification, 
    ChatRoom,
    ChatMessage,
    MessageReceipt,
    UserPresence
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at']


class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = '__all__'
        read_only_fields = ['created_at', 'sent_at']


class UserPresenceSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = UserPresence
        fields = ['user', 'user_details', 'is_online', 'last_seen']
        read_only_fields = ['last_seen']


class MessageReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageReceipt
        fields = ['id', 'message', 'recipient', 'delivered', 'delivered_at', 'read', 'read_at']
        read_only_fields = ['delivered_at', 'read_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receipts = MessageReceiptSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'sender', 'sender_name', 'content', 
            'created_at', 'is_system_message', 'receipts'
        ]
        read_only_fields = ['created_at', 'receipts']
    
    def get_sender_name(self, obj):
        if obj.is_system_message:
            return 'System'
        if not obj.sender:
            return 'Unknown'
        return obj.sender.get_full_name() if hasattr(obj.sender, 'get_full_name') else obj.sender.email


class ChatRoomSerializer(serializers.ModelSerializer):
    participants_details = UserSerializer(source='participants', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'name', 'room_type', 'created_at', 'updated_at',
            'participants', 'participants_details', 'is_active',
            'related_job_application', 'last_message', 'unread_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_message', 'unread_count']
    
    def get_last_message(self, obj):
        """Get the most recent message in this room"""
        message = obj.messages.order_by('-created_at').first()
        if message:
            return {
                'id': message.id,
                'content': message.content,
                'sender_id': message.sender.id if message.sender else None,
                'sender_name': message.sender.get_full_name() if message.sender and hasattr(message.sender, 'get_full_name') else 
                             message.sender.email if message.sender else 'System',
                'created_at': message.created_at,
            }
        return None
    
    def get_unread_count(self, obj):
        """Get count of unread messages for the current user"""
        user = self.context['request'].user if 'request' in self.context else None
        if not user:
            return 0
            
        # Find messages in this room where the user is a recipient and hasn't read them
        unread_count = MessageReceipt.objects.filter(
            message__room=obj,
            recipient=user,
            read=False
        ).count()
        
        return unread_count


class CreateChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for creating a new chat room"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    job_application_id = serializers.IntegerField(required=False, write_only=True)
    initial_message = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ['name', 'room_type', 'participant_ids', 'job_application_id', 'initial_message']
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        job_application_id = validated_data.pop('job_application_id', None)
        initial_message = validated_data.pop('initial_message', None)
        
        # Create the chat room
        chat_room = ChatRoom.objects.create(**validated_data)
        
        # Add creator as participant
        user = self.context['request'].user
        chat_room.participants.add(user)
        
        # Add other participants
        if participant_ids:
            User = get_user_model()
            participants = User.objects.filter(id__in=participant_ids)
            chat_room.participants.add(*participants)
        
        # Add job application if provided
        if job_application_id:
            from jobs.models import JobApplication
            try:
                job_application = JobApplication.objects.get(id=job_application_id)
                chat_room.related_job_application = job_application
                chat_room.save()
                
                # If candidate is not in participants, add them
                candidate_user = job_application.candidate.user
                if candidate_user and candidate_user not in chat_room.participants.all():
                    chat_room.participants.add(candidate_user)
            except JobApplication.DoesNotExist:
                pass
        
        # Create initial message if provided
        if initial_message:
            message = ChatMessage.objects.create(
                room=chat_room,
                sender=user,
                content=initial_message
            )
            
            # Create receipts for all participants except sender
            for participant in chat_room.participants.exclude(id=user.id):
                MessageReceipt.objects.create(
                    message=message,
                    recipient=participant
                )
        
        return chat_room 