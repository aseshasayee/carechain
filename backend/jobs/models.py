"""
Models for the jobs app.
"""

from django.db import models
from django.conf import settings
from profiles.models import CandidateProfile, RecruiterProfile
from documents.models import Qualification, Skill


class Job(models.Model):
    """Model for storing job information."""
    
    JOB_TYPES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
        ('locum', 'Locum'),
    )
    
    PAY_UNITS = (
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('per_shift', 'Per Shift'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    employer = models.ForeignKey(
        RecruiterProfile, 
        on_delete=models.CASCADE, 
        related_name='jobs'
    )
    location = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES)
    shift_start_time = models.TimeField(null=True, blank=True)
    shift_end_time = models.TimeField(null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    pay_unit = models.CharField(max_length=20, choices=PAY_UNITS)
    required_qualifications = models.ManyToManyField('documents.QualificationMaster', blank=True)
    required_skills = models.ManyToManyField('documents.SkillMaster', blank=True)
    experience_required = models.PositiveIntegerField(default=0)
    is_filled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    auto_fill_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class JobApplication(models.Model):
    """Model for storing job application information."""
    
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('in_review', 'In Review'),
        ('shortlisted', 'Shortlisted'),
        ('interviewed', 'Interviewed'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('selected', 'Selected'),
        ('withdrawn', 'Withdrawn'),
    )
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='job_applications'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='applications'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    personal_statement = models.TextField(null=True, blank=True)
    applied_on = models.DateTimeField(auto_now_add=True)
    withdrawn = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('profile', 'job')
    
    def __str__(self):
        return f"{self.profile} - {self.job.title}"


class JobMatch(models.Model):
    """Model for storing job match information."""
    
    MATCH_TYPES = (
        ('auto', 'Automatic'),
        ('manual', 'Manual'),
    )
    
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='matches'
    )
    candidate = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='job_matches'
    )
    matching_score = models.DecimalField(max_digits=5, decimal_places=2)
    matched_on = models.DateTimeField(auto_now_add=True)
    match_type = models.CharField(max_length=10, choices=MATCH_TYPES)
    shortlisted = models.BooleanField(default=False)
    notified = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('job', 'candidate')
    
    def __str__(self):
        return f"{self.job.title} - {self.candidate} ({self.matching_score})"


class ActiveJob(models.Model):
    """Model for storing active job information."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='active_jobs'
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name='active_employees'
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_resigned = models.BooleanField(default=False)
    resign_reason = models.TextField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.profile} - {self.job.title}"


class CompletedJob(models.Model):
    """Model for storing completed job information."""
    
    profile = models.ForeignKey(
        CandidateProfile, 
        on_delete=models.CASCADE, 
        related_name='completed_jobs'
    )
    employer = models.ForeignKey(
        RecruiterProfile, 
        on_delete=models.CASCADE, 
        related_name='past_employees'
    )
    job_title = models.CharField(max_length=255)
    joining_date = models.DateField()
    ending_date = models.DateField()
    competence_score = models.PositiveIntegerField(null=True, blank=True)
    ethics_score = models.PositiveIntegerField(null=True, blank=True)
    teamwork_score = models.PositiveIntegerField(null=True, blank=True)
    conduct_score = models.PositiveIntegerField(null=True, blank=True)
    overall_score = models.PositiveIntegerField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.profile} - {self.job_title}"


class Interview(models.Model):
    """Model for storing interview information."""
    
    INTERVIEW_TYPES = (
        ('phone', 'Phone Interview'),
        ('video', 'Video Interview'),
        ('in_person', 'In-Person Interview'),
        ('panel', 'Panel Interview'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('no_show', 'No Show'),
    )
    
    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='interviews'
    )
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES)
    scheduled_datetime = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    location = models.CharField(max_length=255, null=True, blank=True)
    meeting_link = models.URLField(null=True, blank=True)
    interviewer_notes = models.TextField(null=True, blank=True)
    candidate_notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Contact reveal - only after interview acceptance
    contact_revealed = models.BooleanField(default=False)
    contact_revealed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_datetime']
    
    def __str__(self):
        return f"Interview for {self.application} on {self.scheduled_datetime}"


class Feedback(models.Model):
    """Model for storing feedback after job completion."""
    
    FEEDBACK_TYPES = (
        ('candidate_to_employer', 'Candidate to Employer'),
        ('employer_to_candidate', 'Employer to Candidate'),
    )
    
    RATING_CHOICES = (
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    )
    
    completed_job = models.ForeignKey(
        CompletedJob,
        on_delete=models.CASCADE,
        related_name='feedback'
    )
    feedback_type = models.CharField(max_length=30, choices=FEEDBACK_TYPES)
    
    # Rating fields
    overall_rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    professionalism_rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    communication_rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    punctuality_rating = models.PositiveIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    
    # Text feedback
    comments = models.TextField()
    would_recommend = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('completed_job', 'feedback_type')
    
    def __str__(self):
        return f"Feedback for {self.completed_job} - {self.feedback_type}" 