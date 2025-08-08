"""
Serializers for employee management.
"""

from rest_framework import serializers
from .models import Employment, EmployeeAvailability, EmployeePerformance, AbsenceRequest
from profiles.models import CandidateProfile, RecruiterProfile
from profiles.serializers import CandidateProfileSerializer


class EmploymentSerializer(serializers.ModelSerializer):
    """Serializer for employment records."""
    
    employee_name = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()
    employer_name = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Employment
        fields = [
            'id', 'employee', 'employer', 'hospital', 'job_title', 'department',
            'employment_type', 'start_date', 'end_date', 'salary', 'status',
            'notes', 'created_at', 'updated_at', 'employee_name', 'hospital_name',
            'employer_name', 'duration'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'employer', 'hospital']
    
    def get_employee_name(self, obj):
        """Get formatted employee name."""
        return f"{obj.employee.first_name} {obj.employee.last_name}"
    
    def get_hospital_name(self, obj):
        """Get hospital name."""
        return obj.hospital.name if obj.hospital else None
    
    def get_employer_name(self, obj):
        """Get employer name."""
        if obj.employer and obj.employer.user:
            return f"{obj.employer.user.first_name} {obj.employer.user.last_name}"
        return None
    
    def get_duration(self, obj):
        """Calculate employment duration."""
        if obj.end_date:
            duration = obj.end_date - obj.start_date
        else:
            from django.utils import timezone
            duration = timezone.now().date() - obj.start_date
        
        days = duration.days
        if days < 30:
            return f"{days} days"
        elif days < 365:
            months = days // 30
            return f"{months} months"
        else:
            years = days // 365
            months = (days % 365) // 30
            if months > 0:
                return f"{years} years, {months} months"
            return f"{years} years"


class EmployeeAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for employee availability."""
    
    employee_name = serializers.SerializerMethodField()
    employment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeeAvailability
        fields = [
            'id', 'employment', 'date', 'shift', 'status', 'notes',
            'created_at', 'updated_at', 'employee_name', 'employment_info'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        """Get formatted employee name."""
        return f"{obj.employment.employee.first_name} {obj.employment.employee.last_name}"
    
    def get_employment_info(self, obj):
        """Get employment information."""
        return {
            'job_title': obj.employment.job_title,
            'department': obj.employment.department,
            'hospital': obj.employment.hospital.name if obj.employment.hospital else None
        }


class EmployeePerformanceSerializer(serializers.ModelSerializer):
    """Serializer for employee performance reviews."""
    
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    employment_info = serializers.SerializerMethodField()
    
    class Meta:
        model = EmployeePerformance
        fields = [
            'id', 'employment', 'review_date', 'review_type', 'overall_rating',
            'clinical_skills', 'communication', 'teamwork', 'punctuality',
            'patient_care', 'strengths', 'areas_for_improvement', 'goals',
            'reviewer', 'created_at', 'updated_at', 'employee_name',
            'reviewer_name', 'employment_info'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'reviewer']
    
    def get_employee_name(self, obj):
        """Get formatted employee name."""
        return f"{obj.employment.employee.first_name} {obj.employment.employee.last_name}"
    
    def get_reviewer_name(self, obj):
        """Get reviewer name."""
        if obj.reviewer:
            return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
        return None
    
    def get_employment_info(self, obj):
        """Get employment information."""
        return {
            'job_title': obj.employment.job_title,
            'department': obj.employment.department,
            'hospital': obj.employment.hospital.name if obj.employment.hospital else None
        }


class AbsenceRequestSerializer(serializers.ModelSerializer):
    """Serializer for absence requests."""
    
    employee_name = serializers.SerializerMethodField()
    requested_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    employment_info = serializers.SerializerMethodField()
    duration_days = serializers.SerializerMethodField()
    
    class Meta:
        model = AbsenceRequest
        fields = [
            'id', 'employment', 'absence_type', 'start_date', 'end_date',
            'reason', 'status', 'requested_by', 'request_date', 'approved_by',
            'approval_date', 'approval_notes', 'created_at', 'updated_at',
            'employee_name', 'requested_by_name', 'approved_by_name',
            'employment_info', 'duration_days'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'requested_by', 'request_date',
            'approved_by', 'approval_date', 'approval_notes'
        ]
    
    def get_employee_name(self, obj):
        """Get formatted employee name."""
        return f"{obj.employment.employee.first_name} {obj.employment.employee.last_name}"
    
    def get_requested_by_name(self, obj):
        """Get requester name."""
        if obj.requested_by:
            return f"{obj.requested_by.first_name} {obj.requested_by.last_name}"
        return None
    
    def get_approved_by_name(self, obj):
        """Get approver name."""
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
        return None
    
    def get_employment_info(self, obj):
        """Get employment information."""
        return {
            'job_title': obj.employment.job_title,
            'department': obj.employment.department,
            'hospital': obj.employment.hospital.name if obj.employment.hospital else None
        }
    
    def get_duration_days(self, obj):
        """Calculate duration in days."""
        if obj.start_date and obj.end_date:
            return (obj.end_date - obj.start_date).days + 1
        return 1


class EmploymentSummarySerializer(serializers.Serializer):
    """Serializer for employment summary statistics."""
    
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    on_leave = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    departments = serializers.ListField(child=serializers.CharField())
    recent_hires = serializers.ListField(child=EmploymentSerializer())
    performance_average = serializers.FloatField()


class AvailabilityScheduleSerializer(serializers.Serializer):
    """Serializer for availability schedule view."""
    
    date = serializers.DateField()
    morning_shift = serializers.ListField(child=serializers.CharField())
    afternoon_shift = serializers.ListField(child=serializers.CharField())
    night_shift = serializers.ListField(child=serializers.CharField())
    full_day = serializers.ListField(child=serializers.CharField())
    unavailable = serializers.ListField(child=serializers.CharField())
