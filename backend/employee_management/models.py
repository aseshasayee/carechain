"""
Models for employee management.
"""

from django.db import models
from django.conf import settings
from profiles.models import CandidateProfile, RecruiterProfile, Hospital


class Employment(models.Model):
    """Model for tracking current employment relationships."""
    
    EMPLOYMENT_STATUS = (
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated'),
        ('resigned', 'Resigned'),
        ('completed', 'Completed'),
    )
    
    employee = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='current_employments'
    )
    employer = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name='current_employees'
    )
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='employees'
    )
    job_title = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='active')
    
    # Employment terms
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    employment_type = models.CharField(max_length=50, default='permanent')  # permanent, contract, temporary
    
    # Performance tracking
    performance_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    last_review_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employee', 'employer', 'job_title', 'start_date')
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.job_title} at {self.hospital.name}"


class EmployeeAvailability(models.Model):
    """Model for tracking employee availability for scheduling."""
    
    AVAILABILITY_STATUS = (
        ('available', 'Available'),
        ('unavailable', 'Unavailable'),
        ('busy', 'Busy'),
        ('on_leave', 'On Leave'),
    )
    
    SHIFT_CHOICES = (
        ('morning', 'Morning Shift'),
        ('evening', 'Evening Shift'),
        ('night', 'Night Shift'),
        ('full_day', 'Full Day'),
    )
    
    employment = models.ForeignKey(
        Employment,
        on_delete=models.CASCADE,
        related_name='availability'
    )
    date = models.DateField()
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='full_day')
    status = models.CharField(max_length=20, choices=AVAILABILITY_STATUS, default='available')
    notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employment', 'date', 'shift')
    
    def __str__(self):
        return f"{self.employment.employee.full_name} - {self.date} {self.shift}: {self.status}"


class EmployeePerformance(models.Model):
    """Model for tracking employee performance reviews."""
    
    REVIEW_TYPES = (
        ('monthly', 'Monthly Review'),
        ('quarterly', 'Quarterly Review'),
        ('annual', 'Annual Review'),
        ('project', 'Project Review'),
    )
    
    employment = models.ForeignKey(
        Employment,
        on_delete=models.CASCADE,
        related_name='performance_reviews'
    )
    review_type = models.CharField(max_length=20, choices=REVIEW_TYPES)
    review_date = models.DateField()
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conducted_reviews'
    )
    
    # Performance metrics
    technical_skills = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])  # 1-5 scale
    communication = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    teamwork = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    punctuality = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    professionalism = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2)
    comments = models.TextField()
    improvement_areas = models.TextField(null=True, blank=True)
    achievements = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.employment.employee.full_name} - {self.review_type} ({self.review_date})"


class AbsenceRequest(models.Model):
    """Model for tracking employee absence requests."""
    
    ABSENCE_TYPES = (
        ('sick_leave', 'Sick Leave'),
        ('personal_leave', 'Personal Leave'),
        ('vacation', 'Vacation'),
        ('emergency', 'Emergency'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )
    
    employment = models.ForeignKey(
        Employment,
        on_delete=models.CASCADE,
        related_name='absence_requests'
    )
    absence_type = models.CharField(max_length=20, choices=ABSENCE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Approval workflow
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='absence_requests'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='approved_absences'
    )
    approval_date = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.employment.employee.full_name} - {self.absence_type} ({self.start_date} to {self.end_date})"