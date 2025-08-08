"""
Serializers for the jobs app.
"""

from rest_framework import serializers
from .models import Job, JobApplication, JobMatch, ActiveJob, CompletedJob, Interview, Feedback
from profiles.models import RecruiterProfile, CandidateProfile


class RecruiterProfileSerializer(serializers.ModelSerializer):
    """Simplified serializer for RecruiterProfile."""
    hospital_name = serializers.SerializerMethodField()
    contact_no = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = ['id', 'hospital_name', 'contact_no', 'address', 'position', 'is_verified']

    def get_hospital_name(self, obj):
        return obj.hospital.name if obj.hospital else None

    def get_contact_no(self, obj):
        return obj.hospital.contact_no if obj.hospital else None

    def get_address(self, obj):
        return obj.hospital.address if obj.hospital else None


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Simplified serializer for CandidateProfile."""
    
    email = serializers.CharField(source='user.email', read_only=True)
    experience_years = serializers.IntegerField(read_only=True)

    class Meta:
        model = CandidateProfile
        fields = ['id', 'first_name', 'last_name', 'headline', 'email', 'experience_years']


class JobSerializer(serializers.ModelSerializer):
    """Serializer for the Job model."""
    
    employer_details = RecruiterProfileSerializer(source='employer', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'employer', 'employer_details', 
            'location', 'department', 'job_type', 'shift_start_time', 
            'shift_end_time', 'start_date', 'end_date', 'salary', 'pay_unit',
            'required_qualifications', 'required_skills', 'experience_required',
            'is_filled', 'is_active', 'auto_fill_enabled', 'created_at', 'updated_at',
            'applications_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'employer']
    
    def get_applications_count(self, obj):
        """Get the number of applications for this job."""
        return obj.applications.count()


class JobDetailsSerializer(serializers.ModelSerializer):
    """Detailed serializer for a single job."""
    
    employer_details = RecruiterProfileSerializer(source='employer', read_only=True)
    has_applied = serializers.SerializerMethodField()
    is_matched = serializers.SerializerMethodField()
    matching_score = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'employer', 'employer_details', 
            'location', 'department', 'job_type', 'shift_start_time', 
            'shift_end_time', 'start_date', 'end_date', 'salary', 'pay_unit',
            'required_qualifications', 'required_skills', 'experience_required',
            'is_filled', 'is_active', 'auto_fill_enabled', 'created_at', 'updated_at',
            'has_applied', 'is_matched', 'matching_score', 'application_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'employer']
    
    def get_has_applied(self, obj):
        """Check if the current user has applied for this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return False
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return JobApplication.objects.filter(job=obj, profile=candidate_profile).exists()
        except CandidateProfile.DoesNotExist:
            return False
    
    def get_is_matched(self, obj):
        """Check if the current user has been matched with this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return False
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return JobMatch.objects.filter(job=obj, candidate=candidate_profile).exists()
        except CandidateProfile.DoesNotExist:
            return False
    
    def get_matching_score(self, obj):
        """Get the matching score for the current user and this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return None
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            job_match = JobMatch.objects.filter(job=obj, candidate=candidate_profile).first()
            return job_match.matching_score if job_match else None
        except CandidateProfile.DoesNotExist:
            return None
    
    def get_application_status(self, obj):
        """Get the application status for the current user and this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return None
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            job_application = JobApplication.objects.filter(job=obj, profile=candidate_profile).first()
            return job_application.status if job_application else None
        except CandidateProfile.DoesNotExist:
            return None


class JobSearchSerializer(serializers.ModelSerializer):
    """Serializer for job search results."""
    employer_name = serializers.SerializerMethodField()
    matching_score = serializers.SerializerMethodField()
    is_matched = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'location', 'department', 'job_type',
            'salary', 'pay_unit', 'start_date', 'employer_name',
            'matching_score', 'is_matched', 'has_applied'
        ]
    
    def get_employer_name(self, obj):
        if obj.employer and obj.employer.hospital:
            return obj.employer.hospital.name
        return None
    
    def get_matching_score(self, obj):
        """Get the matching score for the current user and this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return None
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            job_match = JobMatch.objects.filter(job=obj, candidate=candidate_profile).first()
            return job_match.matching_score if job_match else None
        except CandidateProfile.DoesNotExist:
            return None
    
    def get_is_matched(self, obj):
        """Check if the current user has been matched with this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return False
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return JobMatch.objects.filter(job=obj, candidate=candidate_profile).exists()
        except CandidateProfile.DoesNotExist:
            return False
    
    def get_has_applied(self, obj):
        """Check if the current user has applied for this job."""
        user = self.context.get('user')
        if not user or not user.is_candidate:
            return False
            
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
            return JobApplication.objects.filter(job=obj, profile=candidate_profile).exists()
        except CandidateProfile.DoesNotExist:
            return False


class JobApplicationSerializer(serializers.ModelSerializer):
    """Serializer for the JobApplication model."""
    
    job_details = JobSerializer(source='job', read_only=True)
    candidate_details = CandidateProfileSerializer(source='profile', read_only=True)
    applied_date = serializers.DateTimeField(source='applied_on', read_only=True)
    candidate = CandidateProfileSerializer(source='profile', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_details', 'profile', 'candidate_details', 'candidate',
            'status', 'personal_statement', 'applied_on', 'applied_date', 'withdrawn'
        ]
        read_only_fields = [
            'id', 'profile', 'candidate_details', 'applied_on', 'applied_date'
        ]


class JobMatchSerializer(serializers.ModelSerializer):
    """Serializer for the JobMatch model."""
    
    job_details = JobSerializer(source='job', read_only=True)
    candidate_details = CandidateProfileSerializer(source='candidate', read_only=True)
    
    class Meta:
        model = JobMatch
        fields = [
            'id', 'job', 'job_details', 'candidate', 'candidate_details', 
            'matching_score', 'matched_on', 'match_type', 'shortlisted', 'notified'
        ]
        read_only_fields = [
            'id', 'matched_on', 'match_type'
        ]


class ActiveJobSerializer(serializers.ModelSerializer):
    """Serializer for the ActiveJob model."""
    
    job_details = JobSerializer(source='job', read_only=True)
    candidate_details = CandidateProfileSerializer(source='profile', read_only=True)
    
    class Meta:
        model = ActiveJob
        fields = [
            'id', 'job', 'job_details', 'profile', 'candidate_details', 
            'start_date', 'end_date', 'is_resigned', 'resign_reason', 'is_current'
        ]
        read_only_fields = [
            'id', 'job', 'job_details', 'profile', 'candidate_details', 'is_current'
        ]


class CompletedJobSerializer(serializers.ModelSerializer):
    """Serializer for the CompletedJob model."""
    
    employer_details = RecruiterProfileSerializer(source='employer', read_only=True)
    candidate_details = CandidateProfileSerializer(source='profile', read_only=True)
    
    class Meta:
        model = CompletedJob
        fields = [
            'id', 'job_title', 'employer', 'employer_details', 'profile', 
            'candidate_details', 'joining_date', 'ending_date', 'competence_score',
            'ethics_score', 'teamwork_score', 'conduct_score', 'overall_score'
        ]
        read_only_fields = [
            'id', 'job_title', 'employer', 'employer_details', 'profile', 
            'candidate_details', 'joining_date', 'ending_date'
        ]


class InterviewSerializer(serializers.ModelSerializer):
    """Serializer for the Interview model."""
    
    application_details = JobApplicationSerializer(source='application', read_only=True)
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'application_details', 'candidate_name', 'job_title',
            'interview_type', 'scheduled_datetime', 'duration_minutes', 'location',
            'meeting_link', 'interviewer_notes', 'candidate_notes', 'status',
            'contact_revealed', 'contact_revealed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'contact_revealed_at', 'created_at', 'updated_at']
    
    def get_candidate_name(self, obj):
        return f"{obj.application.profile.first_name} {obj.application.profile.last_name}"
    
    def get_job_title(self, obj):
        return obj.application.job.title


class FeedbackSerializer(serializers.ModelSerializer):
    """Serializer for the Feedback model."""
    
    completed_job_details = CompletedJobSerializer(source='completed_job', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'completed_job', 'completed_job_details', 'feedback_type',
            'overall_rating', 'professionalism_rating', 'communication_rating',
            'punctuality_rating', 'comments', 'would_recommend', 'created_at'
        ]
        read_only_fields = ['id', 'created_at'] 