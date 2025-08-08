from django.contrib.auth.hashers import make_password, check_password
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
# Minimal Hospital Registration API
from rest_framework import permissions, authentication

class HospitalRegisterView(APIView):
    """API endpoint for minimal hospital registration with user integration."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        data = request.data
        required_fields = ["name", "registration_number", "contact_no", "password"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for duplicate registration_number
        if Hospital.objects.filter(registration_number=data["registration_number"]).exists():
            return Response({"error": "Registration number already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create hospital record
        hospital = Hospital.objects.create(
            name=data["name"],
            registration_number=data["registration_number"],
            contact_no=data["contact_no"],
            password=make_password(data["password"])
        )
        
        # Create corresponding user account for JWT integration
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user_email = f"hospital_{hospital.registration_number}@system.local"
        user = User.objects.create_user(
            email=user_email,
            password=data["password"],
            first_name=hospital.name,
            is_recruiter=True,
            is_active=True,
            # Add hospital-specific fields if they exist in User model
            hospital_name=hospital.name,
            representative_name=data.get("representative_name", "Administrator"),
            representative_contact=hospital.contact_no
        )
        
        # Create recruiter profile linked to hospital
        recruiter_profile = RecruiterProfile.objects.create(
            user=user,
            hospital=hospital,
            position="Hospital Administrator"
        )
        
        serializer = HospitalSerializer(hospital)
        return Response({
            "hospital": serializer.data,
            "user_id": user.id,
            "message": "Hospital registered successfully. You can now login."
        }, status=status.HTTP_201_CREATED)


# Minimal Hospital Login API
class HospitalLoginView(APIView):
    """API endpoint for minimal hospital login with JWT integration."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        data = request.data
        reg_no = data.get("registration_number")
        contact_no = data.get("contact_no")
        password = data.get("password")
        
        if not password or (not reg_no and not contact_no):
            return Response({
                "error": "registration_number or contact_no and password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            if reg_no:
                hospital = Hospital.objects.get(registration_number=reg_no)
            else:
                hospital = Hospital.objects.get(contact_no=contact_no)
        except Hospital.DoesNotExist:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, hospital.password):
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        # Create or get a User instance for JWT token generation
        # This links hospital to the main authentication system
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import RefreshToken
        
        User = get_user_model()
        
        # Try to find existing user or create one
        user_email = f"hospital_{hospital.registration_number}@system.local"
        user, created = User.objects.get_or_create(
            email=user_email,
            defaults={
                'first_name': hospital.name,
                'is_recruiter': True,
                'is_active': True
            }
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Get or create recruiter profile linked to hospital
        recruiter_profile, created = RecruiterProfile.objects.get_or_create(
            user=user,
            defaults={
                'hospital': hospital,
                'position': 'Hospital Administrator'
            }
        )
        
        serializer = HospitalSerializer(hospital)
        return Response({
            "hospital": serializer.data,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "token": access_token,
                "refresh": refresh_token,
                "is_recruiter": True,
                "is_hospital_user": True,
                "role": "hospital"
            },
            "message": "Login successful."
        }, status=status.HTTP_200_OK)
"""
Views for the profiles app.
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from .models import CandidateProfile, RecruiterProfile, JobPreference, Hospital
from .serializers import (
    CandidateProfileSerializer, 
    RecruiterProfileSerializer, 
    JobPreferenceSerializer,
    VerificationStatusSerializer,
    HospitalSerializer
)
from documents.models import SupportingDocument
from .permissions import IsOwnerOrAdmin, IsRecruiterOrAdmin, IsCandidateOwner, IsRecruiterOwner
from admin_api.views import IsAdminUser


class CandidateProfileDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating a candidate's profile."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsCandidateOwner]
    
    def get_object(self):
        """Return the candidate profile for the authenticated user."""
        return get_object_or_404(CandidateProfile, user=self.request.user)


class RecruiterProfileDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating a recruiter's profile."""
    
    serializer_class = RecruiterProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecruiterOwner]
    
    def get_object(self):
        """Return the recruiter profile for the authenticated user."""
        try:
            return RecruiterProfile.objects.get(user=self.request.user)
        except RecruiterProfile.DoesNotExist:
            # If request method is GET, create a new profile
            if self.request.method == 'GET':
                return RecruiterProfile.objects.create(
                    user=self.request.user,
                    position="Recruiter",  # Default position
                    is_verified=False
                )
            else:
                # For other methods, raise 404
                from django.http import Http404
                raise Http404("RecruiterProfile does not exist")


