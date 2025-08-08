import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface JobRecommendation {
  job: {
    id: number;
    title: string;
    hospital: {
      name: string;
      location: string;
    };
    job_type: string;
    description: string;
    required_skills: string[];
    salary_min?: number;
    salary_max?: number;
    location: string;
    is_active: boolean;
  };
  match_score: number;
  match_details: {
    skills_match: {
      matched_required: string[];
      missing_required: string[];
      matched_preferred: string[];
    };
    experience_match: {
      candidate_experience: number;
      required_experience: number;
      meets_requirement: boolean;
    };
    location_match: {
      distance_miles?: number;
    };
  };
  reasons: string[];
  is_new: boolean;
}

const JobRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    limit: '10',
    min_score: '60',
    job_type: '',
    location: ''
  });

  useEffect(() => {
    fetchRecommendations();
  }, [filters]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.matching.getRecommendations(params);
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (jobId: number) => {
    try {
      await api.matching.markJobViewed(jobId.toString());
      // Update the local state to reflect the change
      setRecommendations(prev => 
        prev.map(rec => 
          rec.job.id === jobId 
            ? { ...rec, is_new: false }
            : rec
        )
      );
    } catch (err) {
      console.error('Failed to mark job as viewed:', err);
    }
  };

  const handleApply = async (jobId: number) => {
    try {
      // Apply to the job through the jobs API
      const response = await api.createApplication({ job: jobId });
      
      if (response.ok) {
        alert('Application submitted successfully!');
        // Mark as viewed when applying
        handleMarkViewed(jobId);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to apply');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
        <button 
          onClick={fetchRecommendations}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Job Recommendations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Personalized job matches based on your profile and preferences
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Match Score
              </label>
              <select
                value={filters.min_score}
                onChange={(e) => setFilters(prev => ({ ...prev, min_score: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="50">50%+</option>
                <option value="60">60%+</option>
                <option value="70">70%+</option>
                <option value="80">80%+</option>
                <option value="90">90%+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <input
                type="text"
                value={filters.job_type}
                onChange={(e) => setFilters(prev => ({ ...prev, job_type: e.target.value }))}
                placeholder="e.g., Nurse, Doctor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5 jobs</option>
                <option value="10">10 jobs</option>
                <option value="20">20 jobs</option>
                <option value="50">50 jobs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="divide-y divide-gray-200">
          {recommendations.map((recommendation) => (
            <div 
              key={recommendation.job.id} 
              className={`p-6 hover:bg-gray-50 ${recommendation.is_new ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recommendation.job.title}
                    </h3>
                    {recommendation.is_new && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMatchScoreColor(recommendation.match_score)}`}>
                      {recommendation.match_score.toFixed(1)}% match
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{recommendation.job.hospital.name}</span>
                    {' • '}
                    <span>{recommendation.job.location}</span>
                    {recommendation.match_details.location_match.distance_miles && (
                      <span> • {recommendation.match_details.location_match.distance_miles.toFixed(1)} miles away</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-800 mb-3">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {recommendation.job.job_type}
                    </span>
                  </div>

                  {/* Match Reasons */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Why this matches:</div>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.reasons.map((reason, index) => (
                        <span 
                          key={index}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills Match Details */}
                  {recommendation.match_details.skills_match && (
                    <div className="mb-3">
                      <div className="text-sm">
                        {recommendation.match_details.skills_match.matched_required.length > 0 && (
                          <div className="mb-1">
                            <span className="text-green-600 font-medium">
                              ✓ Matched Skills: 
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              {recommendation.match_details.skills_match.matched_required.join(', ')}
                            </span>
                          </div>
                        )}
                        {recommendation.match_details.skills_match.missing_required.length > 0 && (
                          <div>
                            <span className="text-orange-600 font-medium">
                              ⚠ Missing Skills: 
                            </span>
                            <span className="text-sm text-gray-600 ml-1">
                              {recommendation.match_details.skills_match.missing_required.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Salary Information */}
                  {(recommendation.job.salary_min || recommendation.job.salary_max) && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Salary: </span>
                      {recommendation.job.salary_min && recommendation.job.salary_max
                        ? `$${recommendation.job.salary_min.toLocaleString()} - $${recommendation.job.salary_max.toLocaleString()}`
                        : recommendation.job.salary_min
                        ? `$${recommendation.job.salary_min.toLocaleString()}+`
                        : `Up to $${recommendation.job.salary_max?.toLocaleString()}`
                      }
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleApply(recommendation.job.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    Apply Now
                  </button>
                  
                  {recommendation.is_new && (
                    <button
                      onClick={() => handleMarkViewed(recommendation.job.id)}
                      className="text-gray-600 hover:text-gray-800 text-sm underline"
                    >
                      Mark as viewed
                    </button>
                  )}
                  
                  <button
                    onClick={() => {/* TODO: Implement job details view */}}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No job recommendations found</div>
            <div className="text-sm text-gray-400">
              Try adjusting your filters or updating your profile preferences
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
