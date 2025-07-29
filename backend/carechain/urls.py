"""
URL Configuration for carechain project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/testimonials/', include('testimonials.urls')),
    path('api/admin/', include('admin_api.urls')),
    path('api/chat/', include('chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)