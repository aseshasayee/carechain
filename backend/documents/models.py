"""
Models for the documents app.
"""

from django.db import models
from django.conf import settings
from profiles.models import CandidateProfile


class SupportingDocument(models.Model):
    """Model for storing supporting documents."""
    
    DOCUMENT_TYPES = (
        ('certificate', 'Certificate'),
        ('marksheet', 'Marksheet'),
        ('license', 'License'),
        ('identity', 'Identity Proof'),
        ('experience', 'Experience Certificate'),
        ('other', 'Other'),
    )
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='supporting_documents'
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.document_type} - {self.title}"


class Licensure(models.Model):
    """Model for storing licensure information."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='licensures'
    )
    registration_number = models.CharField(max_length=100)
    authority = models.CharField(max_length=255)
    valid_from = models.DateField()
    valid_through = models.DateField()
    supporting_doc = models.ForeignKey(
        SupportingDocument, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='licensure_docs'
    )
    
    def __str__(self):
        return f"{self.registration_number} - {self.authority}"


class QualificationMaster(models.Model):
    """Master data for qualifications."""
    
    name = models.CharField(max_length=255)
    abbreviation = models.CharField(max_length=20)
    is_medical = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class Qualification(models.Model):
    """Model for storing qualification information."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='qualifications'
    )
    degree = models.ForeignKey(
        QualificationMaster, 
        on_delete=models.CASCADE
    )
    institution = models.CharField(max_length=255)
    year_of_graduation = models.PositiveIntegerField()
    country = models.CharField(max_length=100)
    supporting_doc = models.ForeignKey(
        SupportingDocument, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='qualification_docs'
    )
    
    def __str__(self):
        return f"{self.degree.name} - {self.institution} ({self.year_of_graduation})"


class SkillMaster(models.Model):
    """Master data for skills."""
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    """Model for storing skill information."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='skills'
    )
    skill_name = models.ForeignKey(
        SkillMaster, 
        on_delete=models.CASCADE
    )
    years_experience = models.PositiveIntegerField()
    certifying_authority = models.CharField(max_length=255, null=True, blank=True)
    valid_till = models.DateField(null=True, blank=True)
    supporting_doc = models.ForeignKey(
        SupportingDocument, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='skill_docs'
    )
    
    def __str__(self):
        return f"{self.skill_name.name} ({self.years_experience} years)" 