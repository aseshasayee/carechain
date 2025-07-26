"""
Defines WebSocket URL patterns for the notifications app.
"""

from django.urls import path
from .consumers import ChatConsumer

# These patterns will be included in Django's URL resolver
urlpatterns = []

# These patterns will be used by Channels for WebSocket routing
websocket_urlpatterns = [
    # WebSocket endpoint for chat
    path('chat/', ChatConsumer.as_asgi()),
] 