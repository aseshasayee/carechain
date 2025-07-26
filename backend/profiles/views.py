"""
Views for the profiles app.
"""

from rest_framework import generics, permissions, status
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
    """List all verified candidate profiles."""
    
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return CandidateProfile.objects.filter(verification_status='verified')


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