"""
ASGI config for carechain project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.jwt_channels_middleware import JWTAuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
import notifications.routing
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'carechain.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(
                notifications.routing.websocket_urlpatterns +
                chat.routing.websocket_urlpatterns
            )
        )
    ),
})