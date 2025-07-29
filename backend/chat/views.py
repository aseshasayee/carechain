from rest_framework import generics, permissions
from .models import ChatMessage, ChatRoom
from .serializers import ChatMessageSerializer
from django.shortcuts import get_object_or_404

class ChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        room_name = self.kwargs['room_name']
        try:
            room = ChatRoom.objects.get(name=room_name)
        except ChatRoom.DoesNotExist:
            return ChatMessage.objects.none()
        return ChatMessage.objects.filter(room=room).order_by('timestamp')

    def perform_create(self, serializer):
        room_name = self.kwargs['room_name']
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        sender = self.request.user
        # Try to extract recipient from request data (assume frontend sends 'recipient_id')
        recipient_id = self.request.data.get('recipient_id')
        if recipient_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                recipient = User.objects.get(id=recipient_id)
                room.participants.add(sender, recipient)
            except User.DoesNotExist:
                room.participants.add(sender)
        else:
            room.participants.add(sender)
        serializer.save(sender=sender, room=room)
