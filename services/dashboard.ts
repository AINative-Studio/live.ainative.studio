import apiClient from '@/lib/api-client';
import type {
  DashboardOverview,
  DashboardQuickStats,
  ChannelOverview,
  FollowerGrowth,
  ViewerGrowth,
  TopStream,
  BestStreamingTime,
  FollowNotification,
  Schedule,
  WeeklySchedule,
} from '@/types';

export const dashboardService = {
  // ==================== Overview ====================
  // NOTE: /dashboard/* endpoints are not yet implemented on the backend.
  // These return sensible defaults until the API is built.

  /** Get dashboard overview (requires auth) */
  async getOverview(): Promise<DashboardOverview> {
    return {
      currentStream: null,
      recentStreams: [],
      followerCount: 0,
      totalViews: 0,
      upcomingSchedule: [],
      notifications: [],
    };
  },

  /** Get quick stats (requires auth) */
  async getQuickStats(): Promise<DashboardQuickStats> {
    return {
      todayViewers: 0,
      weeklyViewers: 0,
      monthlyViewers: 0,
      avgStreamDuration: 0,
      newFollowersToday: 0,
      newFollowersWeek: 0,
    };
  },

  /** Get recent activity (requires auth) */
  async getRecentActivity(): Promise<{
    recentStreams: any[];
    recentFollowers: any[];
    recentEvents: any[];
  }> {
    return { recentStreams: [], recentFollowers: [], recentEvents: [] };
  },

  // ==================== Notifications ====================

  /** Get notifications (requires auth) */
  async getNotifications(page: number = 1): Promise<{
    notifications: FollowNotification[];
    total: number;
    unreadCount: number;
  }> {
    return { notifications: [], total: 0, unreadCount: 0 };
  },

  /** Mark notification as read (requires auth) */
  async markNotificationRead(notificationId: string): Promise<void> {
    return apiClient.post(`/streams/notifications/follows/${notificationId}/read`, {}, true);
  },

  /** Get unread notification count (requires auth) */
  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get('/streams/notifications/follows/unread-count', true);
  },

  // ==================== Schedule ====================

  /** Get my schedule (requires auth) */
  async getMySchedule(): Promise<WeeklySchedule> {
    return apiClient.get('/streams/me/schedule', true);
  },

  /** Create schedule entry (requires auth) */
  async createSchedule(data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    title: string;
    categoryId?: string;
    isRecurring?: boolean;
  }): Promise<Schedule> {
    return apiClient.post('/streams/me/schedule', data, true);
  },

  /** Update schedule entry (requires auth) */
  async updateSchedule(scheduleId: string, data: Partial<{
    startTime: string;
    endTime: string;
    title: string;
    categoryId: string;
    isRecurring: boolean;
  }>): Promise<Schedule> {
    return apiClient.put(`/streams/me/schedule/${scheduleId}`, data, true);
  },

  /** Delete schedule entry (requires auth) */
  async deleteSchedule(scheduleId: string): Promise<void> {
    return apiClient.delete(`/streams/me/schedule/${scheduleId}`, true);
  },

  // ==================== Analytics ====================

  /** Get channel analytics overview (requires auth) */
  async getChannelOverview(): Promise<ChannelOverview> {
    return apiClient.get('/streams/analytics/channel', true);
  },

  /** Get follower growth (requires auth) */
  async getFollowerGrowth(days: number = 30): Promise<FollowerGrowth> {
    return apiClient.get(`/streams/analytics/channel/growth?days=${days}`, true);
  },

  /** Get viewer growth (requires auth) */
  async getViewerGrowth(days: number = 30): Promise<ViewerGrowth> {
    return apiClient.get(`/streams/analytics/channel/viewer-growth?days=${days}`, true);
  },

  /** Get top streams (requires auth) */
  async getTopStreams(metric: string = 'peak_viewers', limit: number = 10): Promise<TopStream[]> {
    return apiClient.get(`/streams/analytics/channel/top-streams?metric=${metric}&limit=${limit}`, true);
  },

  /** Get best streaming times (requires auth) */
  async getBestTimes(): Promise<{ bestTimes: BestStreamingTime[]; timezone: string }> {
    return apiClient.get('/streams/analytics/channel/best-times', true);
  },

  /** Get audience demographics (requires auth) */
  async getAudienceDemographics(): Promise<{
    geographicBreakdown: { countryCode: string; viewerCount: number; percentage: number }[];
    viewerTypeBreakdown: { authenticated: number; anonymous: number };
    avgWatchTimeMinutes: number;
  }> {
    return apiClient.get('/streams/analytics/channel/audience', true);
  },

  /** Get category breakdown (requires auth) */
  async getCategoryBreakdown(): Promise<{
    categoryId: string;
    categoryName: string;
    streamCount: number;
    avgPeakViewers: number;
    totalHours: number;
  }[]> {
    return apiClient.get('/streams/analytics/channel/categories', true);
  },

  /** Get revenue analytics (requires auth) - placeholder */
  async getRevenue(): Promise<{
    totalRevenue: number;
    thisMonthRevenue: number;
    revenueSources: Record<string, number>;
    note: string;
  }> {
    return apiClient.get('/streams/analytics/channel/revenue', true);
  },
};
