from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import User, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    PasswordResetRequestSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create email verification token
        verification_token = EmailVerificationToken.objects.create(user=user)
        
        # TODO: Send email verification (for now, return token in response for testing)
        return Response({
            'message': 'Registration successful. Please verify your email.',
            'verification_token': str(verification_token.token),  # Remove in production
            'user_id': str(user.id)
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        try:
            verification = EmailVerificationToken.objects.get(
                token=token, 
                is_used=False
            )
            verification.user.is_email_verified = True
            verification.user.save()
            verification.is_used = True
            verification.save()
            
            return Response({'message': 'Email verified successfully'})
        except EmailVerificationToken.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Create password reset token
        reset_token = PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # TODO: Send email with reset link
        return Response({
            'message': 'Password reset email sent',
            'reset_token': str(reset_token.token)  # Remove in production
        })


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            new_password = request.data.get('new_password')
            if not new_password:
                return Response(
                    {'error': 'New password is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            return Response({'message': 'Password reset successful'})
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'error': 'Invalid or expired token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
