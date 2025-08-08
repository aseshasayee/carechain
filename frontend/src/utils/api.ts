/**
 * API utility functions for the healthcare job portal frontend
 */

// Get the base API URL from environment or default to localhost
export const getBaseApiUrl = (): string => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL or environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  // Server-side: use full URL
  return process.env.API_URL || 'http://localhost:8000';
};

// Get API URL with optional path
export const getApiUrl = (path: string = ''): string => {
  const baseUrl = getBaseApiUrl();
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
};

// API request helper with authentication
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);
  
  // Get token from localStorage if available - try multiple possible keys
  let token = null;
  if (typeof window !== 'undefined') {
    // Try different possible token storage keys
    token = localStorage.getItem('token') || 
            localStorage.getItem('access_token') || 
            localStorage.getItem('authToken') ||
            localStorage.getItem('jwt_token');
    
    // Debug: log token status
    console.log('API Request Debug:', {
      endpoint,
      hasToken: !!token,
      tokenStart: token ? token.substring(0, 20) + '...' : 'none',
      url
    });
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Debug: log response status
    console.log('API Response Debug:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      hasAuthHeader: !!defaultHeaders['Authorization']
    });
    
    return response;
  } catch (error) {
    console.error('API Request Error:', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Specific API functions
export const api = {
  // Authentication
  login: (credentials: { email: string; password: string }) => {
    // Login should not include authorization header (no existing token)
    const url = getApiUrl('api/accounts/login/');
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  },

  register: (userData: any) => {
    // Registration should not include authorization header
    const url = getApiUrl('api/accounts/register/');
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  // Statistics (public endpoint)
  getStatistics: () =>
    fetch(getApiUrl('api/accounts/statistics/'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }),

  // Jobs (require authentication)
  getJobs: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`api/jobs/${queryString}`);
  },

  getJob: (id: string) => apiRequest(`api/jobs/${id}/`),

  getJobCandidates: (jobId: string) => apiRequest(`api/jobs/${jobId}/candidates/`),

  updateJobStatus: (id: string, isActive: boolean) =>
    apiRequest(`api/jobs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),

  deleteJob: (id: string) =>
    apiRequest(`api/jobs/${id}/`, {
      method: 'DELETE',
    }),

  // Hospital Dashboard Stats
  getHospitalStats: () => apiRequest('api/jobs/hospital-stats/'),

  // Profile
  getProfile: () => apiRequest('api/profiles/me/'),
  updateProfile: (profileData: any) =>
    apiRequest('api/profiles/me/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Applications
  getApplications: () => apiRequest('api/applications/'),
  createApplication: (applicationData: any) =>
    apiRequest('api/applications/', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),

  updateApplicationStatus: (id: string, status: string) =>
    apiRequest(`api/applications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Employee Management
  employeeManagement: {
    // Employment records
    getEmployments: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/employee-management/employment/${queryString}`);
    },
    
    createEmployment: (employmentData: any) =>
      apiRequest('api/employee-management/employment/', {
        method: 'POST',
        body: JSON.stringify(employmentData),
      }),
    
    getEmployment: (id: string) =>
      apiRequest(`api/employee-management/employment/${id}/`),
    
    updateEmployment: (id: string, employmentData: any) =>
      apiRequest(`api/employee-management/employment/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(employmentData),
      }),
    
    deleteEmployment: (id: string) =>
      apiRequest(`api/employee-management/employment/${id}/`, {
        method: 'DELETE',
      }),

    // Employee availability
    getAvailability: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/employee-management/availability/${queryString}`);
    },
    
    createAvailability: (availabilityData: any) =>
      apiRequest('api/employee-management/availability/', {
        method: 'POST',
        body: JSON.stringify(availabilityData),
      }),
    
    checkAvailability: (checkData: { employee_id: string; date: string; shift?: string }) =>
      apiRequest('api/employee-management/availability/check/', {
        method: 'POST',
        body: JSON.stringify(checkData),
      }),

    // Performance reviews
    getPerformanceReviews: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/employee-management/performance/${queryString}`);
    },
    
    createPerformanceReview: (reviewData: any) =>
      apiRequest('api/employee-management/performance/', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),

    // Absence requests
    getAbsenceRequests: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/employee-management/absence-requests/${queryString}`);
    },
    
    createAbsenceRequest: (requestData: any) =>
      apiRequest('api/employee-management/absence-requests/', {
        method: 'POST',
        body: JSON.stringify(requestData),
      }),
    
    approveAbsenceRequest: (id: string, action: 'approve' | 'reject', notes?: string) =>
      apiRequest(`api/employee-management/absence-requests/${id}/approve/`, {
        method: 'PATCH',
        body: JSON.stringify({ action, notes }),
      }),
  },

  // Job Matching System
  matching: {
    // Job recommendations
    getRecommendations: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/matching/recommendations/${queryString}`);
    },
    
    getMatchSummary: () =>
      apiRequest('api/matching/recommendations/summary/'),

    // Matching management
    runMatching: (data?: { candidate_id?: string; force_update?: boolean }) =>
      apiRequest('api/matching/run-matching/', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    
    getMatches: (params?: Record<string, string>) => {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiRequest(`api/matching/matches/${queryString}`);
    },
    
    markJobViewed: (jobId: string) =>
      apiRequest(`api/matching/jobs/${jobId}/viewed/`, {
        method: 'POST',
      }),

    // Candidate preferences
    getPreferences: () =>
      apiRequest('api/matching/preferences/'),
    
    updatePreferences: (preferencesData: any) =>
      apiRequest('api/matching/preferences/', {
        method: 'PUT',
        body: JSON.stringify(preferencesData),
      }),

    // Feedback and analytics
    submitFeedback: (feedbackData: any) =>
      apiRequest('api/matching/feedback/', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      }),
    
    getSearchHistory: () =>
      apiRequest('api/matching/search-history/'),
    
    createSearchHistory: (searchData: any) =>
      apiRequest('api/matching/search-history/', {
        method: 'POST',
        body: JSON.stringify(searchData),
      }),
    
    getMatchingStats: () =>
      apiRequest('api/matching/stats/'),
    
    getAutoMatchingSettings: () =>
      apiRequest('api/matching/settings/'),
    
    updateAutoMatchingSettings: (settingsData: any) =>
      apiRequest('api/matching/settings/', {
        method: 'PUT',
        body: JSON.stringify(settingsData),
      }),
  },
};

export default api;
