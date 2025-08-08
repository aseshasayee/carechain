"""
URL patterns for the profiles app.
"""

from django.urls import path
from .views import (
    CandidateProfileDetailView,
    RecruiterProfileDetailView,
    VerificationStatusView,
    HospitalRegisterView,
    HospitalLoginView,
    VerifiedProfilesView,
    PendingVerificationsView,
    RejectedVerificationsView,
    CandidateDetailsView,
    HospitalDetailsView,
    ApproveVerificationView,
    RejectVerificationView,
    PendingHospitalVerificationsView,
    VerifiedHospitalsView,
    RejectedHospitalVerificationsView,
    ApproveHospitalVerificationView,
    RejectHospitalVerificationView,
)
from .verification_views import (
    HospitalVerificationCreateView,
    CandidateVerificationCreateView,
    HospitalVerificationDetailView,
    CandidateVerificationDetailView,
    AdminHospitalVerificationListView,
    AdminCandidateVerificationListView,
    AdminHospitalVerificationApproveView,
    AdminHospitalVerificationRejectView,
    AdminCandidateVerificationApproveView,
    AdminCandidateVerificationRejectView,
)

app_name = 'profiles'

urlpatterns = [
    path('candidate/', CandidateProfileDetailView.as_view(), name='candidate'),
    path('recruiter/', RecruiterProfileDetailView.as_view(), name='recruiter'),
    path('verification-status/', VerificationStatusView.as_view(), name='verification_status'),
    path('verified-profiles/', VerifiedProfilesView.as_view(), name='verified_profiles'),
    path('hospital-register/', HospitalRegisterView.as_view(), name='hospital_register'),
    path('hospital-login/', HospitalLoginView.as_view(), name='hospital_login'),

    # Admin verification endpoints
    path('pending-verifications/', PendingVerificationsView.as_view(), name='pending_verifications'),
    path('rejected-verifications/', RejectedVerificationsView.as_view(), name='rejected_verifications'),
    path('candidate/<int:pk>/', CandidateDetailsView.as_view(), name='candidate_details'),
    path('hospital/<int:pk>/', HospitalDetailsView.as_view(), name='hospital_details'),
    path('approve-verification/<int:pk>/', ApproveVerificationView.as_view(), name='approve_verification'),
    path('reject-verification/<int:pk>/', RejectVerificationView.as_view(), name='reject_verification'),
    
    # Hospital verification endpoints
    path('pending-hospital-verifications/', PendingHospitalVerificationsView.as_view(), name='pending_hospital_verifications'),
    path('verified-hospitals/', VerifiedHospitalsView.as_view(), name='verified_hospitals'),
    path('rejected-hospital-verifications/', RejectedHospitalVerificationsView.as_view(), name='rejected_hospital_verifications'),
    path('approve-hospital-verification/<int:pk>/', ApproveHospitalVerificationView.as_view(), name='approve_hospital_verification'),
    path('reject-hospital-verification/<int:pk>/', RejectHospitalVerificationView.as_view(), name='reject_hospital_verification'),

    # New verification endpoints
    path('hospital-verification/', HospitalVerificationCreateView.as_view(), name='hospital_verification_create'),
    path('candidate-verification/', CandidateVerificationCreateView.as_view(), name='candidate_verification_create'),
    path('hospital-verification/<int:pk>/', HospitalVerificationDetailView.as_view(), name='hospital_verification_detail'),
    path('candidate-verification/<int:pk>/', CandidateVerificationDetailView.as_view(), name='candidate_verification_detail'),

    # Admin endpoints
    path('admin/hospital-verifications/', AdminHospitalVerificationListView.as_view(), name='admin_hospital_verification_list'),
    path('admin/candidate-verifications/', AdminCandidateVerificationListView.as_view(), name='admin_candidate_verification_list'),
    path('admin/hospital-verification/<int:pk>/approve/', AdminHospitalVerificationApproveView.as_view(), name='admin_hospital_verification_approve'),
    path('admin/hospital-verification/<int:pk>/reject/', AdminHospitalVerificationRejectView.as_view(), name='admin_hospital_verification_reject'),
    path('admin/candidate-verification/<int:pk>/approve/', AdminCandidateVerificationApproveView.as_view(), name='admin_candidate_verification_approve'),
    path('admin/candidate-verification/<int:pk>/reject/', AdminCandidateVerificationRejectView.as_view(), name='admin_candidate_verification_reject'),
]