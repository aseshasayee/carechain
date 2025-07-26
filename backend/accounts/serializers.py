"""
Serializers for the accounts app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_recruiter', 
                  'is_candidate', 'is_email_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_email_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 
                  'is_recruiter', 'is_candidate']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate(self, attrs):
        """Check that the two password fields match if password2 is provided."""
        if 'password2' in attrs and attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Ensure user is either a recruiter or candidate, but not both
        if attrs.get('is_recruiter') and attrs.get('is_candidate'):
            raise serializers.ValidationError(
                {"user_type": "User cannot be both recruiter and candidate."}
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create and return a new user."""
        # Remove password2 if it exists as it's not needed for user creation
        if 'password2' in validated_data:
            validated_data.pop('password2')
        
        # Create the user with the validated data
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_current_password(self, value):
        """Check if the current password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    
    token = serializers.CharField(required=True) 