from rest_framework import serializers
from profiles.models import HospitalVerification, CandidateVerification

class HospitalVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalVerification
        fields = '__all__'
        read_only_fields = ['status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

class CandidateVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateVerification
        fields = '__all__'
        read_only_fields = ['status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']
