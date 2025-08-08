"""
Custom authentication backends for the accounts app.
"""

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class EmailBackend(BaseBackend):
    """
    Custom authentication backend that allows users to authenticate using their email address.
    """
    
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        """
        Authenticate a user by email and password.
        """
        # Handle both email and username parameters for flexibility
        email = email or username
        
        if not email or not password:
            return None
            
        try:
            # Try to get user by email
            user = User.objects.get(email=email)
            
            # Debug: Check if user exists and is active
            print(f"Found user: {user.email}, is_active: {user.is_active}")
            
            # Check if the password is correct
            if user.check_password(password):
                print(f"Password check passed for user: {user.email}")
                return user
            else:
                print(f"Password check failed for user: {user.email}")
                
        except User.DoesNotExist:
            # User with this email doesn't exist
            print(f"User with email {email} does not exist")
            return None
            
        return None
    
    def get_user(self, user_id):
        """
        Get a user by their ID.
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
