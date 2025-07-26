"""
URL patterns for the profiles app.
"""

from django.urls import path
from .views import (
    CandidateProfileDetailView,
    RecruiterProfileDetailView,
    PendingVerificationsView,
    VerifiedProfilesView,
    RejectedVerificationsView,
    PendingHospitalVerificationsView,
    VerifiedHospitalsView,
    RejectedHospitalVerificationsView,
    CandidateDetailsView,
    HospitalDetailsView,
    ApproveVerificationView,
    RejectVerificationView,
    ApproveHospitalVerificationView,
    RejectHospitalVerificationView,
    VerificationStatusView,
)

app_name = 'profiles'

urlpatterns = [
    path('candidate/', CandidateProfileDetailView.as_view(), name='candidate'),
    path('recruiter/', RecruiterProfileDetailView.as_view(), name='recruiter'),
    path('verification-status/', VerificationStatusView.as_view(), name='verification_status'),
    
    # Admin verification endpoints
    path('pending-verifications/', PendingVerificationsView.as_view(), name='pending_verifications'),
    path('verified-profiles/', VerifiedProfilesView.as_view(), name='verified_profiles'),
    path('rejected-verifications/', RejectedVerificationsView.as_view(), name='rejected_verifications'),
    path('pending-hospital-verifications/', PendingHospitalVerificationsView.as_view(), name='pending_hospital_verifications'),
    path('verified-hospitals/', VerifiedHospitalsView.as_view(), name='verified_hospitals'),
    path('rejected-hospital-verifications/', RejectedHospitalVerificationsView.as_view(), name='rejected_hospital_verifications'),
    path('candidate-details/<int:pk>/', CandidateDetailsView.as_view(), name='candidate_details'),
    path('hospital-details/<int:pk>/', HospitalDetailsView.as_view(), name='hospital_details'),
    path('approve-verification/<int:pk>/', ApproveVerificationView.as_view(), name='approve_verification'),
    path('reject-verification/<int:pk>/', RejectVerificationView.as_view(), name='reject_verification'),
    path('approve-hospital-verification/<int:pk>/', ApproveHospitalVerificationView.as_view(), name='approve_hospital_verification'),
    path('reject-hospital-verification/<int:pk>/', RejectHospitalVerificationView.as_view(), name='reject_hospital_verification'),
] 