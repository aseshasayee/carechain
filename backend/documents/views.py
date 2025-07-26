"""
Views for the documents app.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import (
    SupportingDocument,
    Licensure,
    Qualification,
    Skill,
    QualificationMaster,
    SkillMaster
)
from .serializers import (
    SupportingDocumentSerializer,
    LicensureSerializer,
    QualificationSerializer,
    SkillSerializer,
    QualificationMasterSerializer,
    SkillMasterSerializer
)
from profiles.models import CandidateProfile
from profiles.permissions import IsOwnerOrAdmin


class SupportingDocumentListCreateView(generics.ListCreateAPIView):
    """View for listing and creating supporting documents."""
    
    serializer_class = SupportingDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return supporting documents for the authenticated user."""
        return SupportingDocument.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the supporting document with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        serializer.save(profile=candidate_profile)


class SupportingDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting a supporting document."""
    
    serializer_class = SupportingDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """Return supporting documents for the authenticated user."""
        return SupportingDocument.objects.filter(profile__user=self.request.user)


class LicensureListCreateView(generics.ListCreateAPIView):
    """View for listing and creating licensures."""
    
    serializer_class = LicensureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return licensures for the authenticated user."""
        return Licensure.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the licensure with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        serializer.save(profile=candidate_profile)


class LicensureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting a licensure."""
    
    serializer_class = LicensureSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """Return licensures for the authenticated user."""
        return Licensure.objects.filter(profile__user=self.request.user)


class QualificationListCreateView(generics.ListCreateAPIView):
    """View for listing and creating qualifications."""
    
    serializer_class = QualificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return qualifications for the authenticated user."""
        return Qualification.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the qualification with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        serializer.save(profile=candidate_profile)


class QualificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting a qualification."""
    
    serializer_class = QualificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """Return qualifications for the authenticated user."""
        return Qualification.objects.filter(profile__user=self.request.user)


class SkillListCreateView(generics.ListCreateAPIView):
    """View for listing and creating skills."""
    
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return skills for the authenticated user."""
        return Skill.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the skill with the candidate profile."""
        candidate_profile = get_object_or_404(CandidateProfile, user=self.request.user)
        serializer.save(profile=candidate_profile)


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View for retrieving, updating, and deleting a skill."""
    
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        """Return skills for the authenticated user."""
        return Skill.objects.filter(profile__user=self.request.user)


class QualificationMasterListView(generics.ListAPIView):
    """View for listing qualification masters."""
    
    serializer_class = QualificationMasterSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = QualificationMaster.objects.all()


class SkillMasterListView(generics.ListAPIView):
    """View for listing skill masters."""
    
    serializer_class = SkillMasterSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = SkillMaster.objects.all() 