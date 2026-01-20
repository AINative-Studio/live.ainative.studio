import { transformStream, transformStreams, transformStreamsResponse } from '../api-transformers';
import type { Stream } from '@/types';

describe('api-transformers', () => {
  describe('transformStream', () => {
    describe('Cloudflare Video ID Mapping (Issue #90)', () => {
      it('should map cloudflare_stream_id to cloudflareVideoId', () => {
        // Given: Backend response with cloudflare_stream_id
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'live',
          category_id: 'cat-1',
          category: null,
          thumbnail_url: 'https://example.com/thumb.jpg',
          stream_key: 'sk_test',
          cloudflare_stream_id: 'cf-video-abc123',
          viewer_count: 100,
          peak_viewers: 150,
          tags: [],
          started_at: '2024-01-01T10:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: cloudflareVideoId should be populated from cloudflare_stream_id
        expect(result.cloudflareVideoId).toBe('cf-video-abc123');
        expect(result.id).toBe('stream-123');
        expect(result.title).toBe('Test Stream');
      });

      it('should handle null cloudflare_stream_id', () => {
        // Given: Backend response with null cloudflare_stream_id
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'offline',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: 'sk_test',
          cloudflare_stream_id: null,
          viewer_count: 0,
          peak_viewers: 0,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: cloudflareVideoId should be undefined (OR operator behavior)
        expect(result.cloudflareVideoId).toBeUndefined();
      });

      it('should handle missing cloudflare_stream_id field', () => {
        // Given: Backend response without cloudflare_stream_id field
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'offline',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: 'sk_test',
          viewer_count: 0,
          peak_viewers: 0,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: cloudflareVideoId should be undefined
        expect(result.cloudflareVideoId).toBeUndefined();
      });

      it('should prioritize cloudflare_stream_id over cloudflareVideoId', () => {
        // Given: Backend response with both snake_case and camelCase
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'live',
          category_id: 'cat-1',
          category: null,
          thumbnail_url: null,
          stream_key: 'sk_test',
          cloudflare_stream_id: 'cf-video-from-snake',
          cloudflareVideoId: 'cf-video-from-camel',
          viewer_count: 50,
          peak_viewers: 75,
          tags: [],
          started_at: '2024-01-01T10:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Should prioritize cloudflare_stream_id (backend field)
        expect(result.cloudflareVideoId).toBe('cf-video-from-snake');
      });

      it('should fall back to cloudflareVideoId if cloudflare_stream_id is null', () => {
        // Given: Backend response with null snake_case but populated camelCase
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'live',
          category_id: 'cat-1',
          category: null,
          thumbnail_url: null,
          stream_key: 'sk_test',
          cloudflare_stream_id: null,
          cloudflareVideoId: 'cf-video-fallback',
          viewer_count: 50,
          peak_viewers: 75,
          tags: [],
          started_at: '2024-01-01T10:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Should fall back to cloudflareVideoId
        expect(result.cloudflareVideoId).toBe('cf-video-fallback');
      });
    });

    describe('Other Field Mappings', () => {
      it('should map all snake_case fields to camelCase', () => {
        // Given: Complete backend response
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'live',
          category_id: 'cat-1',
          category: {
            id: 'cat-1',
            name: 'Programming',
            slug: 'programming',
          },
          thumbnail_url: 'https://example.com/thumb.jpg',
          stream_key: 'sk_test',
          cloudflare_stream_id: 'cf-video-123',
          viewer_count: 100,
          peak_viewers: 150,
          tags: [
            { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
          ],
          started_at: '2024-01-01T10:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: 'https://example.com/avatar.jpg',
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: All fields should be correctly mapped
        expect(result).toMatchObject({
          id: 'stream-123',
          userId: 'user-456',
          title: 'Test Stream',
          description: 'A test stream',
          status: 'live',
          categoryId: 'cat-1',
          category: {
            id: 'cat-1',
            name: 'Programming',
            slug: 'programming',
          },
          thumbnailUrl: 'https://example.com/thumb.jpg',
          streamKey: 'sk_test',
          cloudflareVideoId: 'cf-video-123',
          viewerCount: 100,
          peakViewers: 150,
          tags: [
            { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
          ],
          startedAt: '2024-01-01T10:00:00Z',
          createdAt: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: 'Test User',
            avatar: 'https://example.com/avatar.jpg',
          },
        });
      });

      it('should handle viewer count fallback to 0', () => {
        // Given: Backend response with null viewer counts
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: null,
          status: 'offline',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: null,
          viewer_count: null,
          peak_viewers: null,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: null,
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Viewer counts should default to 0
        expect(result.viewerCount).toBe(0);
        expect(result.peakViewers).toBe(0);
      });

      it('should handle camelCase userId when snake_case is missing', () => {
        // Given: Backend response with camelCase userId instead of snake_case
        const backendResponse = {
          id: 'stream-123',
          userId: 'user-789',
          title: 'Test Stream',
          description: null,
          status: 'offline',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: null,
          viewer_count: 0,
          peak_viewers: 0,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: null,
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Should use camelCase fallback
        expect(result.userId).toBe('user-789');
      });

      it('should handle existing viewerCount when backend uses camelCase', () => {
        // Given: Backend response with camelCase viewerCount
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: null,
          status: 'live',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: null,
          viewerCount: 42,
          peakViewers: 50,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: null,
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Should use camelCase fallback values
        expect(result.viewerCount).toBe(42);
        expect(result.peakViewers).toBe(50);
      });

      it('should handle zero viewerCount from backend', () => {
        // Given: Backend response with zero viewer count
        const backendResponse = {
          id: 'stream-123',
          user_id: 'user-456',
          title: 'Test Stream',
          description: null,
          status: 'live',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: null,
          viewer_count: 0,
          peak_viewers: 0,
          tags: [],
          started_at: null,
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-456',
            username: 'testuser',
            displayName: null,
            avatar: null,
          },
        };

        // When: Transform the backend response
        const result = transformStream(backendResponse);

        // Then: Should preserve zero (not default to 0 via fallback)
        expect(result.viewerCount).toBe(0);
        expect(result.peakViewers).toBe(0);
      });
    });
  });

  describe('transformStreams', () => {
    it('should transform array of backend streams', () => {
      // Given: Array of backend streams
      const backendStreams = [
        {
          id: 'stream-1',
          user_id: 'user-1',
          title: 'Stream 1',
          description: null,
          status: 'live',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: 'cf-1',
          viewer_count: 10,
          peak_viewers: 20,
          tags: [],
          started_at: '2024-01-01T10:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T09:00:00Z',
          user: {
            id: 'user-1',
            username: 'user1',
            displayName: 'User 1',
            avatar: null,
          },
        },
        {
          id: 'stream-2',
          user_id: 'user-2',
          title: 'Stream 2',
          description: null,
          status: 'live',
          category_id: null,
          category: null,
          thumbnail_url: null,
          stream_key: null,
          cloudflare_stream_id: 'cf-2',
          viewer_count: 30,
          peak_viewers: 40,
          tags: [],
          started_at: '2024-01-01T11:00:00Z',
          ended_at: null,
          created_at: '2024-01-01T10:00:00Z',
          user: {
            id: 'user-2',
            username: 'user2',
            displayName: 'User 2',
            avatar: null,
          },
        },
      ];

      // When: Transform the array
      const result = transformStreams(backendStreams);

      // Then: All streams should be transformed with cloudflareVideoId
      expect(result).toHaveLength(2);
      expect(result[0].cloudflareVideoId).toBe('cf-1');
      expect(result[1].cloudflareVideoId).toBe('cf-2');
    });

    it('should handle empty array', () => {
      // Given: Empty array
      const backendStreams: any[] = [];

      // When: Transform the array
      const result = transformStreams(backendStreams);

      // Then: Should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('transformStreamsResponse', () => {
    it('should transform paginated response with streams', () => {
      // Given: Backend paginated response
      const backendResponse = {
        streams: [
          {
            id: 'stream-1',
            user_id: 'user-1',
            title: 'Stream 1',
            description: null,
            status: 'live',
            category_id: null,
            category: null,
            thumbnail_url: null,
            stream_key: null,
            cloudflare_stream_id: 'cf-1',
            viewer_count: 10,
            peak_viewers: 20,
            tags: [],
            started_at: '2024-01-01T10:00:00Z',
            ended_at: null,
            created_at: '2024-01-01T09:00:00Z',
            user: {
              id: 'user-1',
              username: 'user1',
              displayName: 'User 1',
              avatar: null,
            },
          },
        ],
        total: 1,
      };

      // When: Transform the response
      const result = transformStreamsResponse(backendResponse);

      // Then: Should return transformed streams and total
      expect(result.streams).toHaveLength(1);
      expect(result.streams[0].cloudflareVideoId).toBe('cf-1');
      expect(result.total).toBe(1);
    });

    it('should handle missing streams array', () => {
      // Given: Response without streams
      const backendResponse = {
        total: 0,
      };

      // When: Transform the response
      const result = transformStreamsResponse(backendResponse);

      // Then: Should return empty streams array
      expect(result.streams).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
