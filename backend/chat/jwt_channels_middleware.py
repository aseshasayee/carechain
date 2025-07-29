import jwt

from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack


@database_sync_to_async
def get_user(validated_token):
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        user = jwt_auth.get_user(validated_token)
        return user
    except Exception:
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Get the token from the query string (?token=...)
        query_string = scope.get('query_string', b'').decode()
        token = None
        if query_string:
            params = parse_qs(query_string)
            token_list = params.get('token')
            if token_list:
                token = token_list[0]
        if token:
            try:
                from rest_framework_simplejwt.tokens import UntypedToken
                from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
                import jwt
                validated_token = UntypedToken(token)
                scope['user'] = await get_user(validated_token)
            except Exception:
                from django.contrib.auth.models import AnonymousUser
                scope['user'] = AnonymousUser()
        else:
            from django.contrib.auth.models import AnonymousUser
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
