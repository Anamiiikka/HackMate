export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
      }
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
