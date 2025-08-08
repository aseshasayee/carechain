"""
Models for job matching and recommendation system.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from profiles.models import CandidateProfile, RecruiterProfile, Hospital
from jobs.models import Job, JobApplication


class MatchingCriteria(models.Model):
    """Model to store matching criteria for different job types."""
    
    job_type = models.CharField(max_length=100)
    required_skills = models.JSONField(default=list, help_text="List of required skills")
    preferred_skills = models.JSONField(default=list, help_text="List of preferred skills")
    min_experience = models.IntegerField(default=0, help_text="Minimum years of experience")
    education_requirements = models.JSONField(default=list, help_text="Education requirements")
    certifications = models.JSONField(default=list, help_text="Required certifications")
    location_weight = models.FloatField(
        default=0.3,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Weight for location matching (0-1)"
    )
    skills_weight = models.FloatField(
        default=0.4,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Weight for skills matching (0-1)"
    )
    experience_weight = models.FloatField(
        default=0.2,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Weight for experience matching (0-1)"
    )
    education_weight = models.FloatField(
        default=0.1,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Weight for education matching (0-1)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['job_type']
        verbose_name = "Matching Criteria"
        verbose_name_plural = "Matching Criteria"
    
    def __str__(self):
        return f"Matching criteria for {self.job_type}"


class JobMatch(models.Model):
    """Model to store job matching results."""
    
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    match_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Overall match score (0-100)"
    )
    skills_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Skills match score (0-100)"
    )
    experience_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Experience match score (0-100)"
    )
    location_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Location match score (0-100)"
    )
    education_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Education match score (0-100)"
    )
    match_details = models.JSONField(
        default=dict,
        help_text="Detailed breakdown of matching factors"
    )
    is_viewed = models.BooleanField(default=False)
    is_applied = models.BooleanField(default=False)
    is_recommended = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['candidate', 'job']
        ordering = ['-match_score', '-created_at']
        indexes = [
            models.Index(fields=['candidate', '-match_score']),
            models.Index(fields=['job', '-match_score']),
            models.Index(fields=['match_score']),
        ]
    
    def __str__(self):
        return f"{self.candidate} - {self.job.title} ({self.match_score:.1f}%)"


class CandidatePreferences(models.Model):
    """Model to store candidate job preferences for better matching."""
    
    SALARY_RANGE_CHOICES = [
        ('entry', 'Entry Level (30-50k)'),
        ('mid', 'Mid Level (50-80k)'),
        ('senior', 'Senior Level (80-120k)'),
        ('executive', 'Executive Level (120k+)'),
    ]
    
    SCHEDULE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('per_diem', 'Per Diem'),
        ('travel', 'Travel Assignment'),
    ]
    
    candidate = models.OneToOneField(CandidateProfile, on_delete=models.CASCADE)
    preferred_job_types = models.JSONField(default=list, help_text="Preferred job types")
    preferred_locations = models.JSONField(default=list, help_text="Preferred work locations")
    max_commute_distance = models.IntegerField(
        default=25,
        help_text="Maximum commute distance in miles"
    )
    salary_range = models.CharField(
        max_length=20,
        choices=SALARY_RANGE_CHOICES,
        default='mid'
    )
    min_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Minimum acceptable salary"
    )
    schedule_preference = models.CharField(
        max_length=20,
        choices=SCHEDULE_CHOICES,
        default='full_time'
    )
    remote_work_acceptable = models.BooleanField(default=False)
    night_shift_acceptable = models.BooleanField(default=True)
    weekend_work_acceptable = models.BooleanField(default=True)
    travel_acceptable = models.BooleanField(default=False)
    max_travel_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Maximum acceptable travel percentage"
    )
    notification_frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Digest'),
            ('none', 'No Notifications'),
        ],
        default='daily'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Candidate Preference"
        verbose_name_plural = "Candidate Preferences"
    
    def __str__(self):
        return f"Preferences for {self.candidate}"


class SearchHistory(models.Model):
    """Model to track candidate job search history for improved recommendations."""
    
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE)
    search_query = models.CharField(max_length=500)
    job_type = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    filters_applied = models.JSONField(default=dict, help_text="Filters applied during search")
    results_count = models.IntegerField(default=0)
    clicked_jobs = models.JSONField(default=list, help_text="List of job IDs clicked")
    applied_jobs = models.JSONField(default=list, help_text="List of job IDs applied to")
    search_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-search_date']
        verbose_name = "Search History"
        verbose_name_plural = "Search Histories"
    
    def __str__(self):
        return f"{self.candidate} searched: {self.search_query}"


class RecommendationFeedback(models.Model):
    """Model to collect feedback on job recommendations for ML improvement."""
    
    FEEDBACK_CHOICES = [
        ('excellent', 'Excellent Match'),
        ('good', 'Good Match'),
        ('fair', 'Fair Match'),
        ('poor', 'Poor Match'),
        ('irrelevant', 'Not Relevant'),
    ]
    
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    job_match = models.ForeignKey(JobMatch, on_delete=models.CASCADE)
    feedback_rating = models.CharField(max_length=20, choices=FEEDBACK_CHOICES)
    feedback_comments = models.TextField(blank=True)
    is_interested = models.BooleanField(default=False)
    will_apply = models.BooleanField(default=False)
    reasons_not_interested = models.JSONField(
        default=list,
        help_text="Reasons why candidate is not interested"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['candidate', 'job']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback from {self.candidate} on {self.job.title}"


class AutoMatchingSettings(models.Model):
    """Model to store system-wide auto matching settings."""
    
    is_enabled = models.BooleanField(default=True)
    matching_frequency = models.CharField(
        max_length=20,
        choices=[
            ('realtime', 'Real-time'),
            ('hourly', 'Every Hour'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
        ],
        default='daily'
    )
    min_match_score = models.FloatField(
        default=60.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Minimum match score to create recommendation"
    )
    max_recommendations_per_candidate = models.IntegerField(
        default=10,
        help_text="Maximum recommendations to show per candidate"
    )
    exclude_applied_jobs = models.BooleanField(
        default=True,
        help_text="Exclude jobs already applied to"
    )
    exclude_viewed_jobs = models.BooleanField(
        default=False,
        help_text="Exclude jobs already viewed"
    )
    learning_enabled = models.BooleanField(
        default=True,
        help_text="Enable machine learning improvements"
    )
    last_run = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Auto Matching Settings"
        verbose_name_plural = "Auto Matching Settings"
    
    def __str__(self):
        return f"Auto Matching Settings (Enabled: {self.is_enabled})"