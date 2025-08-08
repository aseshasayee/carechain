from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from profiles.models import HospitalVerification, CandidateVerification, Hospital, CandidateProfile
from django.utils import timezone
from profiles.verification_serializers import HospitalVerificationSerializer, CandidateVerificationSerializer
from admin_api.views import IsAdminUser

class HospitalVerificationCreateView(generics.CreateAPIView):
    queryset = HospitalVerification.objects.all()
    serializer_class = HospitalVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        hospital = get_object_or_404(Hospital, id=self.request.data.get('hospital'))
        serializer.save(hospital=hospital)

class CandidateVerificationCreateView(generics.CreateAPIView):
    queryset = CandidateVerification.objects.all()
    serializer_class = CandidateVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        candidate = get_object_or_404(CandidateProfile, id=self.request.data.get('candidate'))
        serializer.save(candidate=candidate)

class HospitalVerificationDetailView(generics.RetrieveUpdateAPIView):
    queryset = HospitalVerification.objects.all()
    serializer_class = HospitalVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CandidateVerificationDetailView(generics.RetrieveUpdateAPIView):
    queryset = CandidateVerification.objects.all()
    serializer_class = CandidateVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

# Admin endpoints for review
class AdminHospitalVerificationListView(generics.ListAPIView):
    queryset = HospitalVerification.objects.all()
    serializer_class = HospitalVerificationSerializer
    permission_classes = [IsAdminUser]

class AdminCandidateVerificationListView(generics.ListAPIView):
    queryset = CandidateVerification.objects.all()
    serializer_class = CandidateVerificationSerializer
    permission_classes = [IsAdminUser]

class AdminHospitalVerificationApproveView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        verification = get_object_or_404(HospitalVerification, pk=pk)
        verification.status = 'approved'
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        verification.save()
        return Response({'status': 'success', 'message': 'Hospital verification approved.'})

class AdminHospitalVerificationRejectView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        verification = get_object_or_404(HospitalVerification, pk=pk)
        verification.status = 'rejected'
        verification.admin_notes = request.data.get('admin_notes', '')
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        verification.save()
        return Response({'status': 'success', 'message': 'Hospital verification rejected.'})

class AdminCandidateVerificationApproveView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        verification = get_object_or_404(CandidateVerification, pk=pk)
        verification.status = 'approved'
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        verification.save()
        return Response({'status': 'success', 'message': 'Candidate verification approved.'})

class AdminCandidateVerificationRejectView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        verification = get_object_or_404(CandidateVerification, pk=pk)
        verification.status = 'rejected'
        verification.admin_notes = request.data.get('admin_notes', '')
        verification.reviewed_by = request.user
        verification.reviewed_at = timezone.now()
        verification.save()
        return Response({'status': 'success', 'message': 'Candidate verification rejected.'})
