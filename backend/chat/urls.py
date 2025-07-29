
from django.urls import path

from .views import ChatMessageListCreateView
from .views_rooms import ChatRoomListView
from .views_create_room import ChatRoomCreateView

urlpatterns = [
    path('<str:room_name>/messages/', ChatMessageListCreateView.as_view(), name='chat-messages'),
    path('rooms/', ChatRoomListView.as_view(), name='chat-rooms'),
    path('create-room/', ChatRoomCreateView.as_view(), name='chat-create-room'),
]
