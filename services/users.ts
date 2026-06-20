import apiClient from '@/lib/api-client';
import type { User, Stream, VODRecording, WeeklySchedule, UpcomingStream, Follow } from '@/types';

export const usersService = {
  // ==================== User Profile ====================

  /** Get user profile by username */
  async getProfile(username: string): Promise<User> {
    const data = await apiClient.get<any>(`/streams/users/${username}/profile`);
    return {
      ...data,
      // API keys are auto-transformed to camelCase by apiClient (avatarUrl, displayName, etc.)
      displayName: data.displayName || data.fullName || data.username,
      avatar: data.avatarUrl || data.avatar || null,
      username: data.username || null,
    };
  },

  /** Get current user's profile (requires auth) */
  async getMyProfile(): Promise<User> {
    return apiClient.get('/streams/me/profile', true);
  },

  /** Update current user's profile (requires auth) */
  async updateMyProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/streams/me/profile', data, true);
  },

  /** Upload avatar (requires auth) */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/streams/me/profile/avatar', formData);
  },

  /** Upload banner (requires auth) */
  async uploadBanner(file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/streams/me/profile/banner', formData);
  },

  // ==================== User Content ====================

  /** Get user's streams */
  async getStreams(username: string): Promise<Stream[]> {
    const response = await apiClient.get<{ streams: Stream[]; total: number }>(
      `/streams/users/${username}/streams`
    );
    return response.streams || [];
  },

  /** Get user's VODs */
  async getVODs(username: string): Promise<VODRecording[]> {
    return apiClient.get(`/streams/users/${username}/vods`);
  },

  /** Get user's schedule */
  async getSchedule(username: string): Promise<WeeklySchedule> {
    return apiClient.get(`/streams/users/${username}/schedule`);
  },

  /** Get user's upcoming streams */
  async getUpcoming(username: string, days: number = 7): Promise<{ upcomingStreams: UpcomingStream[] }> {
    return apiClient.get(`/streams/users/${username}/upcoming?days=${days}`);
  },

  /** Check if user is live */
  async isLive(username: string): Promise<{ isLive: boolean; stream?: Stream }> {
    return apiClient.get(`/streams/users/${username}/live`);
  },

  /** Get user analytics (public) */
  async getAnalytics(username: string): Promise<{
    totalStreams: number;
    totalHoursStreamed: number;
    avgViewers: number;
    followerCount: number;
  }> {
    return apiClient.get(`/streams/users/${username}/analytics`);
  },

  // ==================== Follow System ====================

  /** Get user's followers */
  async getFollowers(username: string, page: number = 1): Promise<{
    followers: { id: string; username: string; avatar: string }[];
    total: number;
    hasMore: boolean;
  }> {
    return apiClient.get(`/streams/users/${username}/followers?page=${page}`);
  },

  /** Get users that user follows */
  async getFollowing(username: string, page: number = 1): Promise<{
    following: { id: string; username: string; avatar: string }[];
    total: number;
    hasMore: boolean;
  }> {
    return apiClient.get(`/streams/users/${username}/following?page=${page}`);
  },

  /** Follow user (requires auth) */
  async follow(username: string): Promise<Follow> {
    return apiClient.post(`/streams/users/${username}/follow`, {}, true);
  },

  /** Unfollow user (requires auth) */
  async unfollow(username: string): Promise<void> {
    return apiClient.delete(`/streams/users/${username}/follow`, true);
  },

  /** Check if following user (requires auth) */
  async isFollowing(username: string): Promise<{ isFollowing: boolean }> {
    return apiClient.get(`/streams/users/${username}/follow`, true);
  },

  // ==================== GDPR / Account Management ====================

  /** Export all user data (GDPR) (requires auth) */
  async exportMyData(): Promise<Blob> {
    const { getAuthToken } = await import('@/lib/auth');
    const token = getAuthToken();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';
    const response = await fetch(`${API_BASE_URL}/users/me/export`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Data export failed: ${response.status}`);
    }
    return response.blob();
  },

  /** Delete current user account (requires auth) */
  async deleteMyAccount(): Promise<void> {
    return apiClient.delete('/users/me', true);
  },
};
