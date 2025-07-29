// API helper functions for CareChain Portal
// This file provides common API request functionality for all pages

const ApiHelper = {
    // Make an API request with authentication
    request: async function(endpoint, options = {}) {
        try {
            // Get token from AuthHelper if available, otherwise from localStorage
            const token = window.AuthHelper ? 
                AuthHelper.getToken() : 
                localStorage.getItem('token');
            
            if (!token && !options.skipAuth) {
                throw new Error('No authentication token found');
            }
            
            // Get API URL from API_CONFIG if available
            const url = typeof API_CONFIG !== 'undefined' ? 
                API_CONFIG.getApiUrl(endpoint) : 
                `http://localhost:8000/api${endpoint}`;
            
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            
            // Set default headers
            const headers = options.headers || {};
            
            if (token && !options.skipAuth) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && 
                options.body && 
                typeof options.body === 'object' && 
                !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            
            const fetchOptions = {
                ...options,
                headers
            };
            
            // Stringify body if it's an object and content type is JSON
            if (fetchOptions.body && 
                typeof fetchOptions.body === 'object' && 
                headers['Content-Type'] === 'application/json') {
                fetchOptions.body = JSON.stringify(fetchOptions.body);
            }
            
            const response = await fetch(url, fetchOptions);
            
            // Handle response
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    // Handle API response
    handleResponse: async function(response) {
        // If response is not ok, handle error
        if (!response.ok) {
            return this.handleError(response);
        }
        
        // If response is 204 No Content, return empty object
        if (response.status === 204) {
            return {};
        }
        
        // For successful responses, parse JSON
        try {
            return await response.json();
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            return {};
        }
    },
    
    // Handle API error response
    handleError: async function(response) {
        let errorMessage = `API request failed with status: ${response.status}`;
        
        try {
            // Try to parse error response
            const errorData = await response.json();
            
            // Check for various error formats
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.non_field_errors) {
                errorMessage = errorData.non_field_errors.join(', ');
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
            
            // Handle field errors
            const fieldErrors = {};
            for (const [key, value] of Object.entries(errorData)) {
                if (key !== 'detail' && key !== 'error' && key !== 'message' && key !== 'non_field_errors') {
                    if (Array.isArray(value)) {
                        fieldErrors[key] = value.join(', ');
                    } else if (typeof value === 'string') {
                        fieldErrors[key] = value;
                    } else {
                        fieldErrors[key] = JSON.stringify(value);
                    }
                }
            }
            
            // Create error object
            const error = new Error(errorMessage);
            error.status = response.status;
            error.statusText = response.statusText;
            error.fieldErrors = fieldErrors;
            error.hasFieldErrors = Object.keys(fieldErrors).length > 0;
            
            throw error;
        } catch (parseError) {
            if (parseError instanceof SyntaxError) {
                // If we couldn't parse JSON, use status text
                const error = new Error(response.statusText || errorMessage);
                error.status = response.status;
                error.statusText = response.statusText;
                throw error;
            }
            
            // If we parsed JSON but had another error, throw that
            throw parseError;
        }
    },
    
    // GET request
    get: async function(endpoint, params = {}) {
        // Add query params if present
        let url = endpoint;
        const queryParams = new URLSearchParams();
        let hasParams = false;
        
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
                hasParams = true;
            }
        }
        
        if (hasParams) {
            url = `${endpoint}?${queryParams.toString()}`;
        }
        
        return this.request(url, { method: 'GET' });
    },
    
    // POST request
    post: async function(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    },
    
    // PUT request
    put: async function(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    },
    
    // PATCH request
    patch: async function(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data
        });
    },
    
    // DELETE request
    delete: async function(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },
    
    // Upload file(s)
    upload: async function(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header, browser will set it with boundary
            headers: {}
        });
    },
    
    // Handle API errors in UI
    displayApiError: function(error, elementId = 'error') {
        const errorElement = document.getElementById(elementId);
        if (!errorElement) {
            console.error('Error element not found:', elementId);
            console.error('API Error:', error);
            alert(error.message || 'An error occurred');
            return;
        }
        
        errorElement.textContent = error.message || 'An error occurred';
        errorElement.style.display = 'block';
        
        // If there are field errors, display them if corresponding error elements exist
        if (error.hasFieldErrors) {
            for (const [field, message] of Object.entries(error.fieldErrors)) {
                const fieldError = document.getElementById(`${field}-error`);
                if (fieldError) {
                    fieldError.textContent = message;
                    fieldError.style.display = 'block';
                }
            }
        }
        
        // Scroll error into view
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    
    // Clear API errors in UI
    clearApiErrors: function() {
        // Clear main error
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Clear all field errors
        const fieldErrors = document.querySelectorAll('[id$="-error"]');
        fieldErrors.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    },
    
    // Display loading state
    showLoading: function(isLoading = true, loadingElementId = 'loading') {
        const loadingElement = document.getElementById(loadingElementId);
        if (loadingElement) {
            loadingElement.style.display = isLoading ? 'block' : 'none';
        }
    },
    
    // Display success message
    showSuccess: function(message, elementId = 'success') {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            // Scroll success into view
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};

// Expose helper globally
window.ApiHelper = ApiHelper; 