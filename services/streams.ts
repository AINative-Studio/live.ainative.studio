import apiClient from '@/lib/api-client';
import type {
  Stream,
  StreamCreate,
  StreamUpdate,
  Category,
  SearchResult,
  SearchFilters,
  PaginatedResponse,
  TrendingStreamsResponse,
} from '@/types';

/**
 * Streams Service
 *
 * Stream Lifecycle:
 * - Streams are created via the create() method, which returns stream credentials (streamKey, etc.)
 * - Streams go LIVE automatically when the RTMP connection is established (managed by backend webhook)
 * - There is NO manual "start stream" endpoint - the backend detects when streaming begins
 * - Streams can be manually ended via the end() method
 * - Users can only have one non-ended stream at a time (enforced by backend)
 */
export const streamsService = {
  // ==================== Discovery ====================

  /** Get trending streams */
  async getTrending(limit: number = 20): Promise<TrendingStreamsResponse> {
    return apiClient.get(`/streams/trending?limit=${limit}`);
  },

  /** Get rising streams */
  async getRising(limit: number = 20): Promise<{ streams: Stream[]; total: number }> {
    return apiClient.get(`/streams/rising?limit=${limit}`);
  },

  /** Get recommended streams (requires auth) */
  async getRecommended(limit: number = 20): Promise<{ streams: Stream[]; total: number }> {
    return apiClient.get(`/streams/recommended?limit=${limit}`, true);
  },

  /** Get all live streams */
  async getLive(): Promise<Stream[]> {
    return apiClient.get('/streams/');
  },

  // ==================== Stream CRUD ====================

  /** Get stream by ID */
  async getById(streamId: string): Promise<Stream> {
    return apiClient.get(`/streams/id/${streamId}`);
  },

  /** Create new stream (requires auth) */
  async create(data: StreamCreate): Promise<Stream> {
    return apiClient.post('/streams/', data, true);
  },

  /** Update stream (requires auth) */
  async update(streamId: string, data: StreamUpdate): Promise<Stream> {
    return apiClient.put(`/streams/id/${streamId}`, data, true);
  },

  /**
   * End stream (requires auth)
   * Note: Streams go live automatically when RTMP connection is established via webhook.
   * This endpoint is only for manually ending a stream.
   */
  async end(streamId: string): Promise<Stream> {
    return apiClient.post(`/streams/id/${streamId}/end`, {}, true);
  },

  /** Get user's active stream (requires auth) - returns first non-ended stream */
  async getActiveStream(): Promise<Stream | null> {
    try {
      // Fetch only the current user's streams using mine=true filter
      const response = await apiClient.get<{ streams: Stream[]; total: number }>('/streams/?mine=true', true);
      const activeStream = response.streams?.find(s => s.status !== 'ended');
      return activeStream || null;
    } catch (error) {
      return null;
    }
  },

  // ==================== Categories ====================

  /** Get all categories */
  async getCategories(): Promise<Category[]> {
    return apiClient.get('/streams/categories');
  },

  /** Get popular categories */
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    const response = await apiClient.get<{ categories: Category[]; total: number }>(
      `/streams/categories/popular?limit=${limit}`
    );
    return response.categories || [];
  },

  /** Get category tree */
  async getCategoryTree(): Promise<Category[]> {
    return apiClient.get('/streams/categories/tree');
  },

  /** Get category by slug */
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiClient.get(`/streams/categories/by-slug/${slug}`);
  },

  /** Get streams in category */
  async getStreamsByCategory(slug: string): Promise<Stream[]> {
    const response = await apiClient.get<{ streams: Stream[]; category: any; total: number }>(
      `/streams/categories/by-slug/${slug}/streams`
    );
    return response.streams || [];
  },

  // ==================== Tags ====================

  /** Get all tags */
  async getTags(): Promise<{ id: string; name: string; slug: string; usageCount: number }[]> {
    return apiClient.get('/streams/streams/tags');
  },

  /** Get popular tags */
  async getPopularTags(limit: number = 20): Promise<{ id: string; name: string; slug: string; usageCount: number }[]> {
    return apiClient.get(`/streams/streams/tags/popular?limit=${limit}`);
  },

  /** Get tag suggestions */
  async getTagSuggestions(query: string): Promise<string[]> {
    return apiClient.get(`/streams/streams/tags/suggestions?query=${encodeURIComponent(query)}`);
  },

  // ==================== Search ====================

  /** Search streams */
  async search(filters: SearchFilters): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append('query', filters.query);
    if (filters.categoryId) params.append('category_id', filters.categoryId);
    if (filters.status) params.append('status_filter', filters.status);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.perPage) params.append('per_page', filters.perPage.toString());

    return apiClient.get(`/streams/search?${params.toString()}`);
  },

  /** Get search suggestions */
  async getSearchSuggestions(query: string): Promise<string[]> {
    return apiClient.get(`/streams/search/suggestions?query=${encodeURIComponent(query)}`);
  },

  /** Get trending searches */
  async getTrendingSearches(): Promise<string[]> {
    return apiClient.get('/streams/search/trending');
  },

  /** Get popular searches */
  async getPopularSearches(): Promise<string[]> {
    return apiClient.get('/streams/search/popular');
  },
};
