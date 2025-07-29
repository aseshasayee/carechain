from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatRoom
from django.contrib.auth import get_user_model

class ChatRoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        rooms = ChatRoom.objects.filter(participants=user)
        data = []
        for room in rooms:
            # Get the other participant (not the current user)
            others = room.participants.exclude(id=user.id)
            if others.exists():
                other = others.first()
                recipient_name = other.get_full_name() or other.username
                recipient_id = other.id
            else:
                recipient_name = user.get_full_name() or user.username
                recipient_id = user.id
            data.append({
                'id': room.id,
                'name': room.name,
                'recipient_name': recipient_name,
                'recipient_id': recipient_id,
                'participants': [u.username for u in room.participants.all()]
            })
        return Response(data, status=200)
