import apiClient from '@/lib/api-client';
import type { Clip, ClipCreate, PaginatedResponse } from '@/types';

export const clipsService = {
  /** Create a clip from a stream */
  async create(streamId: string, data: ClipCreate): Promise<Clip> {
    return apiClient.post(`/streams/${streamId}/clips`, data, true);
  },

  /** Get clips for a specific stream */
  async getByStream(streamId: string, page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Clip>> {
    return apiClient.get(`/streams/${streamId}/clips?page=${page}&per_page=${perPage}`);
  },

  /** Get clips created by a specific user */
  async getByUser(username: string, page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Clip>> {
    return apiClient.get(`/streams/users/${username}/clips?page=${page}&per_page=${perPage}`);
  },

  /** Get a single clip by ID */
  async getById(clipId: string): Promise<Clip> {
    return apiClient.get(`/streams/clips/${clipId}`);
  },

  /** Delete a clip (requires auth - owner only) */
  async delete(clipId: string): Promise<void> {
    return apiClient.delete(`/streams/clips/${clipId}`, true);
  },

  /** Get popular clips across the platform */
  async getPopular(limit: number = 20): Promise<Clip[]> {
    return apiClient.get(`/streams/clips/popular?limit=${limit}`);
  },
};
