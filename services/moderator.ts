import apiClient from '@/lib/api-client';
import type { Moderator, ModeratorCreate, ModeratorUpdate, ModeratorSearchResult } from '@/types';

export const moderatorService = {
  // ==================== Moderator Management ====================

  /** Get all moderators for a stream (requires auth) */
  async getModerators(streamId: string): Promise<Moderator[]> {
    return apiClient.get(`/streams/${streamId}/moderators`, true);
  },

  /** Search users to add as moderators (requires auth) */
  async searchUsers(query: string): Promise<ModeratorSearchResult[]> {
    return apiClient.get(`/streams/search/users?q=${encodeURIComponent(query)}`, true);
  },

  /** Add a moderator to a stream (requires auth) */
  async addModerator(streamId: string, data: ModeratorCreate): Promise<Moderator> {
    return apiClient.post(`/streams/${streamId}/moderators`, data, true);
  },

  /** Remove a moderator from a stream (requires auth) */
  async removeModerator(streamId: string, moderatorId: string): Promise<void> {
    return apiClient.delete(`/streams/${streamId}/moderators/${moderatorId}`, true);
  },

  /** Update moderator settings (e.g., VIP status) (requires auth) */
  async updateModerator(
    streamId: string,
    moderatorId: string,
    data: ModeratorUpdate
  ): Promise<Moderator> {
    return apiClient.put(`/streams/${streamId}/moderators/${moderatorId}`, data, true);
  },
};
