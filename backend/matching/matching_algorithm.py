"""
Job matching algorithm engine for automatic candidate-job matching.
"""

import math
import json
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from django.db.models import Q, F
from django.utils import timezone

# Note: geopy library needs to be installed for location-based matching
# pip install geopy
try:
    from geopy.distance import geodesic
    from geopy.geocoders import Nominatim
    GEOPY_AVAILABLE = True
except ImportError:
    GEOPY_AVAILABLE = False

from .models import (
    JobMatch, MatchingCriteria, CandidatePreferences, 
    SearchHistory, RecommendationFeedback
)
from jobs.models import Job, JobApplication
from profiles.models import CandidateProfile


class JobMatchingEngine:
    """
    Advanced job matching engine that uses multiple factors to score 
    candidate-job compatibility.
    """
    
    def __init__(self):
        if GEOPY_AVAILABLE:
            self.geolocator = Nominatim(user_agent="job_portal_matching")
        else:
            self.geolocator = None
        self.default_weights = {
            'skills': 0.4,
            'experience': 0.2,
            'location': 0.3,
            'education': 0.1
        }
    
    def match_candidate_to_jobs(self, candidate: CandidateProfile, force_update: bool = False) -> Dict[str, int]:
        """
        Match a single candidate to all available jobs.
        
        Args:
            candidate: CandidateProfile instance
            force_update: Whether to recalculate existing matches
            
        Returns:
            Dict with counts of matches created and updated
        """
        matches_created = 0
        matches_updated = 0
        
        # Get active jobs
        active_jobs = Job.objects.filter(is_active=True, is_filled=False)
        
        # Filter out jobs already applied to (if preferences specify)
        try:
            preferences = CandidatePreferences.objects.get(candidate=candidate)
            applied_job_ids = JobApplication.objects.filter(
                candidate=candidate
            ).values_list('job_id', flat=True)
            
            if applied_job_ids:
                active_jobs = active_jobs.exclude(id__in=applied_job_ids)
        except CandidatePreferences.DoesNotExist:
            preferences = None
        
        for job in active_jobs:
            # Check if match already exists
            existing_match = JobMatch.objects.filter(
                candidate=candidate, job=job
            ).first()
            
            if existing_match and not force_update:
                continue
            
            # Calculate match score
            match_data = self.calculate_match_score(candidate, job, preferences)
            
            if match_data['overall_score'] >= 60.0:  # Minimum threshold
                if existing_match:
                    # Update existing match
                    existing_match.match_score = match_data['overall_score']
                    existing_match.skills_score = match_data['skills_score']
                    existing_match.experience_score = match_data['experience_score']
                    existing_match.location_score = match_data['location_score']
                    existing_match.education_score = match_data['education_score']
                    existing_match.match_details = match_data['details']
                    existing_match.save()
                    matches_updated += 1
                else:
                    # Create new match
                    JobMatch.objects.create(
                        candidate=candidate,
                        job=job,
                        match_score=match_data['overall_score'],
                        skills_score=match_data['skills_score'],
                        experience_score=match_data['experience_score'],
                        location_score=match_data['location_score'],
                        education_score=match_data['education_score'],
                        match_details=match_data['details']
                    )
                    matches_created += 1
        
        return {
            'matches_created': matches_created,
            'matches_updated': matches_updated
        }
    
    def match_all_candidates(self, force_update: bool = False) -> Dict[str, int]:
        """
        Match all candidates to jobs.
        
        Returns:
            Dict with total counts and processing info
        """
        candidates_processed = 0
        total_matches_created = 0
        total_matches_updated = 0
        
        # Get active candidates (those who have been active recently)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_candidates = CandidateProfile.objects.filter(
            Q(user__last_login__gte=thirty_days_ago) | 
            Q(created_at__gte=thirty_days_ago)
        )
        
        for candidate in active_candidates:
            try:
                results = self.match_candidate_to_jobs(candidate, force_update)
                total_matches_created += results['matches_created']
                total_matches_updated += results['matches_updated']
                candidates_processed += 1
            except Exception as e:
                # Log error but continue processing
                print(f"Error matching candidate {candidate.id}: {str(e)}")
                continue
        
        return {
            'candidates_processed': candidates_processed,
            'total_matches_created': total_matches_created,
            'total_matches_updated': total_matches_updated
        }
    
    def calculate_match_score(self, candidate: CandidateProfile, job: Job, preferences: CandidatePreferences = None) -> Dict[str, Any]:
        """
        Calculate comprehensive match score between candidate and job.
        
        Returns:
            Dict containing overall score, individual scores, and details
        """
        # Get or create matching criteria for this job type
        criteria, _ = MatchingCriteria.objects.get_or_create(
            job_type=job.job_type,
            defaults={
                'required_skills': [],
                'preferred_skills': [],
                'min_experience': 0,
                'education_requirements': [],
                'certifications': [],
                **self.default_weights
            }
        )
        
        # Calculate individual scores
        skills_score = self._calculate_skills_score(candidate, job, criteria)
        experience_score = self._calculate_experience_score(candidate, job, criteria)
        location_score = self._calculate_location_score(candidate, job, preferences)
        education_score = self._calculate_education_score(candidate, job, criteria)
        
        # Apply weights
        overall_score = (
            skills_score * criteria.skills_weight +
            experience_score * criteria.experience_weight +
            location_score * criteria.location_weight +
            education_score * criteria.education_weight
        )
        
        # Apply preference modifiers
        if preferences:
            overall_score = self._apply_preference_modifiers(
                overall_score, candidate, job, preferences
            )
        
        # Clamp score between 0 and 100
        overall_score = max(0, min(100, overall_score))
        
        return {
            'overall_score': round(overall_score, 2),
            'skills_score': round(skills_score, 2),
            'experience_score': round(experience_score, 2),
            'location_score': round(location_score, 2),
            'education_score': round(education_score, 2),
            'details': {
                'skills_match': self._get_skills_details(candidate, job),
                'experience_match': self._get_experience_details(candidate, job),
                'location_match': self._get_location_details(candidate, job),
                'education_match': self._get_education_details(candidate, job),
                'preference_adjustments': self._get_preference_adjustments(candidate, job, preferences)
            }
        }
    
    def _calculate_skills_score(self, candidate: CandidateProfile, job: Job, criteria: MatchingCriteria) -> float:
        """Calculate skills match score."""
        candidate_skills = set(candidate.skills) if candidate.skills else set()
        job_required_skills = set(job.required_skills) if job.required_skills else set()
        job_preferred_skills = set(job.preferred_skills) if job.preferred_skills else set()
        
        if not job_required_skills and not job_preferred_skills:
            return 75.0  # Default score when no skills specified
        
        # Calculate required skills match
        required_match = 0
        if job_required_skills:
            matched_required = candidate_skills.intersection(job_required_skills)
            required_match = len(matched_required) / len(job_required_skills) * 100
        
        # Calculate preferred skills match  
        preferred_match = 0
        if job_preferred_skills:
            matched_preferred = candidate_skills.intersection(job_preferred_skills)
            preferred_match = len(matched_preferred) / len(job_preferred_skills) * 100
        
        # Weight required skills higher than preferred
        if job_required_skills and job_preferred_skills:
            return (required_match * 0.7) + (preferred_match * 0.3)
        elif job_required_skills:
            return required_match
        else:
            return preferred_match
    
    def _calculate_experience_score(self, candidate: CandidateProfile, job: Job, criteria: MatchingCriteria) -> float:
        """Calculate experience match score."""
        candidate_experience = candidate.years_of_experience or 0
        job_min_experience = job.min_experience or 0
        
        if candidate_experience >= job_min_experience:
            # Full score if meets minimum, bonus for extra experience up to double requirement
            base_score = 100
            if job_min_experience > 0:
                extra_experience = candidate_experience - job_min_experience
                bonus = min(25, (extra_experience / job_min_experience) * 25)
                return min(100, base_score + bonus)
            return base_score
        else:
            # Partial score if below minimum
            if job_min_experience > 0:
                return (candidate_experience / job_min_experience) * 80
            return 80  # Default score when no experience requirement
    
    def _calculate_location_score(self, candidate: CandidateProfile, job: Job, preferences: CandidatePreferences = None) -> float:
        """Calculate location match score."""
        try:
            # If candidate has no location preference, location doesn't matter much
            if not candidate.location:
                return 70.0
            
            # If job allows remote work and candidate prefers it
            if preferences and preferences.remote_work_acceptable and hasattr(job, 'remote_work_available') and job.remote_work_available:
                return 100.0
            
            # Calculate distance between candidate and job location
            if job.location and candidate.location:
                distance = self._calculate_distance(candidate.location, job.location)
                
                # Get max commute distance from preferences
                max_distance = 25  # Default 25 miles
                if preferences and preferences.max_commute_distance:
                    max_distance = preferences.max_commute_distance
                
                if distance <= max_distance:
                    # Score decreases as distance increases
                    return max(50, 100 - (distance / max_distance) * 50)
                else:
                    # Low score for distances beyond preference
                    return max(10, 50 - ((distance - max_distance) / max_distance) * 40)
            
            return 60.0  # Default score when locations not specified
            
        except Exception:
            return 60.0  # Default score on error
    
    def _calculate_education_score(self, candidate: CandidateProfile, job: Job, criteria: MatchingCriteria) -> float:
        """Calculate education match score."""
        candidate_education = candidate.education_level or ''
        job_education_req = job.education_level or ''
        
        # Education level hierarchy
        education_levels = {
            'high_school': 1,
            'associate': 2,
            'bachelor': 3,
            'master': 4,
            'doctorate': 5,
            'phd': 5
        }
        
        candidate_level = education_levels.get(candidate_education.lower(), 0)
        required_level = education_levels.get(job_education_req.lower(), 0)
        
        if required_level == 0:
            return 80.0  # No specific requirement
        
        if candidate_level >= required_level:
            return 100.0
        elif candidate_level == required_level - 1:
            return 75.0  # One level below
        elif candidate_level > 0:
            return 50.0  # Has some education but below requirement
        else:
            return 25.0  # No education info
    
    def _apply_preference_modifiers(self, base_score: float, candidate: CandidateProfile, 
                                  job: Job, preferences: CandidatePreferences) -> float:
        """Apply preference-based modifiers to the base score."""
        modified_score = base_score
        
        # Job type preference
        if preferences.preferred_job_types and job.job_type in preferences.preferred_job_types:
            modified_score += 5  # Bonus for preferred job type
        
        # Schedule preference
        if hasattr(job, 'schedule_type'):
            if job.schedule_type == preferences.schedule_preference:
                modified_score += 3
        
        # Salary preference
        if preferences.min_salary and hasattr(job, 'salary_min'):
            if job.salary_min and job.salary_min >= preferences.min_salary:
                modified_score += 5
            elif job.salary_min and job.salary_min < preferences.min_salary * 0.8:
                modified_score -= 10  # Penalty for low salary
        
        # Shift preferences
        if hasattr(job, 'shift_type'):
            if job.shift_type == 'night' and not preferences.night_shift_acceptable:
                modified_score -= 15
            if job.shift_type == 'weekend' and not preferences.weekend_work_acceptable:
                modified_score -= 10
        
        # Travel requirements
        if hasattr(job, 'travel_required'):
            if job.travel_required and not preferences.travel_acceptable:
                modified_score -= 20
            elif job.travel_required and preferences.max_travel_percentage:
                job_travel = getattr(job, 'travel_percentage', 0)
                if job_travel > preferences.max_travel_percentage:
                    modified_score -= 15
        
        return modified_score
    
    def _calculate_distance(self, location1: str, location2: str) -> float:
        """Calculate distance between two locations in miles."""
        try:
            if not GEOPY_AVAILABLE or not self.geolocator:
                # Fallback: simple string comparison for location matching
                if location1.lower() == location2.lower():
                    return 0.0
                elif any(word in location2.lower() for word in location1.lower().split()):
                    return 15.0  # Same general area
                else:
                    return 50.0  # Different areas
            
            # Geocode locations
            loc1 = self.geolocator.geocode(location1)
            loc2 = self.geolocator.geocode(location2)
            
            if loc1 and loc2:
                distance = geodesic(
                    (loc1.latitude, loc1.longitude),
                    (loc2.latitude, loc2.longitude)
                ).miles
                return distance
            
            return 50.0  # Default distance when geocoding fails
            
        except Exception:
            return 50.0  # Default distance on error
    
    def _get_skills_details(self, candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
        """Get detailed skills matching information."""
        candidate_skills = set(candidate.skills) if candidate.skills else set()
        job_required_skills = set(job.required_skills) if job.required_skills else set()
        job_preferred_skills = set(job.preferred_skills) if job.preferred_skills else set()
        
        return {
            'matched_required': list(candidate_skills.intersection(job_required_skills)),
            'missing_required': list(job_required_skills - candidate_skills),
            'matched_preferred': list(candidate_skills.intersection(job_preferred_skills)),
            'additional_skills': list(candidate_skills - job_required_skills - job_preferred_skills)
        }
    
    def _get_experience_details(self, candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
        """Get detailed experience matching information."""
        return {
            'candidate_experience': candidate.years_of_experience or 0,
            'required_experience': job.min_experience or 0,
            'meets_requirement': (candidate.years_of_experience or 0) >= (job.min_experience or 0)
        }
    
    def _get_location_details(self, candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
        """Get detailed location matching information."""
        try:
            distance = self._calculate_distance(candidate.location, job.location) if candidate.location and job.location else None
            return {
                'candidate_location': candidate.location,
                'job_location': job.location,
                'distance_miles': round(distance, 1) if distance else None
            }
        except Exception:
            return {
                'candidate_location': candidate.location,
                'job_location': job.location,
                'distance_miles': None
            }
    
    def _get_education_details(self, candidate: CandidateProfile, job: Job) -> Dict[str, Any]:
        """Get detailed education matching information."""
        return {
            'candidate_education': candidate.education_level,
            'required_education': job.education_level,
            'meets_requirement': candidate.education_level == job.education_level
        }
    
    def _get_preference_adjustments(self, candidate: CandidateProfile, job: Job, 
                                  preferences: CandidatePreferences = None) -> List[str]:
        """Get list of preference-based adjustments made to the score."""
        adjustments = []
        
        if not preferences:
            return adjustments
        
        # Check various preference factors
        if preferences.preferred_job_types and job.job_type in preferences.preferred_job_types:
            adjustments.append("Bonus for preferred job type")
        
        if preferences.min_salary and hasattr(job, 'salary_min'):
            if job.salary_min and job.salary_min >= preferences.min_salary:
                adjustments.append("Bonus for meeting salary requirement")
            elif job.salary_min and job.salary_min < preferences.min_salary * 0.8:
                adjustments.append("Penalty for low salary")
        
        return adjustments
    
    def get_recommendations_for_candidate(self, candidate_profile: CandidateProfile, 
                                        limit: int = 10, min_score: float = 60.0,
                                        job_type: str = '', location: str = '') -> List[Dict[str, Any]]:
        """
        Get personalized job recommendations for a candidate.
        
        Returns:
            List of job recommendation dictionaries
        """
        # Get existing matches
        matches_query = JobMatch.objects.filter(
            candidate=candidate_profile,
            match_score__gte=min_score,
            job__is_active=True,
            job__is_filled=False
        )
        
        # Apply filters
        if job_type:
            matches_query = matches_query.filter(job__job_type__icontains=job_type)
        if location:
            matches_query = matches_query.filter(job__location__icontains=location)
        
        # Get top matches
        matches = matches_query.order_by('-match_score')[:limit]
        
        recommendations = []
        for match in matches:
            # Check if this is a new recommendation
            is_new = not match.is_viewed
            
            # Generate recommendation reasons
            reasons = self._generate_recommendation_reasons(match)
            
            recommendations.append({
                'job': match.job,
                'match_score': match.match_score,
                'match_details': match.match_details,
                'reasons': reasons,
                'is_new': is_new
            })
        
        return recommendations
    
    def _generate_recommendation_reasons(self, job_match: JobMatch) -> List[str]:
        """Generate human-readable reasons for the job recommendation."""
        reasons = []
        
        # Skills-based reasons
        if job_match.skills_score >= 80:
            reasons.append("Strong skills match")
        elif job_match.skills_score >= 60:
            reasons.append("Good skills alignment")
        
        # Experience-based reasons
        if job_match.experience_score >= 90:
            reasons.append("Excellent experience match")
        elif job_match.experience_score >= 70:
            reasons.append("Good experience level")
        
        # Location-based reasons
        if job_match.location_score >= 80:
            reasons.append("Convenient location")
        
        # Overall score reasons
        if job_match.match_score >= 90:
            reasons.append("Exceptional overall match")
        elif job_match.match_score >= 80:
            reasons.append("High compatibility score")
        
        return reasons if reasons else ["Meets your basic criteria"]
