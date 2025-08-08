import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import JobRecommendations from '../components/matching/JobRecommendations';
import PreferencesManager from '../components/matching/PreferencesManager';
import { api } from '../utils/api';

interface MatchSummary {
  total_recommendations: number;
  new_recommendations: number;
  applications_made: number;
  average_match_score: number;
  last_recommendation_date?: string;
  preferences_updated: boolean;
}

const JobMatchingPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);
  const [matchSummary, setMatchSummary] = useState<MatchSummary | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if user is a candidate
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'candidate') {
      router.push('/dashboard');
      return;
    }

    fetchMatchSummary();
    setLoading(false);
  }, [router]);

  const fetchMatchSummary = async () => {
    try {
      const response = await api.matching.getMatchSummary();
      if (response.ok) {
        const data = await response.json();
        setMatchSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch match summary:', err);
    }
  };

  const handleRunMatching = async () => {
    try {
      const response = await api.matching.runMatching();
      if (response.ok) {
        alert('Job matching completed! Check your recommendations for new matches.');
        fetchMatchSummary();
      } else {
        throw new Error('Failed to run matching');
      }
    } catch (err) {
      alert('Failed to run matching. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'recommendations', name: 'Job Recommendations' },
    { id: 'preferences', name: 'My Preferences' },
    { id: 'analytics', name: 'Match Analytics' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Matching</h1>
              <p className="mt-2 text-gray-600">
                Discover personalized job recommendations based on your skills and preferences
              </p>
            </div>
            <button
              onClick={handleRunMatching}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Refresh Matches
            </button>
          </div>

          {/* Summary Cards */}
          {matchSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{matchSummary.total_recommendations}</div>
                <div className="text-sm text-gray-600">Total Recommendations</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{matchSummary.new_recommendations}</div>
                <div className="text-sm text-gray-600">New Matches</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{matchSummary.applications_made}</div>
                <div className="text-sm text-gray-600">Applications Made</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-orange-600">{matchSummary.average_match_score.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Avg Match Score</div>
              </div>
            </div>
          )}

          {!matchSummary?.preferences_updated && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Improve your recommendations
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Set your job preferences to get better personalized recommendations.{' '}
                      <button
                        onClick={() => setActiveTab('preferences')}
                        className="font-medium underline hover:text-yellow-600"
                      >
                        Update preferences now
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'recommendations' && <JobRecommendations />}
          
          {activeTab === 'preferences' && <PreferencesManager />}
          
          {activeTab === 'analytics' && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Match Analytics</h3>
              <p className="text-gray-600">
                Analytics dashboard showing your matching history, application success rates, and recommendation feedback will be available here.
              </p>
              {matchSummary && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• {matchSummary.total_recommendations} total job recommendations received</li>
                      <li>• {matchSummary.applications_made} applications submitted</li>
                      <li>• {matchSummary.average_match_score.toFixed(1)}% average compatibility score</li>
                      {matchSummary.last_recommendation_date && (
                        <li>• Last recommendation: {new Date(matchSummary.last_recommendation_date).toLocaleDateString()}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Update your preferences regularly for better matches</li>
                      <li>• Provide feedback on recommendations to improve accuracy</li>
                      <li>• Check for new matches daily</li>
                      <li>• Keep your profile and skills updated</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchingPage;
