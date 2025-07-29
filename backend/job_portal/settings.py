# settings.py

# ...existing code...

# Channels/Redis settings
INSTALLED_APPS += [
    'channels',
    'chat',
]
ASGI_APPLICATION = 'job_portal.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

# ...existing code...