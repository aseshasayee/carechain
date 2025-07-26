"""
Celery tasks for the jobs app.
"""

from celery import shared_task
from django.db.models import Q
from django.utils import timezone
from .models import Job, JobMatch
from attendance.models import AbsenceNotification
from notifications.models import Notification
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

User = get_user_model()
channel_layer = get_channel_layer()


@shared_task
def auto_match_candidates_to_job(job_id):
    """
    Automatically match candidates to a job based on their qualifications,
    skills, and experience.
    """
    from profiles.models import CandidateProfile
    
    try:
        job = Job.objects.get(id=job_id)
        
        # Get all candidate profiles
        candidates = CandidateProfile.objects.filter(
            user__is_candidate=True,
            user__is_email_verified=True
        )
        
        # For each candidate, calculate a matching score
        for candidate in candidates:
            score = 0
            max_score = 0
            
            # Check qualifications
            required_qualifications = job.required_qualifications.all()
            if required_qualifications.exists():
                max_score += 40
                candidate_qualifications = candidate.qualifications.values_list('degree_id', flat=True)
                for qual in required_qualifications:
                    if qual.id in candidate_qualifications:
                        score += 40 / required_qualifications.count()
            
            # Check skills
            required_skills = job.required_skills.all()
            if required_skills.exists():
                max_score += 40
                candidate_skills = candidate.skills.values_list('skill_name_id', flat=True)
                for skill in required_skills:
                    if skill.id in candidate_skills:
                        score += 40 / required_skills.count()
            
            # Check experience
            max_score += 20
            candidate_experience = 0
            for skill in candidate.skills.all():
                candidate_experience = max(candidate_experience, skill.years_experience)
            
            if candidate_experience >= job.experience_required:
                score += 20
            elif job.experience_required > 0:
                score += 20 * (candidate_experience / job.experience_required)
            
            # Normalize the score
            if max_score > 0:
                normalized_score = (score / max_score) * 100
            else:
                normalized_score = 0
                
            # Create or update the job match
            JobMatch.objects.update_or_create(
                job=job,
                candidate=candidate,
                defaults={
                    'matching_score': normalized_score,
                    'match_type': 'auto',
                }
            )
            
            # If the score is above 70%, send a notification to the candidate
            if normalized_score >= 70:
                create_match_notification(candidate.user, job, normalized_score)
        
        return f"Auto-matching completed for job {job.title}"
    
    except Job.DoesNotExist:
        return f"Job with ID {job_id} not found"


@shared_task
def trigger_auto_fill(absence_notification_id):
    """
    Trigger auto-fill mechanism for an absence notification.
    This will find the best matching candidates and send them notifications.
    """
    try:
        # Get the absence notification
        absence = AbsenceNotification.objects.get(id=absence_notification_id)
        
        if absence.auto_fill_triggered:
            return f"Auto-fill already triggered for absence {absence_notification_id}"
        
        # Mark as triggered
        absence.auto_fill_triggered = True
        absence.save()
        
        # Get the job
        job = absence.active_job.job
        
        # Check if auto-fill is enabled for this job
        if not job.auto_fill_enabled:
            return f"Auto-fill not enabled for job {job.title}"
        
        # Find the best matches for this job
        matches = JobMatch.objects.filter(
            job=job,
            matching_score__gte=60,  # Only consider matches with 60% or higher score
            candidate__job_applications__isnull=True  # Candidates who haven't already applied
        ).order_by('-matching_score')[:5]  # Get top 5 matches
        
        # Send notifications to these candidates
        for match in matches:
            create_auto_fill_notification(match.candidate.user, job, absence.date)
        
        return f"Auto-fill triggered for job {job.title}, sent to {matches.count()} candidates"
    
    except AbsenceNotification.DoesNotExist:
        return f"Absence notification with ID {absence_notification_id} not found"


def create_match_notification(user, job, score):
    """Create a notification for a job match."""
    notification = Notification.objects.create(
        user=user,
        title="New Job Match",
        message=f"You have a new job match: {job.title} at {job.employer.hospital_name} with a matching score of {score:.1f}%",
        notification_type="job_match",
        related_object_id=job.id,
        related_object_type="jobs.Job"
    )
    
    # Send real-time notification via WebSocket
    content = {
        'id': notification.id,
        'title': notification.title,
        'message': notification.message,
        'type': notification.notification_type,
        'created_at': notification.created_at.isoformat()
    }
    
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user.id}',
        {
            'type': 'notification_message',
            'content': content
        }
    )


def create_auto_fill_notification(user, job, date):
    """Create a notification for an auto-fill request."""
    notification = Notification.objects.create(
        user=user,
        title="Urgent Job Opportunity",
        message=f"Urgent opening for {job.title} at {job.employer.hospital_name} on {date}. Apply now if you're available.",
        notification_type="auto_fill",
        related_object_id=job.id,
        related_object_type="jobs.Job"
    )
    
    # Send real-time notification via WebSocket
    content = {
        'id': notification.id,
        'title': notification.title,
        'message': notification.message,
        'type': notification.notification_type,
        'created_at': notification.created_at.isoformat()
    }
    
    async_to_sync(channel_layer.group_send)(
        f'notifications_{user.id}',
        {
            'type': 'notification_message',
            'content': content
        }
    )


@shared_task
def reset_monthly_quotas():
    """Reset monthly application and job view quotas for all candidates."""
    from profiles.models import CandidateProfile
    
    CandidateProfile.objects.all().update(
        monthly_application_count=0,
        monthly_job_viewed_count=0
    )
    
    return "Monthly quotas reset successfully" 