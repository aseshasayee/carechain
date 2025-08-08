"""
Serializers for the profiles app.
"""

from rest_framework import serializers
from .models import CandidateProfile, RecruiterProfile, JobPreference, Hospital
from documents.serializers import SupportingDocumentSerializer


class JobPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for JobPreference model."""
    
    class Meta:
        model = JobPreference
        fields = [
            'id', 'preferred_location', 'preferred_department',
            'preferred_job_type', 'minimum_salary', 'remote_work',
            'willing_to_relocate', 'preferred_shift'
        ]


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Serializer for CandidateProfile model."""
    
    job_preference = JobPreferenceSerializer(read_only=True)
    supporting_documents = SupportingDocumentSerializer(many=True, read_only=True)
    user_email = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'user_email', 'full_name', 'first_name', 'last_name',
            'dob', 'gender', 'contact_number', 'location',
            'aadhaar_number', 'is_aadhaar_verified', 'headline', 'summary',
            'job_preference', 'supporting_documents', 
            'verification_status', 'verification_date', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_aadhaar_verified', 'verification_status', 
                          'verification_date', 'rejection_reason']
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_full_name(self, obj):
        return obj.full_name


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'id', 'name', 'registration_number', 'contact_no', 'password', 'created_at', 'updated_at'
        ]


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """Serializer for RecruiterProfile model."""
    
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.PrimaryKeyRelatedField(
        queryset=Hospital.objects.all(),
        source='hospital',
        required=False,
        allow_null=True
    )
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'user_email', 'user_name', 'hospital', 'hospital_id',
            'position', 'is_verified', 'created_at', 'updated_at',
            'is_profile_complete'
        ]
        read_only_fields = ['user', 'is_verified', 'is_profile_complete']
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else None


class VerificationStatusSerializer(serializers.Serializer):
    """Serializer for verification status updates."""
    
    status = serializers.ChoiceField(choices=['verified', 'rejected'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True) 