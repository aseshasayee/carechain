from django.db import models
from django.conf import settings



class ChatRoom(models.Model):
    # Unique room for recruiter-candidate pair
    name = models.CharField(max_length=255, unique=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="chat_participants")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}"
