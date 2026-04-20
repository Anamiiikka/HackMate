export const BASE_URL = '/api/v1';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = false, ...customOptions } = options;
  const headers = new Headers(customOptions.headers);

  // Default to JSON if not uploading form data
  if (!headers.has('Content-Type') && !(customOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        throw new Error('Authentication required. Please log in again.');
      }
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log('📡 API Request:', url);

  try {
    const response = await fetch(url, {
      ...customOptions,
      headers,
    });

    if (!response.ok) {
      // If 401, we might want to trigger a logout or refresh
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth-change'));
        }
      }
      const rawText = await response.text().catch(() => "");
      let errorData: any = {};
      try {
        errorData = JSON.parse(rawText);
      } catch (e) {
        // Not JSON
        console.error("Non-JSON API error response:", rawText);
      }
      throw new Error(errorData.error || `Request failed with status ${response.status}. Raw: ${rawText.substring(0, 50)}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ API Error:', error, 'URL:', url);
    throw error;
  }
};

// Helper object for common HTTP methods
export const api = {
  get: (endpoint: string, options: FetchOptions = {}) =>
    apiFetch(endpoint, { ...options, method: 'GET', requireAuth: true }),

  post: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),

  patch: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),

  delete: (endpoint: string, options: FetchOptions = {}) =>
    apiFetch(endpoint, { ...options, method: 'DELETE', requireAuth: true }),

  put: (endpoint: string, data?: unknown, options: FetchOptions = {}) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth: true,
    }),
};
