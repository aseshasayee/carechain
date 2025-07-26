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
    RecruiterLoginView,
    AdminLoginView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('recruiter-login/', RecruiterLoginView.as_view(), name='recruiter_login'),
    path('admin-login/', AdminLoginView.as_view(), name='admin_login'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
] 