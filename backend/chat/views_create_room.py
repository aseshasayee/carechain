from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatRoom
from django.contrib.auth import get_user_model

class ChatRoomCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        room_name = request.data.get('room_name')
        recipient_id = request.data.get('recipient_id')
        if not room_name or not recipient_id:
            return Response({'error': 'room_name and recipient_id required'}, status=400)
        room, _ = ChatRoom.objects.get_or_create(name=room_name)
        sender = request.user
        User = get_user_model()
        try:
            recipient = User.objects.get(id=recipient_id)
            room.participants.add(sender, recipient)
        except User.DoesNotExist:
            room.participants.add(sender)
        return Response({'room': room.name, 'participants': [u.username for u in room.participants.all()]}, status=201)
