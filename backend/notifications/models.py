"""
Models for the notifications app.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    """
    General notification model for system notifications.
    """
    NOTIFICATION_TYPES = (
        ('job_application', 'Job Application'),
        ('application_status', 'Application Status Update'),
        ('job_invitation', 'Job Invitation'),
        ('verification_status', 'Verification Status Update'),
        ('message', 'New Message'),
        ('general', 'General Notification'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    content = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='general')
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    related_job = models.ForeignKey('jobs.Job', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    related_job_application = models.ForeignKey('jobs.JobApplication', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'read']),
        ]
    
    def __str__(self):
        return f"Notification for {self.user}: {self.content[:50]}"

    def mark_as_read(self):
        if not self.read:
            self.read = True
            self.read_at = timezone.now()
            self.save(update_fields=['read', 'read_at'])


class EmailNotification(models.Model):
    """
    Model to track email notifications sent to users.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_notifications')
    subject = models.CharField(max_length=255)
    content = models.TextField()
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(default=timezone.now)
    error_message = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Email to {self.user}: {self.subject}"


# Completely redesigned messaging system
class ChatRoom(models.Model):
    """
    Represents a chat room or conversation between users.
    """
    ROOM_TYPES = (
        ('direct', 'Direct Message'),
        ('group', 'Group Chat'),
        ('system', 'System Messages'),
    )
    
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default='direct')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    is_active = models.BooleanField(default=True)
    
    # Optional - link to relevant entities
    related_job_application = models.ForeignKey('jobs.JobApplication', on_delete=models.SET_NULL, 
                                              null=True, blank=True, related_name='chat_rooms')
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['-updated_at']),
            models.Index(fields=['room_type']),
        ]
    
    def __str__(self):
        return f"{self.get_room_type_display()}: {self.name}"


class ChatMessage(models.Model):
    """
    Individual message in a chat.
    """
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_chat_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # For system messages or special cases
    is_system_message = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['room', 'created_at']),
            models.Index(fields=['sender']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender} in {self.room.name}"


class MessageReceipt(models.Model):
    """
    Track message delivery and read status for each recipient.
    Separating this from the message allows precise tracking per-user.
    """
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='receipts')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='message_receipts')
    
    # Delivery status
    delivered = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Read status
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('message', 'recipient')
        indexes = [
            models.Index(fields=['recipient', 'read']),
            models.Index(fields=['recipient', 'delivered']),
        ]
    
    def __str__(self):
        status = "Read" if self.read else "Delivered" if self.delivered else "Sent"
        return f"{status} to {self.recipient}"
    
    def mark_delivered(self):
        if not self.delivered:
            self.delivered = True
            self.delivered_at = timezone.now()
            self.save(update_fields=['delivered', 'delivered_at'])
    
    def mark_read(self):
        if not self.read:
            # Ensure delivered is also marked
            if not self.delivered:
                self.delivered = True
                self.delivered_at = timezone.now()
            
            self.read = True
            self.read_at = timezone.now()
            self.save(update_fields=['delivered', 'delivered_at', 'read', 'read_at'])


class UserPresence(models.Model):
    """
    Track user online status for real-time features.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='presence')
    last_seen = models.DateTimeField(default=timezone.now)
    is_online = models.BooleanField(default=False)
    
    # If typing, in which room
    typing_in_room = models.ForeignKey(ChatRoom, on_delete=models.SET_NULL, 
                                       null=True, blank=True, related_name='typing_users')
    last_typing_update = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        status = "Online" if self.is_online else "Offline"
        return f"{self.user} - {status}"
    
    def update_presence(self, is_online=True):
        self.is_online = is_online
        self.last_seen = timezone.now()
        self.save(update_fields=['is_online', 'last_seen'])
    
    def set_typing(self, room=None):
        self.typing_in_room = room
        self.last_typing_update = timezone.now() if room else None
        self.save(update_fields=['typing_in_room', 'last_typing_update']) 