"""
Models for the profiles app.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

from django.utils import timezone
from django.core.validators import FileExtensionValidator


class CandidateProfile(models.Model):
    # ...existing code...

    @property
    def experience_years(self):
        """
        Returns the candidate's industrial experience in years.
        This is a placeholder. You can enhance this logic to sum up experience from jobs, documents, etc.
        """
        # Example: If you have a field or related model for experience, calculate here.
        # For now, return 0 or a static value.
        return 0
    """Model for storing candidate profile information."""
    
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    
    VERIFICATION_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='candidate_profile'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    aadhaar_number = models.CharField(max_length=12, null=True, blank=True)
    is_aadhaar_verified = models.BooleanField(default=False)
    headline = models.CharField(max_length=255, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)
    
    # Verification fields
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default='pending'
    )
    verification_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_candidates'
    )
    rejection_reason = models.TextField(null=True, blank=True)
    
    # Application quota tracking
    experience_years = models.PositiveIntegerField(default=0, help_text="Years of industrial experience")
    monthly_application_count = models.PositiveIntegerField(default=0)
    monthly_application_quota = models.PositiveIntegerField(default=50)
    monthly_job_viewed_count = models.PositiveIntegerField(default=0)
    monthly_job_viewed_quota = models.PositiveIntegerField(default=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def verify(self, verified_by):
        """Mark profile as verified"""
        self.verification_status = 'verified'
        self.verification_date = timezone.now()
        self.verified_by = verified_by
        self.rejection_reason = None
        self.save()
    
    def reject(self, verified_by, reason):
        """Mark profile as rejected with reason"""
        self.verification_status = 'rejected'
        self.verification_date = timezone.now()
        self.verified_by = verified_by
        self.rejection_reason = reason
        self.save()


class JobPreference(models.Model):
    """Model for storing candidate job preferences."""
    
    JOB_TYPES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('temporary', 'Temporary'),
        ('locum', 'Locum'),
        ('any', 'Any'),
    )
    
    profile = models.OneToOneField(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='job_preference'
    )
    preferred_location = models.CharField(max_length=255, null=True, blank=True)
    preferred_department = models.CharField(max_length=100, null=True, blank=True)
    preferred_job_type = models.CharField(max_length=20, choices=JOB_TYPES, default='any')
    minimum_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    remote_work = models.BooleanField(default=False)
    willing_to_relocate = models.BooleanField(default=False)
    preferred_shift = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Job Preference for {self.profile}"


class Hospital(models.Model):
    """Minimal model for hospital login/registration."""
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    contact_no = models.CharField(max_length=15)
    password = models.CharField(max_length=128)  # Store hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class RecruiterProfile(models.Model):
    """Model for storing recruiter profile information."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='recruiter_profile'
    )
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='recruiters',
        null=True,
        blank=True
    )
    position = models.CharField(max_length=100)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.hospital.name if self.hospital else 'No Hospital'}"
    
    @property
    def is_profile_complete(self):
        """Check if profile is complete enough for verification"""
        return bool(self.hospital and self.position) 


# --- New Models for Robust Verification ---

class HospitalVerification(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    hospital = models.OneToOneField(
        Hospital,
        on_delete=models.CASCADE,
        related_name='verification_record'
    )
    official_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    official_contact_number = models.CharField(max_length=20)
    address = models.TextField()
    primary_contact_name = models.CharField(max_length=100)
    primary_contact_phone = models.CharField(max_length=20)
    primary_contact_email = models.EmailField()

    # Document uploads
    registration_proof = models.FileField(
        upload_to='hospital_verification/registration/',
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    gst_certificate = models.FileField(
        upload_to='hospital_verification/gst/',
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    is_nabh_certified = models.BooleanField(default=False)
    nabh_certificate = models.FileField(
        upload_to='hospital_verification/nabh/',
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    other_certificates = models.FileField(
        upload_to='hospital_verification/other/',
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='hospital_verification_reviews'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Verification for {self.official_name} ({self.hospital_id})"


class CandidateVerification(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    candidate = models.OneToOneField(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='verification_record'
    )
    # Professional details
    registration_number = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    years_of_experience = models.PositiveIntegerField()

    # Document uploads
    qualification_certificates = models.FileField(
        upload_to='candidate_verification/qualifications/',
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    registration_certificate = models.FileField(
        upload_to='candidate_verification/registration/',
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    resume = models.FileField(
        upload_to='candidate_verification/resume/',
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    government_id = models.FileField(
        upload_to='candidate_verification/id/',
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )
    additional_certifications = models.FileField(
        upload_to='candidate_verification/additional/',
        blank=True, null=True,
        validators=[FileExtensionValidator(['pdf', 'jpeg', 'jpg', 'png'])]
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='candidate_verification_reviews'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Verification for {self.candidate.full_name} ({self.candidate_id})"