// Helper for API requests with JWT auth
function apiRequest(url, options = {}) {
  // Prepend backend base URL if path starts with /api/
  if (url.startsWith('/api/')) {
    url = 'http://127.0.0.1:8000' + url;
  }
  const token = localStorage.getItem('access');
  options.headers = options.headers || {};
  if (token) {
    options.headers['Authorization'] = 'Bearer ' + token;
  }
  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  return fetch(url, options)
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw { status: res.status, data };
      return data;
    });
}

function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('user');
  location.hash = '#/login';
}
