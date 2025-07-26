"""
Serializers for the attendance app.
"""

from rest_framework import serializers
from .models import Attendance, AbsenceNotification, AttendanceSummary


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for the Attendance model."""
    
    candidate_name = serializers.CharField(source='profile.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'profile', 'candidate_name', 'job', 'job_title',
            'date', 'status', 'check_in_time', 'check_out_time', 'reason'
        ]
        read_only_fields = ['profile']


class AbsenceNotificationSerializer(serializers.ModelSerializer):
    """Serializer for the AbsenceNotification model."""
    
    candidate_name = serializers.CharField(source='active_job.profile.full_name', read_only=True)
    job_title = serializers.CharField(source='active_job.job.title', read_only=True)
    
    class Meta:
        model = AbsenceNotification
        fields = [
            'id', 'active_job', 'candidate_name', 'job_title',
            'date', 'reason', 'created_at', 'auto_fill_triggered'
        ]
        read_only_fields = ['created_at', 'auto_fill_triggered']


class AttendanceSummarySerializer(serializers.ModelSerializer):
    """Serializer for the AttendanceSummary model."""
    
    candidate_name = serializers.CharField(source='profile.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    month_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'profile', 'candidate_name', 'job', 'job_title',
            'month', 'month_name', 'year', 'total_days', 'present_days',
            'absent_days', 'late_days', 'attendance_percentage'
        ]
    
    def get_month_name(self, obj):
        """Return the month name."""
        months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return months[obj.month - 1] 