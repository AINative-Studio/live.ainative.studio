// ==================== Core Types ====================

export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERUSER';
  followerCount: number;
  followingCount: number;
  isLive: boolean;
  socials?: UserSocials;
  createdAt: string;
}

export interface UserSocials {
  twitter?: string;
  github?: string;
  youtube?: string;
  website?: string;
}

// ==================== Stream Types ====================

export type StreamStatus = 'offline' | 'live' | 'ended' | 'processing';

export interface Stream {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: StreamStatus;
  categoryId: string | null;
  category: Category | null;
  thumbnailUrl: string | null;
  streamKey: string | null;  // Only for owner
  cloudflareVideoId: string | null;  // Cloudflare Stream video ID
  viewerCount: number;
  peakViewers: number;
  tags: StreamTag[];
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  user: StreamUser;
  // Mock data fallback fields
  username?: string;
  displayName?: string;
  avatar?: string | null;
  thumbnail?: string | null;
  live?: boolean;
  viewers?: number;
}

export interface StreamUser {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}

export interface StreamTag {
  id: string;
  name: string;
  slug: string;
}

export interface StreamCreate {
  title: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

export interface StreamUpdate {
  title?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
}

// ==================== Category Types ====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  streamCount: number;
  viewerCount: number;
  isActive: boolean;
  parentId: string | null;
  children?: Category[];
  createdAt: string;
}

export interface CategoryWithStats extends Category {
  liveStreams: number;
  totalViewers: number;
}

// ==================== Chat Types ====================

export type MessageType = 'chat' | 'system' | 'subscription' | 'donation' | 'announcement';

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  content: string;
  messageType: MessageType;
  badges: UserBadge[];
  isDeleted: boolean;
  createdAt: string;
}

export interface UserBadge {
  type: 'subscriber' | 'moderator' | 'vip' | 'broadcaster' | 'verified';
  label: string;
}

export interface ChatMessageCreate {
  content: string;
}

// ==================== VOD Types ====================

export type VODStatus = 'processing' | 'ready' | 'failed' | 'deleted';

export interface VODRecording {
  id: string;
  streamId: string;
  userId: string;
  title: string;
  description: string | null;
  status: VODStatus;
  duration: number;  // seconds
  thumbnailUrl: string | null;
  videoUrl: string | null;
  viewCount: number;
  chapters: VODChapter[];
  createdAt: string;
  stream: {
    title: string;
    category: Category | null;
  };
}

export interface VODChapter {
  id: string;
  vodId: string;
  title: string;
  description: string | null;
  startTimeSeconds: number;
  endTimeSeconds: number;
  thumbnailUrl: string | null;
  isAiGenerated: boolean;
  confidenceScore: number | null;
}

// ==================== Schedule Types ====================

export interface Schedule {
  id: string;
  userId: string;
  dayOfWeek: number;  // 0=Monday, 6=Sunday
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  title: string;
  category: Category | null;
  isRecurring: boolean;
  createdAt: string;
}

export interface WeeklySchedule {
  userId: string;
  username: string;
  schedule: DaySchedule[];
  totalEntries: number;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayName: string;
  schedules: Schedule[];
}

export interface UpcomingStream {
  scheduleId: string;
  date: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  title: string;
  category: Category | null;
}

// ==================== Follow Types ====================

export interface Follow {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
}

export interface FollowNotification {
  id: string;
  type: 'new_follower' | 'stream_live';
  followerId: string;
  followerUsername: string;
  followerAvatar: string | null;
  isRead: boolean;
  createdAt: string;
}

// ==================== Search Types ====================

export interface SearchResult {
  streams: Stream[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchFilters {
  query: string;
  categoryId?: string;
  status?: 'live' | 'ended' | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export interface TrendingStreamsResponse {
  streams: Stream[];
  total: number;
  limit: number;
  time_window_hours: number;
}

// ==================== Analytics Types ====================

export interface ChannelOverview {
  totalStreams: number;
  completedStreams: number;
  totalHoursStreamed: number;
  avgViewersPerStream: number;
  maxPeakViewers: number;
  totalUniqueViewers: number;
  followerCount: number;
}

export interface FollowerGrowth {
  timeline: {
    date: string;
    newFollowers: number;
    totalFollowers: number;
  }[];
  periodDays: number;
  totalNewFollowers: number;
  growthRatePercent: number;
}

export interface ViewerGrowth {
  timeline: {
    date: string;
    totalViews: number;
    uniqueViewers: number;
    avgPeakViewers: number;
  }[];
  periodDays: number;
  totalViews: number;
  totalUniqueViewers: number;
}

export interface TopStream {
  id: string;
  title: string;
  description: string | null;
  peakViewers: number;
  durationSeconds: number;
  totalViews: number;
  totalMessages: number;
  category: {
    name: string;
    slug: string;
  } | null;
  startedAt: string;
  endedAt: string | null;
}

export interface BestStreamingTime {
  dayOfWeek: number;
  dayName: string;
  hourOfDay: number;
  avgViewers: number;
  streamCount: number;
}

// ==================== Dashboard Types ====================

export interface DashboardOverview {
  currentStream: Stream | null;
  recentStreams: Stream[];
  followerCount: number;
  totalViews: number;
  upcomingSchedule: UpcomingStream[];
  notifications: FollowNotification[];
}

export interface DashboardQuickStats {
  todayViewers: number;
  weeklyViewers: number;
  monthlyViewers: number;
  avgStreamDuration: number;
  newFollowersToday: number;
  newFollowersWeek: number;
}

// ==================== API Response Types ====================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface ApiError {
  detail: string;
  message?: string;
  status?: number;
  traceId?: string;
}

// ==================== VOD Types ====================

export interface VODQualityLevel {
  label: string;
  height: number;
  width: number;
  bitrate: number;
  url?: string;
}

// ==================== Moderator Types ====================

export interface Moderator {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isVip: boolean;
  addedAt: string;
}

export interface ModeratorCreate {
  userId: string;
  isVip?: boolean;
}

export interface ModeratorUpdate {
  isVip?: boolean;
}

export interface ModeratorSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  avatarUrl?: string | null;
}
