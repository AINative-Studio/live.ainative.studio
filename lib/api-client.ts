import { getAuthToken, refreshToken, clearAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiErrorBody {
  detail: string;
  status: number;
  traceId?: string;
}

// Custom Error Classes
export class ApiError extends Error {
  status: number;
  traceId?: string;

  constructor(message: string, status: number, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.traceId = traceId;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Normalize endpoint to ensure trailing slashes for streaming endpoints
   * Backend requires trailing slashes on /streams/ endpoints
   */
  private normalizeEndpoint(endpoint: string): string {
    // If endpoint starts with /streams and doesn't end with a slash (and doesn't have a path param after)
    if (endpoint.startsWith('/streams') && !endpoint.endsWith('/')) {
      // Check if it ends with a path segment (not a query param)
      const hasQueryParams = endpoint.includes('?');
      const baseEndpoint = hasQueryParams ? endpoint.split('?')[0] : endpoint;

      // Only add trailing slash to list endpoints, not detail endpoints
      // e.g., /streams/ needs slash, /streams/id/123 doesn't
      if (baseEndpoint === '/streams' || baseEndpoint === '/streams/categories/trending') {
        const trailingSlash = hasQueryParams ? '/' : '/';
        return hasQueryParams
          ? endpoint.replace('?', '/?')
          : endpoint + trailingSlash;
      }
    }
    return endpoint;
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
    // Handle 404 Not Found
    if (response.status === 404) {
      const errorBody: ApiErrorBody = await response.json().catch(() => ({
        detail: 'Resource not found',
        status: 404,
      }));
      throw new NotFoundError(errorBody.detail);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (!refreshed) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new UnauthorizedError('Authentication required');
      }
      throw new UnauthorizedError('Authentication required');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorBody: ApiErrorBody = await response.json().catch(() => ({
        detail: 'Forbidden',
        status: 403,
      }));
      throw new ForbiddenError(errorBody.detail);
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody: ApiErrorBody = await response.json().catch(() => ({
        detail: 'An unexpected error occurred',
        status: response.status,
      }));
      throw new ApiError(
        errorBody.detail || `HTTP ${response.status}`,
        response.status,
        errorBody.traceId
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: unknown, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${normalizedEndpoint}`, {
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
