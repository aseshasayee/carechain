"""
Models for the attendance app.
"""

from django.db import models
from profiles.models import CandidateProfile
from jobs.models import Job, ActiveJob


class Attendance(models.Model):
    """Model for storing attendance information."""
    
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
    )
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='attendances'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='attendances'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    
    class Meta:
        unique_together = ('profile', 'job', 'date')
    
    def __str__(self):
        return f"{self.profile} - {self.job.title} - {self.date}"


class AbsenceNotification(models.Model):
    """Model for storing absence notification information."""
    
    active_job = models.ForeignKey(
        ActiveJob, 
        on_delete=models.CASCADE, 
        related_name='absence_notifications'
    )
    date = models.DateField()
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    auto_fill_triggered = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.active_job.profile} - {self.active_job.job.title} - {self.date}"


class AttendanceSummary(models.Model):
    """Model for storing monthly attendance summary."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='attendance_summaries'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='attendance_summaries'
    )
    month = models.PositiveIntegerField()  # 1-12
    year = models.PositiveIntegerField()
    total_days = models.PositiveIntegerField()
    present_days = models.PositiveIntegerField(default=0)
    absent_days = models.PositiveIntegerField(default=0)
    late_days = models.PositiveIntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        unique_together = ('profile', 'job', 'month', 'year')
    
    def __str__(self):
        return f"{self.profile} - {self.job.title} - {self.month}/{self.year}" 