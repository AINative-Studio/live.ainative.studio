import { apiClient, ApiError, NotFoundError, ForbiddenError } from '../api-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('422 Validation Errors - Array Format', () => {
    it('should parse single validation error with message field', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Title is required',
            field: 'title',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams/me/schedule', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'title: Title is required',
        status: 422,
      });
    });

    it('should parse multiple validation errors', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Title is required',
            field: 'title',
          },
          {
            message: 'Start time must be in the future',
            field: 'startTime',
          },
          {
            message: 'Category is invalid',
            field: 'category',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams/me/schedule', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'title: Title is required\nstartTime: Start time must be in the future\ncategory: Category is invalid',
        status: 422,
      });
    });

    it('should parse validation errors with detail field instead of message', async () => {
      const mockErrorResponse = {
        detail: [
          {
            detail: 'Email format is invalid',
            field: 'email',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/users', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'email: Email format is invalid',
        status: 422,
      });
    });

    it('should parse FastAPI-style validation errors with loc array', async () => {
      const mockErrorResponse = {
        detail: [
          {
            loc: ['body', 'title'],
            message: 'field required',
            type: 'value_error.missing',
          },
          {
            loc: ['body', 'start_time'],
            message: 'invalid datetime format',
            type: 'value_error.datetime',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams/me/schedule', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'title: field required\nstart_time: invalid datetime format',
        status: 422,
      });
    });

    it('should handle validation errors without field names', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Validation failed',
          },
          {
            detail: 'Invalid request',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Validation failed\nInvalid request',
        status: 422,
      });
    });

    it('should handle empty validation error array', async () => {
      const mockErrorResponse = {
        detail: [],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Validation error',
        status: 422,
      });
    });

    it('should handle validation errors without message or detail fields', async () => {
      const mockErrorResponse = {
        detail: [
          {
            field: 'title',
            type: 'required',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Validation error',
        status: 422,
      });
    });
  });

  describe('422 Validation Errors - String Format', () => {
    it('should handle string detail directly', async () => {
      const mockErrorResponse = {
        detail: 'Invalid request format',
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Invalid request format',
        status: 422,
      });
    });
  });

  describe('404 Not Found Errors', () => {
    it('should parse 404 error with string detail', async () => {
      const mockErrorResponse = {
        detail: 'Stream not found',
        status: 404,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/streams/nonexistent')).rejects.toMatchObject({
        name: 'NotFoundError',
        message: 'Stream not found',
        status: 404,
      });
    });

    it('should parse 404 error with array of validation errors', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Resource not found',
          },
        ],
        status: 404,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/streams/nonexistent')).rejects.toMatchObject({
        name: 'NotFoundError',
        message: 'Resource not found',
        status: 404,
      });
    });
  });

  describe('403 Forbidden Errors', () => {
    it('should parse 403 error with string detail', async () => {
      const mockErrorResponse = {
        detail: 'You do not have permission to access this resource',
        status: 403,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/admin/users')).rejects.toMatchObject({
        name: 'ForbiddenError',
        message: 'You do not have permission to access this resource',
        status: 403,
      });
    });

    it('should parse 403 error with array format', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Insufficient permissions',
          },
        ],
        status: 403,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/admin/users')).rejects.toMatchObject({
        name: 'ForbiddenError',
        message: 'Insufficient permissions',
        status: 403,
      });
    });
  });

  describe('Other Error Status Codes', () => {
    it('should parse 400 error with validation errors', async () => {
      const mockErrorResponse = {
        detail: [
          {
            message: 'Invalid JSON format',
          },
        ],
        status: 400,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Invalid JSON format',
        status: 400,
      });
    });

    it('should handle 500 error with string detail', async () => {
      const mockErrorResponse = {
        detail: 'Internal server error',
        status: 500,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/streams')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'Internal server error',
        status: 500,
      });
    });

    it('should handle error with traceId', async () => {
      const mockErrorResponse = {
        detail: 'An error occurred',
        status: 500,
        traceId: 'trace-123-456',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.get('/streams')).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An error occurred',
        status: 500,
        traceId: 'trace-123-456',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle error response with missing detail field', async () => {
      const mockErrorResponse = {
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred',
        status: 422,
      });
    });

    it('should handle error response with null detail', async () => {
      const mockErrorResponse = {
        detail: null,
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred',
        status: 422,
      });
    });

    it('should handle error response with undefined detail', async () => {
      const mockErrorResponse = {
        detail: undefined,
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred',
        status: 422,
      });
    });

    it('should handle JSON parsing failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.post('/streams', {})).rejects.toMatchObject({
        name: 'ApiError',
        message: 'An unexpected error occurred',
        status: 422,
      });
    });
  });

  describe('Real-world scenario from issue #102', () => {
    it('should properly display validation errors instead of [object Object]', async () => {
      // This is the actual error format that was causing [object Object] display
      const mockErrorResponse = {
        detail: [
          {
            message: 'Title is required',
            field: 'title',
            type: 'value_error.missing',
          },
          {
            message: 'Start time must be in the future',
            field: 'startTime',
            type: 'value_error.datetime',
          },
          {
            message: 'Category is invalid',
            field: 'categoryId',
            type: 'value_error',
          },
        ],
        status: 422,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      try {
        await apiClient.post('/streams/me/schedule', {
          title: '',
          startTime: '2020-01-01',
          categoryId: 'invalid',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;

        // Verify the error message is human-readable, not [object Object]
        expect(apiError.message).not.toContain('[object Object]');
        expect(apiError.message).toContain('Title is required');
        expect(apiError.message).toContain('Start time must be in the future');
        expect(apiError.message).toContain('Category is invalid');

        // Verify field names are included
        expect(apiError.message).toContain('title:');
        expect(apiError.message).toContain('startTime:');
        expect(apiError.message).toContain('categoryId:');

        // Verify errors are separated by newlines
        expect(apiError.message.split('\n').length).toBe(3);

        expect(apiError.status).toBe(422);
      }
    });
  });
});
