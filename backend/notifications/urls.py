"""
URL patterns for the notifications app.
"""

from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    MarkAllNotificationsReadView,
    EmailNotificationListView,
    ChatRoomListView,
    ChatRoomDetailView,
    ChatMessageListView,
    MarkMessagesReadView,
    ContactsListView,
    DirectMessageView,
    UserPresenceView
)

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark-all-read'),
    
    # Email Notifications
    path('emails/', EmailNotificationListView.as_view(), name='email-notification-list'),
    
    # Chat Rooms
    path('rooms/', ChatRoomListView.as_view(), name='room-list'),
    path('rooms/<int:pk>/', ChatRoomDetailView.as_view(), name='room-detail'),
    
    # Chat Messages
    path('rooms/<int:room_id>/messages/', ChatMessageListView.as_view(), name='room-messages'),
    path('rooms/<int:room_id>/mark-read/', MarkMessagesReadView.as_view(), name='mark-messages-read'),
    
    # Direct Messaging
    path('direct-message/', DirectMessageView.as_view(), name='direct-message'),
    
    # User Presence
    path('presence/', UserPresenceView.as_view(), name='user-presence'),
    
    # Contacts (users with chat history)
    path('contacts/', ContactsListView.as_view(), name='contacts-list'),
] 