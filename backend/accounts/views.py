"""
Views for the accounts app.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
import datetime
from django.conf import settings
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    PasswordChangeSerializer,
    EmailVerificationSerializer,
    LoginSerializer,
)
from profiles.models import CandidateProfile, RecruiterProfile
from profiles.serializers import CandidateProfileSerializer

User = get_user_model()


class RegisterUserView(generics.CreateAPIView):
    """View for registering a new user."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests: create user and send verification email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate verification token
        token_payload = {
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # In a real application, send email with verification link here
        # For now, just return the token in the response
        
        return Response({
            'user': UserSerializer(user).data,
            'verification_token': token,
            'message': 'User registered successfully. Please verify your email.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Unified login for any user type."""
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(email=email, password=password)
        if user is None:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'error': 'Account is disabled'}, status=status.HTTP_401_UNAUTHORIZED)
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'token': access_token,
            'refresh': refresh_token,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'is_recruiter': getattr(user, 'is_recruiter', False),
            'is_candidate': getattr(user, 'is_candidate', False),
            'role': 'admin' if user.is_superuser or user.is_staff else ('recruiter' if getattr(user, 'is_recruiter', False) else 'candidate'),
        }
        # Optionally add profile info
        if getattr(user, 'is_candidate', False):
            try:
                profile = CandidateProfile.objects.get(user=user)
                data['profile'] = CandidateProfileSerializer(profile).data
            except CandidateProfile.DoesNotExist:
                pass
        if getattr(user, 'is_recruiter', False):
            try:
                profile = RecruiterProfile.objects.get(user=user)
                data['recruiter_profile'] = profile.id
            except RecruiterProfile.DoesNotExist:
                pass
        return Response(data, status=status.HTTP_200_OK)


class AdminLoginView(APIView):
    """View for admin login."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests: authenticate admin and return tokens."""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid email or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_staff and not user.is_superuser:
            return Response(
                {'error': 'Account does not have admin privileges'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'token': access_token,
            'is_superuser': user.is_superuser,
        }
                
        return Response(data, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    """View for verifying a user's email."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailVerificationSerializer
    
    def post(self, request):
        """Handle POST requests: verify email token."""
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['token']
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user = User.objects.get(id=payload['user_id'])
            
            if not user.is_email_verified:
                user.is_email_verified = True
                user.save()
                return Response({'message': 'Email successfully verified.'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Email already verified.'}, status=status.HTTP_200_OK)
                
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Verification link expired.'}, status=status.HTTP_400_BAD_REQUEST)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating a user's profile."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Return the user making the request."""
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """View for changing a user's password."""
    
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        """Handle PUT requests: change password."""
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set the new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)