class VerifyAadhaarView(APIView):
    """View for verifying a candidate's Aadhaar number."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Handle POST requests: verify Aadhaar number."""
        if not hasattr(request.user, 'candidate_profile'):
            return Response(
                {"error": "User does not have a candidate profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        aadhaar_number = request.data.get('aadhaar_number')
        if not aadhaar_number:
            return Response(
                {"error": "Aadhaar number is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # In a real application, verify the Aadhaar number with the Aadhaar API
        # For now, just mark it as verified
        
        profile = request.user.candidate_profile
        profile.aadhaar_number = aadhaar_number
        profile.is_aadhaar_verified = True
        profile.save()
        
        return Response(
            {"message": "Aadhaar number verified successfully."},
            status=status.HTTP_200_OK
        )


class JobPreferenceView(generics.RetrieveUpdateAPIView):
    """View for managing a candidate's job preferences."""
    
    serializer_class = JobPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Return the job preference for the authenticated user's candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        preference, created = JobPreference.objects.get_or_create(profile=candidate_profile)
        return preference


class VerificationStatusView(APIView):
    """View for checking a candidate's verification status."""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VerificationStatusSerializer
    
    def get(self, request):
        """Return the verification status of the candidate."""
        if not hasattr(request.user, 'candidate_profile'):
            return Response(
                {"error": "User does not have a candidate profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = request.user.candidate_profile
        
        # Check document uploads
        documents = SupportingDocument.objects.filter(profile=profile)
        has_documents = documents.exists()
        verified_documents = documents.filter(verified=True).count()
        total_documents = documents.count()
        
        # Check profile completeness
        profile_fields = [
            profile.first_name, profile.last_name, profile.dob, 
            profile.gender, profile.contact_number, profile.location
        ]
        profile_complete = all(field for field in profile_fields)
        
        # Check if profile is proof-ready
        is_proof_ready = profile_complete and verified_documents > 0
        
        # Construct the response data
        data = {
            "verification_status": profile.verification_status,  # Include actual verification status
            "profile_complete": profile_complete,
            "has_documents": has_documents,
            "documents_count": total_documents,
            "verified_documents_count": verified_documents,
            "is_proof_ready": is_proof_ready,
            "aadhaar_verified": profile.is_aadhaar_verified
        }
        
        return Response(data, status=status.HTTP_200_OK) 


# Admin verification endpoints
class PendingVerificationsView(generics.ListAPIView):
    """List all pending candidate verifications."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return CandidateProfile.objects.filter(verification_status='pending')


class VerifiedProfilesView(generics.ListAPIView):
    """List all verified candidate profiles. Temporarily open for debugging."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [permissions.AllowAny]  # Open for debugging
    authentication_classes = []  # Disable authentication for debugging
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'specialization', 'bio']
    ordering_fields = ['years_of_experience', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Create a dummy profile if none exist for debugging
        if not CandidateProfile.objects.exists():
            print("No candidate profiles found - creating dummy data")
            # Create minimal data to test the endpoint
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                dummy_user, created = User.objects.get_or_create(
                    email='dummy@test.com',
                    defaults={
                        'first_name': 'Test',
                        'last_name': 'User',
                        'is_candidate': True
                    }
                )
                
                dummy_profile, created = CandidateProfile.objects.get_or_create(
                    user=dummy_user,
                    defaults={
                        'first_name': 'Test',
                        'last_name': 'User',
                        'specialization': 'General Nursing',
                        'years_of_experience': 2,
                        'verification_status': 'verified',
                        'bio': 'Test candidate profile for debugging'
                    }
                )
                print(f"Created dummy profile: {dummy_profile}")
            except Exception as e:
                print(f"Error creating dummy profile: {e}")
        
        # Debug: log request details
        print(f"VerifiedProfilesView accessed by user: {self.request.user}")
        print(f"User authenticated: {self.request.user.is_authenticated}")
        print(f"Authorization header: {self.request.META.get('HTTP_AUTHORIZATION', 'None')}")
        
        # Debug: print all candidate profiles
        all_profiles = CandidateProfile.objects.all()
        print(f"Total candidate profiles: {all_profiles.count()}")
        for profile in all_profiles:
            print(f"Profile: {profile.first_name} {profile.last_name} - Status: {profile.verification_status}")
        
        verified_profiles = CandidateProfile.objects.filter(verification_status='verified')
        print(f"Verified profiles: {verified_profiles.count()}")
        
        return verified_profiles


class RejectedVerificationsView(generics.ListAPIView):
    """List all rejected candidate verifications."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return CandidateProfile.objects.filter(verification_status='rejected')


class PendingHospitalVerificationsView(generics.ListAPIView):
    """List all pending hospital verifications."""
    
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Hospital.objects.filter(verification_status='pending')


class VerifiedHospitalsView(generics.ListAPIView):
    """List all verified hospitals."""
    
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Hospital.objects.filter(verification_status='verified')


class RejectedHospitalVerificationsView(generics.ListAPIView):
    """List all rejected hospital verifications."""
    
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Hospital.objects.filter(verification_status='rejected')


class CandidateDetailsView(generics.RetrieveAPIView):
    """Get detailed candidate profile by ID."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        return get_object_or_404(CandidateProfile, id=self.kwargs['pk'])


class HospitalDetailsView(generics.RetrieveAPIView):
    """Get detailed hospital profile by ID."""
    
    serializer_class = HospitalSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        return get_object_or_404(Hospital, id=self.kwargs['pk'])


class ApproveVerificationView(APIView):
    """Approve a candidate verification."""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        profile = get_object_or_404(CandidateProfile, id=pk)
        profile.verify(request.user)
        return Response({'status': 'success', 'message': 'Verification approved.'})


class RejectVerificationView(APIView):
    """Reject a candidate verification."""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        profile = get_object_or_404(CandidateProfile, id=pk)
        reason = request.data.get('rejection_reason', 'No reason provided')
        profile.reject(request.user, reason)
        return Response({'status': 'success', 'message': 'Verification rejected.'})


class ApproveHospitalVerificationView(APIView):
    """Approve a hospital verification."""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        hospital = get_object_or_404(Hospital, id=pk)
        hospital.verify(request.user)
        return Response({'status': 'success', 'message': 'Hospital verification approved.'})


class RejectHospitalVerificationView(APIView):
    """Reject a hospital verification."""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        hospital = get_object_or_404(Hospital, id=pk)
        reason = request.data.get('rejection_reason', 'No reason provided')
        hospital.reject(request.user, reason)
        return Response({'status': 'success', 'message': 'Hospital verification rejected.'}) 