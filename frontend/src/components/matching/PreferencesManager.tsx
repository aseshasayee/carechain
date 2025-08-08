import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface CandidatePreferences {
  preferred_job_types: string[];
  preferred_locations: string[];
  max_commute_distance: number;
  salary_range: string;
  min_salary?: number;
  schedule_preference: string;
  remote_work_acceptable: boolean;
  night_shift_acceptable: boolean;
  weekend_work_acceptable: boolean;
  travel_acceptable: boolean;
  max_travel_percentage: number;
  notification_frequency: string;
}

const PreferencesManager: React.FC = () => {
  const [preferences, setPreferences] = useState<CandidatePreferences>({
    preferred_job_types: [],
    preferred_locations: [],
    max_commute_distance: 25,
    salary_range: 'mid',
    schedule_preference: 'full_time',
    remote_work_acceptable: false,
    night_shift_acceptable: true,
    weekend_work_acceptable: true,
    travel_acceptable: false,
    max_travel_percentage: 0,
    notification_frequency: 'daily'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state for arrays
  const [newJobType, setNewJobType] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.matching.getPreferences();
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else if (response.status === 404) {
        // No preferences found, use defaults
        console.log('No existing preferences found, using defaults');
      } else {
        throw new Error('Failed to fetch preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.matching.updatePreferences(preferences);
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CandidatePreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const addJobType = () => {
    if (newJobType.trim() && !preferences.preferred_job_types.includes(newJobType.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_job_types: [...prev.preferred_job_types, newJobType.trim()]
      }));
      setNewJobType('');
    }
  };

  const removeJobType = (jobType: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_job_types: prev.preferred_job_types.filter(type => type !== jobType)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.preferred_locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(loc => loc !== location)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Job Preferences</h2>
          <p className="text-sm text-gray-600 mt-1">
            Set your preferences to get better job recommendations
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">Preferences saved successfully!</div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Job Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Job Types
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferences.preferred_job_types.map((jobType) => (
                <span
                  key={jobType}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {jobType}
                  <button
                    onClick={() => removeJobType(jobType)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                placeholder="Add job type (e.g., Registered Nurse)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addJobType()}
              />
              <button
                onClick={addJobType}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Locations
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferences.preferred_locations.map((location) => (
                <span
                  key={location}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {location}
                  <button
                    onClick={() => removeLocation(location)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location (e.g., New York, NY)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addLocation()}
              />
              <button
                onClick={addLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Commute Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Commute Distance: {preferences.max_commute_distance} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={preferences.max_commute_distance}
              onChange={(e) => handleInputChange('max_commute_distance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 miles</span>
              <span>100 miles</span>
            </div>
          </div>

          {/* Salary Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <select
                value={preferences.salary_range}
                onChange={(e) => handleInputChange('salary_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="entry">Entry Level (30-50k)</option>
                <option value="mid">Mid Level (50-80k)</option>
                <option value="senior">Senior Level (80-120k)</option>
                <option value="executive">Executive Level (120k+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary (Optional)
              </label>
              <input
                type="number"
                value={preferences.min_salary || ''}
                onChange={(e) => handleInputChange('min_salary', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 75000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Schedule Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Preference
            </label>
            <select
              value={preferences.schedule_preference}
              onChange={(e) => handleInputChange('schedule_preference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="per_diem">Per Diem</option>
              <option value="travel">Travel Assignment</option>
            </select>
          </div>

          {/* Work Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Work Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.remote_work_acceptable}
                  onChange={(e) => handleInputChange('remote_work_acceptable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Open to remote work</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.night_shift_acceptable}
                  onChange={(e) => handleInputChange('night_shift_acceptable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Willing to work night shifts</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.weekend_work_acceptable}
                  onChange={(e) => handleInputChange('weekend_work_acceptable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Willing to work weekends</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.travel_acceptable}
                  onChange={(e) => handleInputChange('travel_acceptable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Open to travel assignments</span>
              </label>
            </div>

            {preferences.travel_acceptable && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Travel Percentage: {preferences.max_travel_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.max_travel_percentage}
                  onChange={(e) => handleInputChange('max_travel_percentage', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Frequency
            </label>
            <select
              value={preferences.notification_frequency}
              onChange={(e) => handleInputChange('notification_frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Digest</option>
              <option value="none">No Notifications</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesManager;
