"""
Views for the attendance app.
"""

from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Attendance, AbsenceNotification, AttendanceSummary
from .serializers import (
    AttendanceSerializer,
    AbsenceNotificationSerializer,
    AttendanceSummarySerializer
)
from profiles.models import CandidateProfile
from jobs.models import ActiveJob
from profiles.permissions import IsOwnerOrAdmin


class AttendanceListCreateView(generics.ListCreateAPIView):
    """View for listing and creating attendance records."""
    
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date', 'status']
    ordering_fields = ['date']
    
    def get_queryset(self):
        """Return attendance records based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see attendance for their jobs
            return Attendance.objects.filter(job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own attendance
            return Attendance.objects.filter(profile__user=user)
        else:
            # Admins see all attendance
            return Attendance.objects.all()
    
    def perform_create(self, serializer):
        """Save the attendance record with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        serializer.save(profile=candidate_profile)


class AttendanceDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating an attendance record."""
    
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return attendance records based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see attendance for their jobs
            return Attendance.objects.filter(job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own attendance
            return Attendance.objects.filter(profile__user=user)
        else:
            # Admins see all attendance
            return Attendance.objects.all()


class AbsenceNotificationListCreateView(generics.ListCreateAPIView):
    """View for listing and creating absence notifications."""
    
    serializer_class = AbsenceNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return absence notifications based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see absence notifications for their jobs
            return AbsenceNotification.objects.filter(active_job__job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own absence notifications
            return AbsenceNotification.objects.filter(active_job__profile__user=user)
        else:
            # Admins see all absence notifications
            return AbsenceNotification.objects.all()
    
    def perform_create(self, serializer):
        """Save the absence notification with the active job."""
        active_job_id = self.request.data.get('active_job')
        active_job = get_object_or_404(ActiveJob, id=active_job_id, profile__user=self.request.user)
        serializer.save(active_job=active_job)


class AbsenceNotificationDetailView(generics.RetrieveAPIView):
    """View for retrieving an absence notification."""
    
    serializer_class = AbsenceNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return absence notifications based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see absence notifications for their jobs
            return AbsenceNotification.objects.filter(active_job__job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own absence notifications
            return AbsenceNotification.objects.filter(active_job__profile__user=user)
        else:
            # Admins see all absence notifications
            return AbsenceNotification.objects.all()


class AttendanceSummaryListView(generics.ListAPIView):
    """View for listing attendance summaries."""
    
    serializer_class = AttendanceSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['month', 'year']
    
    def get_queryset(self):
        """Return attendance summaries based on user type."""
        user = self.request.user
        
        if user.is_recruiter:
            # Recruiters see attendance summaries for their jobs
            return AttendanceSummary.objects.filter(job__employer__user=user)
        elif user.is_candidate:
            # Candidates see their own attendance summaries
            return AttendanceSummary.objects.filter(profile__user=user)
        else:
            # Admins see all attendance summaries
            return AttendanceSummary.objects.all() 