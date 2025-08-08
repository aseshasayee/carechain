"""
URL patterns for the accounts app.
"""

from django.urls import path
from .views import (
    RegisterUserView,
    VerifyEmailView,
    UserProfileView,
    ChangePasswordView,
    LoginView,
    PublicStatisticsView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('statistics/', PublicStatisticsView.as_view(), name='public-statistics'),
]