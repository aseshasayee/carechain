"""
Serializers for the documents app.
"""

from rest_framework import serializers
from .models import (
    SupportingDocument,
    Licensure,
    Qualification,
    Skill,
    QualificationMaster,
    SkillMaster
)


class SupportingDocumentSerializer(serializers.ModelSerializer):
    """Serializer for the SupportingDocument model."""
    
    class Meta:
        model = SupportingDocument
        fields = [
            'id', 'profile', 'document_type', 'title', 'description',
            'file', 'uploaded_at', 'verified'
        ]
        read_only_fields = ['profile', 'uploaded_at', 'verified']


class LicensureSerializer(serializers.ModelSerializer):
    """Serializer for the Licensure model."""
    
    class Meta:
        model = Licensure
        fields = [
            'id', 'profile', 'registration_number', 'authority',
            'valid_from', 'valid_through', 'supporting_doc'
        ]
        read_only_fields = ['profile']


class QualificationMasterSerializer(serializers.ModelSerializer):
    """Serializer for the QualificationMaster model."""
    
    class Meta:
        model = QualificationMaster
        fields = ['id', 'name', 'abbreviation', 'is_medical']


class QualificationSerializer(serializers.ModelSerializer):
    """Serializer for the Qualification model."""
    
    degree_name = serializers.CharField(source='degree.name', read_only=True)
    
    class Meta:
        model = Qualification
        fields = [
            'id', 'profile', 'degree', 'degree_name', 'institution',
            'year_of_graduation', 'country', 'supporting_doc'
        ]
        read_only_fields = ['profile']


class SkillMasterSerializer(serializers.ModelSerializer):
    """Serializer for the SkillMaster model."""
    
    class Meta:
        model = SkillMaster
        fields = ['id', 'name', 'category']


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for the Skill model."""
    
    skill_name_text = serializers.CharField(source='skill_name.name', read_only=True)
    
    class Meta:
        model = Skill
        fields = [
            'id', 'profile', 'skill_name', 'skill_name_text', 'years_experience',
            'certifying_authority', 'valid_till', 'supporting_doc'
        ]
        read_only_fields = ['profile'] 