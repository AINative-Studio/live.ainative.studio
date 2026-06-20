import apiClient from '@/lib/api-client';
import type { VODRecording, VODChapter, PaginatedResponse } from '@/types';

export const vodService = {
  /** Get all VODs */
  async getAll(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<VODRecording>> {
    return apiClient.get(`/streams/vods?page=${page}&per_page=${perPage}`);
  },

  /** Get VOD by ID */
  async getById(vodId: string): Promise<VODRecording> {
    return apiClient.get(`/streams/vods/${vodId}`, true);
  },

  /** Get VOD chapters */
  async getChapters(vodId: string): Promise<VODChapter[]> {
    return apiClient.get(`/streams/vods/${vodId}/chapters`);
  },

  /** Create VOD chapter (requires auth - owner only) */
  async createChapter(vodId: string, data: {
    title: string;
    description?: string;
    startTimeSeconds: number;
    endTimeSeconds: number;
  }): Promise<VODChapter> {
    return apiClient.post(`/streams/vods/${vodId}/chapters`, data, true);
  },

  /** Generate AI chapters (requires auth - owner only) */
  async generateChapters(vodId: string, options?: {
    useChatData?: boolean;
    minChapterDuration?: number;
    maxChapters?: number;
  }): Promise<VODChapter[]> {
    return apiClient.post(`/streams/vods/${vodId}/chapters/generate`, options || {}, true);
  },

  /** Update VOD metadata (requires auth - owner only) */
  async update(vodId: string, data: {
    title?: string;
    description?: string;
  }): Promise<VODRecording> {
    return apiClient.put(`/streams/vods/${vodId}`, data, true);
  },

  /** Delete VOD (requires auth - owner only) */
  async delete(vodId: string): Promise<void> {
    return apiClient.delete(`/streams/vods/${vodId}`, true);
  },

  /** Search VODs */
  async search(query: string, page: number = 1, perPage: number = 20): Promise<PaginatedResponse<VODRecording>> {
    return apiClient.get(`/streams/vods/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
  },
};
