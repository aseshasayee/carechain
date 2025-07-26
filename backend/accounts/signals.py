"""
Signal handlers for the accounts app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from profiles.models import CandidateProfile, RecruiterProfile


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a candidate or recruiter profile when a user is created.
    """
    if created:
        if instance.is_candidate:
            CandidateProfile.objects.create(
                user=instance,
                first_name=instance.first_name,
                last_name=instance.last_name
            )
        elif instance.is_recruiter:
            RecruiterProfile.objects.create(
                user=instance,
                hospital_name=f"{instance.first_name}'s Hospital",  # Default value, to be updated
                registration_number=f"REG-{instance.id}",  # Default value, to be updated
                contact_no="",  # To be updated by user
                address="",  # To be updated by user
                primary_contact=f"{instance.first_name} {instance.last_name}"  # Default value, to be updated
            ) 