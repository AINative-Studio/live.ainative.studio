import { streamsService } from '../streams';
import apiClient from '@/lib/api-client';
import type { Stream, TrendingStreamsResponse } from '@/types';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('Streams Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrending', () => {
    const mockStreams: Stream[] = [
      {
        id: 'stream-1',
        userId: 'user-1',
        title: 'Trending Stream 1',
        description: 'A trending stream',
        status: 'live',
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          name: 'Gaming',
          slug: 'gaming',
          description: 'Gaming category',
          iconUrl: null,
          streamCount: 100,
          viewerCount: 1000,
          isActive: true,
          parentId: null,
          createdAt: '2024-01-01T00:00:00Z',
        },
        thumbnailUrl: 'https://example.com/thumb.jpg',
        streamKey: null,
        cloudflareVideoId: 'video-123',
        viewerCount: 1500,
        peakViewers: 2000,
        tags: [],
        startedAt: '2024-01-01T12:00:00Z',
        endedAt: null,
        createdAt: '2024-01-01T12:00:00Z',
        user: {
          id: 'user-1',
          username: 'streamer1',
          displayName: 'Streamer One',
          avatar: null,
        },
      },
    ];

    it('should include limit field in TrendingStreamsResponse type', async () => {
      // Given a trending streams response with limit field
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 1,
        limit: 20,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams
      const response = await streamsService.getTrending(20);

      // Then response should include limit field
      expect(response).toHaveProperty('limit');
      expect(response.limit).toBe(20);
      expect(typeof response.limit).toBe('number');
    });

    it('should fetch trending streams with default limit', async () => {
      // Given a mock response
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 1,
        limit: 20,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams
      const response = await streamsService.getTrending();

      // Then it should call the API with default limit
      expect(apiClient.get).toHaveBeenCalledWith('/streams/trending?limit=20');
      expect(response.streams).toEqual(mockStreams);
      expect(response.total).toBe(1);
      expect(response.limit).toBe(20);
    });

    it('should fetch trending streams with custom limit', async () => {
      // Given a custom limit
      const customLimit = 50;
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 1,
        limit: customLimit,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams with custom limit
      const response = await streamsService.getTrending(customLimit);

      // Then it should call the API with the custom limit
      expect(apiClient.get).toHaveBeenCalledWith(`/streams/trending?limit=${customLimit}`);
      expect(response.limit).toBe(customLimit);
    });

    it('should validate TrendingStreamsResponse structure', async () => {
      // Given a complete response
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 100,
        limit: 20,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams
      const response = await streamsService.getTrending();

      // Then response should have all required fields
      expect(response).toHaveProperty('streams');
      expect(response).toHaveProperty('total');
      expect(response).toHaveProperty('limit');
      expect(response).toHaveProperty('time_window_hours');
      expect(Array.isArray(response.streams)).toBe(true);
      expect(typeof response.total).toBe('number');
      expect(typeof response.limit).toBe('number');
      expect(typeof response.time_window_hours).toBe('number');
    });

    it('should handle empty trending streams', async () => {
      // Given no trending streams
      const mockResponse: TrendingStreamsResponse = {
        streams: [],
        total: 0,
        limit: 20,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams
      const response = await streamsService.getTrending();

      // Then it should return empty streams array with limit field
      expect(response.streams).toEqual([]);
      expect(response.total).toBe(0);
      expect(response.limit).toBe(20);
    });

    it('should handle API errors', async () => {
      // Given API error
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      // When fetching trending streams
      // Then it should throw the error
      await expect(streamsService.getTrending()).rejects.toThrow('Network error');
    });

    it('should handle different time windows', async () => {
      // Given responses with different time windows
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 1,
        limit: 20,
        time_window_hours: 168, // 7 days
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams
      const response = await streamsService.getTrending();

      // Then it should include the time window
      expect(response.time_window_hours).toBe(168);
    });

    it('should handle large limit values', async () => {
      // Given a large limit
      const largeLimit = 100;
      const mockResponse: TrendingStreamsResponse = {
        streams: mockStreams,
        total: 200,
        limit: largeLimit,
        time_window_hours: 24,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching trending streams with large limit
      const response = await streamsService.getTrending(largeLimit);

      // Then it should respect the limit
      expect(response.limit).toBe(largeLimit);
      expect(apiClient.get).toHaveBeenCalledWith(`/streams/trending?limit=${largeLimit}`);
    });
  });

  describe('getRising', () => {
    it('should fetch rising streams with default limit', async () => {
      // Given a mock response
      const mockResponse = {
        streams: [],
        total: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching rising streams
      const response = await streamsService.getRising();

      // Then it should call the API with default limit
      expect(apiClient.get).toHaveBeenCalledWith('/streams/rising?limit=20');
    });

    it('should fetch rising streams with custom limit', async () => {
      // Given a custom limit
      const customLimit = 30;
      const mockResponse = {
        streams: [],
        total: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching rising streams
      await streamsService.getRising(customLimit);

      // Then it should call the API with custom limit
      expect(apiClient.get).toHaveBeenCalledWith(`/streams/rising?limit=${customLimit}`);
    });
  });

  describe('getRecommended', () => {
    it('should fetch recommended streams with authentication', async () => {
      // Given a mock response
      const mockResponse = {
        streams: [],
        total: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // When fetching recommended streams
      await streamsService.getRecommended();

      // Then it should call the API with authentication
      expect(apiClient.get).toHaveBeenCalledWith('/streams/recommended?limit=20', true);
    });
  });

  describe('Stream Lifecycle - Start Endpoint Removal', () => {
    it('should NOT have a start method - stream lifecycle is automatic via webhook', () => {
      // The start method should not exist on the service
      // Streams go live automatically when RTMP connection is established
      expect(streamsService).not.toHaveProperty('start');
    });

    it('should NOT call /start endpoint when creating a stream', async () => {
      // Given stream creation data
      const streamData = {
        title: 'Test Stream',
        description: 'Test Description',
        categoryId: 'cat-1',
      };

      const mockResponse = {
        id: 'stream-1',
        title: 'Test Stream',
        status: 'idle',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // When creating a stream
      await streamsService.create(streamData);

      // Then it should only call the create endpoint
      expect(apiClient.post).toHaveBeenCalledWith('/streams/', streamData, true);
      expect(apiClient.post).toHaveBeenCalledTimes(1);

      // Verify NO call to start endpoint
      expect(apiClient.post).not.toHaveBeenCalledWith(
        expect.stringContaining('/start'),
        expect.anything(),
        expect.anything()
      );
    });

    it('should have end method for manual stream termination', async () => {
      // The end method should still exist for manual termination
      expect(streamsService).toHaveProperty('end');
      expect(typeof streamsService.end).toBe('function');
    });

    it('should call /end endpoint correctly', async () => {
      // Given a stream ID
      const streamId = 'stream-123';
      const mockResponse = {
        id: streamId,
        status: 'ended',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // When ending a stream
      await streamsService.end(streamId);

      // Then it should call the correct endpoint
      expect(apiClient.post).toHaveBeenCalledWith(
        `/streams/id/${streamId}/end`,
        {},
        true
      );
    });
  });
});
