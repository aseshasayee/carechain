"""
Models for the testimonials app.
"""

from django.db import models
from profiles.models import CandidateProfile
from jobs.models import ActiveJob, Job


class Testimonial(models.Model):
    """Model for storing testimonial information."""
    
    TYPE_CHOICES = (
        ('end_of_shift', 'End of Shift'),
        ('end_of_job', 'End of Job'),
        ('periodic', 'Periodic Review'),
        ('other', 'Other'),
    )
    
    active_job = models.ForeignKey(
        ActiveJob, 
        on_delete=models.CASCADE, 
        related_name='testimonials'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='testimonials'
    )
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='testimonials'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.profile} - {self.job.title} - {self.type}"


class FeedbackCategory(models.Model):
    """Model for storing feedback categories."""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    def __str__(self):
        return self.name


class CandidateFeedback(models.Model):
    """Model for storing candidate feedback."""
    
    active_job = models.ForeignKey(
        ActiveJob, 
        on_delete=models.CASCADE, 
        related_name='candidate_feedbacks'
    )
    category = models.ForeignKey(
        FeedbackCategory, 
        on_delete=models.CASCADE, 
        related_name='candidate_feedbacks'
    )
    rating = models.PositiveIntegerField()  # Scale of 1-5
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.active_job.profile} - {self.category.name} - {self.rating}"


class RecruiterFeedback(models.Model):
    """Model for storing recruiter feedback."""
    
    active_job = models.ForeignKey(
        ActiveJob, 
        on_delete=models.CASCADE, 
        related_name='recruiter_feedbacks'
    )
    category = models.ForeignKey(
        FeedbackCategory, 
        on_delete=models.CASCADE, 
        related_name='recruiter_feedbacks'
    )
    rating = models.PositiveIntegerField()  # Scale of 1-5
    comments = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.active_job.job.employer} - {self.category.name} - {self.rating}" 