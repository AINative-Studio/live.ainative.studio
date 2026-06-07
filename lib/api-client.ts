import { getAuthToken, refreshToken, clearAuth } from './auth';
import { transformKeys } from './transformers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiErrorBody {
  detail: string | ValidationError[];
  status: number;
  traceId?: string;
}

interface ValidationError {
  message?: string;
  detail?: string;
  field?: string;
  type?: string;
  loc?: string[];
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

// Default request timeout — prevents fetch() from hanging indefinitely when
// the API is unreachable, which would keep skeleton loaders visible forever
// because the finally block never executes (issue #22).
const REQUEST_TIMEOUT_MS = 8000;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Wraps fetch with an AbortController timeout so that requests always
   * settle within REQUEST_TIMEOUT_MS. The AbortError propagates as a normal
   * thrown Error so all callers' catch/finally blocks execute correctly.
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timerId);
    }
  }

  /**
   * Parse error details from API response
   * Handles both string details and arrays of validation error objects
   */
  private parseErrorMessage(detail: string | ValidationError[] | undefined): string {
    if (!detail) {
      return 'An unexpected error occurred';
    }

    // If detail is a string, return it directly
    if (typeof detail === 'string') {
      return detail;
    }

    // If detail is an array of validation errors
    if (Array.isArray(detail)) {
      const messages = detail
        .map((error) => {
          // Try to extract message from various possible fields
          const message = error.message || error.detail;

          // If there's a field name, include it for context
          if (error.field && message) {
            return `${error.field}: ${message}`;
          }

          // If there's a location array (FastAPI style), format it
          if (error.loc && Array.isArray(error.loc) && message) {
            const field = error.loc[error.loc.length - 1]; // Get the last item (field name)
            return `${field}: ${message}`;
          }

          return message || 'Validation error';
        })
        .filter(Boolean); // Remove any undefined/null values

      // Join multiple error messages with newlines
      return messages.length > 0 ? messages.join('\n') : 'Validation error';
    }

    // Fallback for unexpected format
    return 'An unexpected error occurred';
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
      const errorMessage = this.parseErrorMessage(errorBody.detail);
      throw new NotFoundError(errorMessage);
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Don't wipe auth on 401 — the token may still be valid for other requests.
      // Only redirect to login if there's genuinely no token stored.
      const token = typeof window !== 'undefined' ? localStorage.getItem('ainative_access_token') : null;
      if (!token) {
        throw new UnauthorizedError('Authentication required');
      }
      // Token exists but request failed — could be a transient issue or
      // the specific endpoint requires different auth. Don't wipe the session.
      throw new UnauthorizedError('Authentication required');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorBody: ApiErrorBody = await response.json().catch(() => ({
        detail: 'Forbidden',
        status: 403,
      }));
      const errorMessage = this.parseErrorMessage(errorBody.detail);
      throw new ForbiddenError(errorMessage);
    }

    // Handle other errors (including 422 validation errors)
    if (!response.ok) {
      const errorBody: ApiErrorBody = await response.json().catch(() => ({
        detail: 'An unexpected error occurred',
        status: response.status,
      }));
      const errorMessage = this.parseErrorMessage(errorBody.detail);
      throw new ApiError(
        errorMessage || `HTTP ${response.status}`,
        response.status,
        errorBody.traceId
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON and transform snake_case keys to camelCase
    const data = await response.json();
    return transformKeys(data) as T;
  }

  async get<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await this.fetchWithTimeout(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await this.fetchWithTimeout(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: unknown, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await this.fetchWithTimeout(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const headers = await this.getHeaders(authenticated);
    const response = await this.fetchWithTimeout(`${this.baseUrl}${normalizedEndpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  // Form data upload (for thumbnails, avatars) — uses a longer timeout for large payloads
  async upload<T>(endpoint: string, formData: FormData, authenticated: boolean = true): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), 30000); // 30s for uploads
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timerId);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
