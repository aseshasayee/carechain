"""
URL patterns for the documents app.
"""

from django.urls import path
from .views import (
    SupportingDocumentListCreateView,
    SupportingDocumentDetailView,
    LicensureListCreateView,
    LicensureDetailView,
    QualificationListCreateView,
    QualificationDetailView,
    SkillListCreateView,
    SkillDetailView,
    QualificationMasterListView,
    SkillMasterListView,
)

app_name = 'documents'

urlpatterns = [
    # Supporting Documents
    path('supporting-documents/', SupportingDocumentListCreateView.as_view(), name='supporting-document-list'),
    path('supporting-documents/<int:pk>/', SupportingDocumentDetailView.as_view(), name='supporting-document-detail'),
    
    # Licensures
    path('licensures/', LicensureListCreateView.as_view(), name='licensure-list'),
    path('licensures/<int:pk>/', LicensureDetailView.as_view(), name='licensure-detail'),
    
    # Qualifications
    path('qualifications/', QualificationListCreateView.as_view(), name='qualification-list'),
    path('qualifications/<int:pk>/', QualificationDetailView.as_view(), name='qualification-detail'),
    
    # Skills
    path('skills/', SkillListCreateView.as_view(), name='skill-list'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),
    
    # Master Data
    path('qualification-masters/', QualificationMasterListView.as_view(), name='qualification-master-list'),
    path('skill-masters/', SkillMasterListView.as_view(), name='skill-master-list'),
] 