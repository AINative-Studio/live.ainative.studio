import { getAuthToken, refreshToken, clearAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  detail: string;
  status: number;
  traceId?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(authenticated: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (!refreshed) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: 'An unexpected error occurred',
        status: response.status,
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: unknown, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  // Form data upload (for thumbnails, avatars)
  async upload<T>(endpoint: string, formData: FormData, authenticated: boolean = true): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
