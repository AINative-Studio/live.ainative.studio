import { apiClient } from '../api-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Client Response Transformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET requests', () => {
    it('should transform snake_case response to camelCase', async () => {
      const mockResponse = {
        user_id: '123',
        display_name: 'Test User',
        created_at: '2024-01-01',
        follower_count: 100,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/test-endpoint');

      expect(result).toEqual({
        userId: '123',
        displayName: 'Test User',
        createdAt: '2024-01-01',
        followerCount: 100,
      });
    });

    it('should transform nested snake_case objects', async () => {
      const mockResponse = {
        stream_id: '456',
        user_data: {
          user_id: '123',
          display_name: 'Streamer',
        },
        viewer_count: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/streams/456');

      expect(result).toEqual({
        streamId: '456',
        userData: {
          userId: '123',
          displayName: 'Streamer',
        },
        viewerCount: 50,
      });
    });

    it('should transform arrays of objects', async () => {
      const mockResponse = {
        streams: [
          {
            stream_id: '1',
            viewer_count: 10,
          },
          {
            stream_id: '2',
            viewer_count: 20,
          },
        ],
        total_count: 2,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/streams');

      expect(result).toEqual({
        streams: [
          {
            streamId: '1',
            viewerCount: 10,
          },
          {
            streamId: '2',
            viewerCount: 20,
          },
        ],
        totalCount: 2,
      });
    });

    it('should preserve null and undefined values', async () => {
      const mockResponse = {
        user_id: '123',
        avatar_url: null,
        bio: undefined,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/users/123');

      expect(result).toEqual({
        userId: '123',
        avatarUrl: null,
        bio: undefined,
      });
    });

    it('should handle 204 No Content without transformation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.delete('/streams/123', true);

      expect(result).toEqual({});
    });
  });

  describe('POST requests', () => {
    it('should transform snake_case response to camelCase', async () => {
      const mockResponse = {
        stream_id: '789',
        stream_key: 'abc123',
        created_at: '2024-01-01',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/streams', {
        title: 'New Stream',
      });

      expect(result).toEqual({
        streamId: '789',
        streamKey: 'abc123',
        createdAt: '2024-01-01',
      });
    });
  });

  describe('PUT requests', () => {
    it('should transform snake_case response to camelCase', async () => {
      const mockResponse = {
        stream_id: '789',
        title: 'Updated Stream',
        updated_at: '2024-01-02',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.put('/streams/789', {
        title: 'Updated Stream',
      });

      expect(result).toEqual({
        streamId: '789',
        title: 'Updated Stream',
        updatedAt: '2024-01-02',
      });
    });
  });

  describe('Error responses', () => {
    it('should not transform error responses that fail before JSON parsing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          detail: 'Resource not found',
          status: 404,
        }),
      });

      await expect(apiClient.get('/nonexistent')).rejects.toThrow('Resource not found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/streams')).rejects.toThrow('Network error');
    });
  });

  describe('Real-world scenarios', () => {
    it('should transform complex stream response with nested user', async () => {
      const mockResponse = {
        id: 'stream_123',
        user_id: 'user_456',
        title: 'Coding Stream',
        description: 'Building a web app',
        status: 'live',
        category_id: 'cat_1',
        thumbnail_url: 'thumb.jpg',
        viewer_count: 150,
        peak_viewers: 200,
        started_at: '2024-01-01T10:00:00Z',
        created_at: '2024-01-01T09:00:00Z',
        user: {
          id: 'user_456',
          username: 'streamer',
          display_name: 'The Streamer',
          avatar: 'avatar.jpg',
        },
        tags: [
          {
            id: 'tag_1',
            name: 'JavaScript',
            slug: 'javascript',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/streams/stream_123');

      expect(result).toEqual({
        id: 'stream_123',
        userId: 'user_456',
        title: 'Coding Stream',
        description: 'Building a web app',
        status: 'live',
        categoryId: 'cat_1',
        thumbnailUrl: 'thumb.jpg',
        viewerCount: 150,
        peakViewers: 200,
        startedAt: '2024-01-01T10:00:00Z',
        createdAt: '2024-01-01T09:00:00Z',
        user: {
          id: 'user_456',
          username: 'streamer',
          displayName: 'The Streamer',
          avatar: 'avatar.jpg',
        },
        tags: [
          {
            id: 'tag_1',
            name: 'JavaScript',
            slug: 'javascript',
          },
        ],
      });
    });

    it('should transform paginated response', async () => {
      const mockResponse = {
        items: [
          {
            stream_id: '1',
            viewer_count: 100,
          },
          {
            stream_id: '2',
            viewer_count: 200,
          },
        ],
        total: 50,
        page: 1,
        per_page: 10,
        has_more: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/streams?page=1&per_page=10');

      expect(result).toEqual({
        items: [
          {
            streamId: '1',
            viewerCount: 100,
          },
          {
            streamId: '2',
            viewerCount: 200,
          },
        ],
        total: 50,
        page: 1,
        perPage: 10,
        hasMore: true,
      });
    });
  });
});
