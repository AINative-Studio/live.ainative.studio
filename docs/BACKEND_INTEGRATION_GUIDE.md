# AINative Studio Live - Frontend Backend Integration Guide

**Version:** 2.0.0
**Date:** 2026-06-20
**Backend API:** https://api.ainative.studio/v1
**Frontend:** Next.js 13.5.1 App Router

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Environment Configuration](#2-environment-configuration)
3. [API Client Setup](#3-api-client-setup)
4. [Authentication Integration](#4-authentication-integration)
5. [TypeScript Types](#5-typescript-types)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [WebSocket Integration (Real-time Chat)](#7-websocket-integration-real-time-chat)
8. [State Management](#8-state-management)
9. [Component Integration Examples](#9-component-integration-examples)
10. [Error Handling](#10-error-handling)
11. [Migration Checklist](#11-migration-checklist)

---

## 1. Quick Start

### Backend API Base URL
```
Production: https://api.ainative.studio/v1
Development: http://localhost:8000/v1
```

### Key Integration Points
| Frontend Component | Backend Endpoint | Status |
|-------------------|------------------|--------|
| Homepage streams | `GET /streams/trending` | Ready |
| Category browse | `GET /streams/categories` | Ready |
| Stream viewer | `GET /streams/id/{stream_id}` | Ready |
| Live chat | WebSocket `/streams/{id}/chat/ws` | Ready |
| User profile | `GET /streams/users/{username}/profile` | Ready |
| Search | `GET /streams/search?query=` | Ready |
| Dashboard | `GET /dashboard/overview` | Ready |
| Authentication | `POST /auth/login` | Ready |

---

## 2. Environment Configuration

### Create `.env.local`
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.ainative.studio/v1
NEXT_PUBLIC_WS_URL=wss://api.ainative.studio/v1

# Development (optional)
NEXT_PUBLIC_API_URL_DEV=http://localhost:8000/v1
NEXT_PUBLIC_WS_URL_DEV=ws://localhost:8000/v1

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_VOD=true
```

### Update `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.ainative.studio',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 3. API Client Setup

### Create `lib/api-client.ts`
```typescript
import { getAuthToken, refreshToken, clearAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  detail: string;
  status: number;
  traceId?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(authenticated: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authenticated) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (!refreshed) {
        clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: 'An unexpected error occurred',
        status: response.status,
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data: unknown, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, authenticated: boolean = false): Promise<T> {
    const headers = await this.getHeaders(authenticated);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  // Form data upload (for thumbnails, avatars)
  async upload<T>(endpoint: string, formData: FormData, authenticated: boolean = true): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
```

---

## 4. Authentication Integration

### Create `lib/auth.ts`
```typescript
const TOKEN_KEY = 'ainative_access_token';
const REFRESH_TOKEN_KEY = 'ainative_refresh_token';
const USER_KEY = 'ainative_user';

export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERUSER';
}

export interface LoginCredentials {
  username: string;  // Can be email
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user?: User;
}

// Token management
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// User management
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // NOTE: Auth uses JSON body, NOT form-urlencoded
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.username,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data: AuthResponse = await response.json();

  // Store tokens
  setAuthToken(data.access_token);
  if (data.refresh_token) {
    setRefreshToken(data.refresh_token);
  }

  // Fetch and store user profile
  await fetchAndStoreUser();

  return data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  const authData: AuthResponse = await response.json();

  setAuthToken(authData.access_token);
  if (authData.refresh_token) {
    setRefreshToken(authData.refresh_token);
  }

  await fetchAndStoreUser();

  return authData;
}

export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
}

export async function refreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refresh }),
    });

    if (!response.ok) {
      clearAuth();
      return false;
    }

    const data: AuthResponse = await response.json();
    setAuthToken(data.access_token);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }

    return true;
  } catch (error) {
    clearAuth();
    return false;
  }
}

async function fetchAndStoreUser(): Promise<void> {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user: User = await response.json();
      setCurrentUser(user);
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
}
```

### Create Auth Context `contexts/auth-context.tsx`
```typescript
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  LoginCredentials,
  RegisterData,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated as checkAuth,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    await authLogin(credentials);
    await refreshUser();
  };

  const register = async (data: RegisterData) => {
    await authRegister(data);
    await refreshUser();
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: checkAuth(),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Update `app/layout.tsx`
```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 5. TypeScript Types

### Update `types/index.ts`
```typescript
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
  viewerCount: number;
  peakViewers: number;
  tags: StreamTag[];
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  user: StreamUser;
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
```

---

## 6. API Endpoints Reference

### Create `services/streams.ts`
```typescript
import apiClient from '@/lib/api-client';
import type {
  Stream,
  StreamCreate,
  StreamUpdate,
  Category,
  SearchResult,
  SearchFilters,
  PaginatedResponse,
} from '@/types';

export const streamsService = {
  // ==================== Discovery ====================

  /** Get trending streams */
  async getTrending(limit: number = 20): Promise<{ streams: Stream[]; total: number }> {
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

  /** Start stream (requires auth) */
  async start(streamId: string): Promise<Stream> {
    return apiClient.post(`/streams/id/${streamId}/start`, {}, true);
  },

  /** End stream (requires auth) — NOTE: no /id/ prefix in end path! */
  async end(streamId: string): Promise<Stream> {
    return apiClient.post(`/streams/${streamId}/end`, {}, true);
  },

  // ==================== Categories ====================

  /** Get all categories */
  async getCategories(): Promise<Category[]> {
    return apiClient.get('/streams/categories');
  },

  /** Get popular categories */
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    return apiClient.get(`/streams/categories/popular?limit=${limit}`);
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
    return apiClient.get(`/streams/categories/by-slug/${slug}/streams`);
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
```

### Create `services/users.ts`
```typescript
import apiClient from '@/lib/api-client';
import type { User, Stream, VODRecording, WeeklySchedule, UpcomingStream, Follow } from '@/types';

export const usersService = {
  // ==================== User Profile ====================

  /** Get user profile by username */
  async getProfile(username: string): Promise<User> {
    return apiClient.get(`/streams/users/${username}/profile`);
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
    return apiClient.get(`/streams/users/${username}/streams`);
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
};
```

### Create `services/vod.ts`
```typescript
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
};
```

### Create `services/chat.ts`
```typescript
import apiClient from '@/lib/api-client';
import type { ChatMessage, ChatMessageCreate } from '@/types';

export const chatService = {
  /** Get chat messages for stream */
  async getMessages(streamId: string, limit: number = 50): Promise<ChatMessage[]> {
    return apiClient.get(`/streams/${streamId}/chat?limit=${limit}`);
  },

  /** Get chat history */
  async getHistory(streamId: string, before?: string, limit: number = 50): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);
    return apiClient.get(`/streams/${streamId}/chat/history?${params.toString()}`);
  },

  /** Send chat message (requires auth) */
  async sendMessage(streamId: string, data: ChatMessageCreate): Promise<ChatMessage> {
    return apiClient.post(`/streams/${streamId}/chat`, data, true);
  },

  /** Delete message (requires auth - mod/owner only) */
  async deleteMessage(streamId: string, messageId: string): Promise<void> {
    return apiClient.delete(`/streams/${streamId}/chat/${messageId}`, true);
  },
};
```

### Create `services/dashboard.ts`
```typescript
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

  /** Get dashboard overview (requires auth) */
  async getOverview(): Promise<DashboardOverview> {
    return apiClient.get('/dashboard/overview', true);
  },

  /** Get quick stats (requires auth) */
  async getQuickStats(): Promise<DashboardQuickStats> {
    return apiClient.get('/dashboard/quick-stats', true);
  },

  /** Get recent activity (requires auth) */
  async getRecentActivity(): Promise<{
    recentStreams: any[];
    recentFollowers: any[];
    recentEvents: any[];
  }> {
    return apiClient.get('/dashboard/recent-activity', true);
  },

  // ==================== Notifications ====================

  /** Get notifications (requires auth) */
  async getNotifications(page: number = 1): Promise<{
    notifications: FollowNotification[];
    total: number;
    unreadCount: number;
  }> {
    return apiClient.get(`/dashboard/notifications?page=${page}`, true);
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
```

---

## 7. WebSocket Integration (Real-time Chat)

### Create `lib/websocket.ts`
```typescript
import { getAuthToken } from './auth';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.ainative.studio/v1';

export type WebSocketMessageType =
  | 'chat_message'
  | 'viewer_join'
  | 'viewer_leave'
  | 'viewer_count'
  | 'stream_status'
  | 'system_message'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
}

export interface ChatWebSocketMessage {
  id: string;
  streamId: string;
  userId: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  content: string;
  messageType: string;
  badges: { type: string; label: string }[];
  createdAt: string;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = () => void;

class StreamWebSocket {
  private ws: WebSocket | null = null;
  private streamId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(streamId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.streamId = streamId;
    const token = getAuthToken();
    const wsUrl = token
      ? `${WS_BASE_URL}/streams/${streamId}/chat/ws?token=${token}`
      : `${WS_BASE_URL}/streams/${streamId}/chat/ws`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`[WebSocket] Connected to stream ${streamId}`);
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach((handler) => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.errorHandlers.forEach((handler) => handler(error));
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed');
      this.disconnectHandlers.forEach((handler) => handler());
      this.attemptReconnect();
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      return;
    }

    if (!this.streamId) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.streamId) {
        this.connect(this.streamId);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.streamId = null;
    this.reconnectAttempts = 0;
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send message: not connected');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'chat_message',
      content,
    }));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.push(handler);
    return () => {
      this.connectHandlers = this.connectHandlers.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter((h) => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const streamWebSocket = new StreamWebSocket();
export default streamWebSocket;
```

### Create Chat Hook `hooks/use-stream-chat.ts`
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import streamWebSocket, { WebSocketMessage, ChatWebSocketMessage } from '@/lib/websocket';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/types';

interface UseStreamChatOptions {
  streamId: string;
  initialMessages?: ChatMessage[];
}

interface UseStreamChatReturn {
  messages: ChatMessage[];
  viewerCount: number;
  isConnected: boolean;
  sendMessage: (content: string) => void;
  loadHistory: () => Promise<void>;
  isLoadingHistory: boolean;
  error: string | null;
}

export function useStreamChat({ streamId, initialMessages = [] }: UseStreamChatOptions): UseStreamChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    streamWebSocket.connect(streamId);

    const unsubMessage = streamWebSocket.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'chat_message':
          const chatMsg = message.data as ChatWebSocketMessage;
          setMessages((prev) => [...prev, {
            id: chatMsg.id,
            streamId: chatMsg.streamId,
            userId: chatMsg.userId,
            username: chatMsg.username,
            displayName: chatMsg.displayName,
            avatar: chatMsg.avatar,
            content: chatMsg.content,
            messageType: chatMsg.messageType as any,
            badges: chatMsg.badges as any,
            isDeleted: false,
            createdAt: chatMsg.createdAt,
          }]);
          break;

        case 'viewer_count':
          setViewerCount(message.data.count);
          break;

        case 'viewer_join':
          setViewerCount((prev) => prev + 1);
          break;

        case 'viewer_leave':
          setViewerCount((prev) => Math.max(0, prev - 1));
          break;

        case 'system_message':
          setMessages((prev) => [...prev, {
            id: `system-${Date.now()}`,
            streamId,
            userId: null,
            username: 'System',
            displayName: 'System',
            avatar: null,
            content: message.data.content,
            messageType: 'system',
            badges: [],
            isDeleted: false,
            createdAt: message.timestamp,
          }]);
          break;

        case 'error':
          setError(message.data.message);
          break;
      }
    });

    const unsubConnect = streamWebSocket.onConnect(() => {
      setIsConnected(true);
      setError(null);
    });

    const unsubDisconnect = streamWebSocket.onDisconnect(() => {
      setIsConnected(false);
    });

    const unsubError = streamWebSocket.onError(() => {
      setError('Connection error');
    });

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
      unsubError();
      streamWebSocket.disconnect();
    };
  }, [streamId]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    streamWebSocket.sendMessage(content);
  }, []);

  // Load chat history
  const loadHistory = useCallback(async () => {
    if (isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const oldestMessage = messages[0];
      const history = await chatService.getHistory(
        streamId,
        oldestMessage?.createdAt,
        50
      );
      setMessages((prev) => [...history, ...prev]);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [streamId, messages, isLoadingHistory]);

  return {
    messages,
    viewerCount,
    isConnected,
    sendMessage,
    loadHistory,
    isLoadingHistory,
    error,
  };
}
```

---

## 8. State Management

### Create Streams Context `contexts/streams-context.tsx`
```typescript
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { streamsService } from '@/services/streams';
import type { Stream, Category } from '@/types';

interface StreamsContextType {
  trendingStreams: Stream[];
  risingStreams: Stream[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshTrending: () => Promise<void>;
  refreshRising: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const StreamsContext = createContext<StreamsContextType | undefined>(undefined);

export function StreamsProvider({ children }: { children: React.ReactNode }) {
  const [trendingStreams, setTrendingStreams] = useState<Stream[]>([]);
  const [risingStreams, setRisingStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTrending = useCallback(async () => {
    try {
      const { streams } = await streamsService.getTrending(20);
      setTrendingStreams(streams);
    } catch (err) {
      console.error('Failed to fetch trending streams:', err);
      setError('Failed to load trending streams');
    }
  }, []);

  const refreshRising = useCallback(async () => {
    try {
      const { streams } = await streamsService.getRising(20);
      setRisingStreams(streams);
    } catch (err) {
      console.error('Failed to fetch rising streams:', err);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const cats = await streamsService.getPopularCategories(20);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshTrending(),
        refreshRising(),
        refreshCategories(),
      ]);
      setIsLoading(false);
    };

    loadInitialData();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      refreshTrending();
      refreshRising();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshTrending, refreshRising, refreshCategories]);

  return (
    <StreamsContext.Provider
      value={{
        trendingStreams,
        risingStreams,
        categories,
        isLoading,
        error,
        refreshTrending,
        refreshRising,
        refreshCategories,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export function useStreams() {
  const context = useContext(StreamsContext);
  if (context === undefined) {
    throw new Error('useStreams must be used within a StreamsProvider');
  }
  return context;
}
```

---

## 9. Component Integration Examples

### Update Homepage `app/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamCard } from '@/components/stream-card';
import { CategoryCard } from '@/components/category-card';
import { streamsService } from '@/services/streams';
import type { Stream, Category } from '@/types';

export default function HomePage() {
  const [trendingStreams, setTrendingStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trending, cats] = await Promise.all([
          streamsService.getTrending(12),
          streamsService.getPopularCategories(8),
        ]);
        setTrendingStreams(trending.streams);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Replace with skeleton
  }

  return (
    <div className="min-h-screen bg-dark-1">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Trending Streams */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                id={stream.id}
                username={stream.user.username}
                displayName={stream.user.displayName || stream.user.username}
                title={stream.title}
                category={stream.category?.name || 'Uncategorized'}
                categorySlug={stream.category?.slug || 'uncategorized'}
                live={stream.status === 'live'}
                viewers={stream.viewerCount}
                thumbnail={stream.thumbnailUrl || '/placeholder.jpg'}
                avatar={stream.user.avatar || '/default-avatar.png'}
                tags={stream.tags.map(t => t.name)}
              />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                description={category.description || ''}
                icon={category.iconUrl || 'default'}
                viewerCount={category.viewerCount}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

### Update Stream Page `app/stream/[username]/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { StreamPlayer } from '@/components/stream-player';
import { ChatPanel } from '@/components/chat-panel';
import { usersService } from '@/services/users';
import { useStreamChat } from '@/hooks/use-stream-chat';
import { useAuth } from '@/contexts/auth-context';
import type { Stream, User } from '@/types';

export default function StreamPage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated } = useAuth();

  const [stream, setStream] = useState<Stream | null>(null);
  const [streamer, setStreamer] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat only when stream is loaded
  const chat = useStreamChat({
    streamId: stream?.id || '',
    initialMessages: [],
  });

  useEffect(() => {
    async function loadStreamData() {
      try {
        // Check if user is live
        const liveStatus = await usersService.isLive(username);
        if (!liveStatus.isLive || !liveStatus.stream) {
          setError('This user is not currently live');
          setIsLoading(false);
          return;
        }

        setStream(liveStatus.stream);

        // Get streamer profile
        const profile = await usersService.getProfile(username);
        setStreamer(profile);
      } catch (err) {
        setError('Failed to load stream');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStreamData();
  }, [username]);

  if (isLoading) {
    return <div className="min-h-screen bg-dark-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
    </div>;
  }

  if (error || !stream) {
    return <div className="min-h-screen bg-dark-1">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Stream Not Found</h1>
        <p className="text-gray-400">{error || 'This stream is not available'}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-dark-1">
      <Navbar />
      <main className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Stream Player */}
          <div className="flex-1">
            <StreamPlayer
              streamId={stream.id}
              title={stream.title}
              viewerCount={chat.viewerCount || stream.viewerCount}
              isLive={stream.status === 'live'}
            />

            {/* Stream Info */}
            <div className="mt-4 p-4 bg-dark-2 rounded-lg">
              <div className="flex items-start gap-4">
                <img
                  src={streamer?.avatar || '/default-avatar.png'}
                  alt={streamer?.displayName || username}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{stream.title}</h1>
                  <p className="text-brand-primary">{streamer?.displayName || username}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {stream.category?.name || 'Uncategorized'} • {chat.viewerCount} viewers
                  </p>
                </div>
                <FollowButton username={username} />
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:w-96">
            <ChatPanel
              messages={chat.messages}
              onSendMessage={chat.sendMessage}
              isConnected={chat.isConnected}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Follow button component
function FollowButton({ username }: { username: string }) {
  const { isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      usersService.isFollowing(username).then(({ isFollowing }) => {
        setIsFollowing(isFollowing);
      });
    }
  }, [username, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        await usersService.unfollow(username);
        setIsFollowing(false);
      } else {
        await usersService.follow(username);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-dark-3 text-white hover:bg-dark-2'
          : 'bg-brand-primary text-white hover:bg-brand-primary/90'
      }`}
    >
      {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
```

### Update ChatPanel Component `components/chat-panel.tsx`
```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { ChatMessage } from './chat-message';
import type { ChatMessage as ChatMessageType, User } from '@/types';

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isConnected,
  isAuthenticated,
  currentUser,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isAuthenticated) return;

    onSendMessage(inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="h-[600px] bg-dark-2 rounded-lg flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-dark-3 flex items-center justify-between">
        <span className="font-medium text-white">Live Chat</span>
        <span className={`flex items-center gap-1 text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            username={message.username}
            displayName={message.displayName}
            avatar={message.avatar}
            message={message.content}
            timestamp={message.createdAt}
            badges={message.badges}
            isSystem={message.messageType === 'system'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-dark-3">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-dark-3 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              maxLength={500}
            />
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Smile size={20} />
            </button>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 bg-brand-primary rounded-lg text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <a href="/login" className="text-brand-primary hover:underline">
              Log in to chat
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
```

---

## 10. Error Handling

### Create Error Boundary `components/error-boundary.tsx`
```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-dark-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Create Toast Notifications for API Errors
```typescript
// Add to lib/api-client.ts error handling

import { toast } from 'sonner';

// In handleResponse method, after catching errors:
toast.error(error.detail || 'An error occurred');
```

---

## 11. Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Create `.env.local` with API URLs
- [ ] Create `lib/api-client.ts`
- [ ] Create `lib/auth.ts`
- [ ] Create `contexts/auth-context.tsx`
- [ ] Update `app/layout.tsx` with AuthProvider
- [ ] Test authentication flow

### Phase 2: Core Services (Day 2)
- [ ] Create `services/streams.ts`
- [ ] Create `services/users.ts`
- [ ] Create `services/chat.ts`
- [ ] Create `services/vod.ts`
- [ ] Create `services/dashboard.ts`
- [ ] Update `types/index.ts`

### Phase 3: WebSocket Integration (Day 3)
- [ ] Create `lib/websocket.ts`
- [ ] Create `hooks/use-stream-chat.ts`
- [ ] Update `components/chat-panel.tsx`
- [ ] Test real-time chat

### Phase 4: Page Integration (Days 4-5)
- [ ] Update Homepage (`app/page.tsx`)
- [ ] Update Stream Page (`app/stream/[username]/page.tsx`)
- [ ] Update Category Page (`app/category/[slug]/page.tsx`)
- [ ] Update User Profile Page (`app/user/[username]/page.tsx`)
- [ ] Update Search Page (`app/search/page.tsx`)
- [ ] Update Dashboard (`app/dashboard/page.tsx`)

### Phase 5: Authentication Pages (Day 6)
- [ ] Update Login Page (`app/login/page.tsx`)
- [ ] Update Register Page (`app/register/page.tsx`)
- [ ] Add protected route middleware
- [ ] Test OAuth flows (if implemented)

### Phase 6: Polish & Testing (Day 7)
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Add toast notifications
- [ ] Test all API endpoints
- [ ] Test WebSocket reconnection
- [ ] Test authentication flows
- [ ] Performance optimization

---

## Appendix: Full Endpoint List

### Public Endpoints (No Auth Required)
```
GET  /streams/                              # List live streams
GET  /streams/trending                      # Trending streams
GET  /streams/rising                        # Rising streams
GET  /streams/id/{stream_id}                # Stream details
GET  /streams/categories                    # All categories
GET  /streams/categories/popular            # Popular categories
GET  /streams/categories/tree               # Category tree
GET  /streams/categories/by-slug/{slug}     # Category by slug
GET  /streams/categories/by-slug/{slug}/streams # Streams in category
GET  /streams/streams/tags                  # All tags
GET  /streams/streams/tags/popular          # Popular tags
GET  /streams/streams/tags/suggestions      # Tag suggestions
GET  /streams/search                        # Search streams
GET  /streams/search/suggestions            # Search suggestions
GET  /streams/search/trending               # Trending searches
GET  /streams/search/popular                # Popular searches
GET  /streams/vods                          # List VODs
GET  /streams/users/{username}/profile      # User profile
GET  /streams/users/{username}/streams      # User's streams
GET  /streams/users/{username}/vods         # User's VODs
GET  /streams/users/{username}/schedule     # User's schedule
GET  /streams/users/{username}/upcoming     # User's upcoming
GET  /streams/users/{username}/live         # User's live status
GET  /streams/users/{username}/followers    # User's followers
GET  /streams/users/{username}/following    # User's following
GET  /streams/users/{username}/analytics    # User's public analytics
```

### Authenticated Endpoints (Bearer Token Required)
```
GET  /streams/recommended                   # Recommended for user
GET  /streams/me/profile                    # Current user profile
PUT  /streams/me/profile                    # Update profile
POST /streams/me/profile/avatar             # Upload avatar
POST /streams/me/profile/banner             # Upload banner
GET  /streams/me/schedule                   # My schedule
POST /streams/me/schedule                   # Create schedule
PUT  /streams/me/schedule/{id}              # Update schedule
DELETE /streams/me/schedule/{id}            # Delete schedule
POST /streams/users/{username}/follow       # Follow user
DELETE /streams/users/{username}/follow     # Unfollow user
GET  /streams/users/{username}/follow       # Check if following
GET  /streams/notifications/follows         # Follow notifications
GET  /streams/notifications/follows/unread-count # Unread count
POST /streams/notifications/follows/{id}/read # Mark read
POST /streams/{stream_id}/chat              # Send chat message
DELETE /streams/{stream_id}/chat/{msg_id}   # Delete message
GET  /streams/vods/{vod_id}                 # VOD details
POST /streams/vods/{vod_id}/chapters        # Create chapter
POST /streams/vods/{vod_id}/chapters/generate # Generate AI chapters
GET  /streams/analytics/channel             # Channel overview
GET  /streams/analytics/channel/growth      # Follower growth
GET  /streams/analytics/channel/viewer-growth # Viewer growth
GET  /streams/analytics/channel/audience    # Audience demographics
GET  /streams/analytics/channel/top-streams # Top streams
GET  /streams/analytics/channel/best-times  # Best streaming times
GET  /streams/analytics/channel/categories  # Category breakdown
GET  /streams/analytics/channel/revenue     # Revenue analytics
GET  /dashboard/streamer/overview            # Dashboard overview
GET  /dashboard/streamer/quick-stats        # Quick stats
GET  /dashboard/streamer/activity           # Recent activity
GET  /dashboard/notifications               # Dashboard notifications
```

### Authentication Endpoints
```
POST /auth/login                            # Login (JSON body: { email, password })
POST /auth/register                         # Register (JSON body: { email, username, password })
POST /auth/logout                           # Logout (Bearer token)
POST /auth/refresh                          # Refresh token (JSON body: { refresh_token })
GET  /auth/me                               # Get current user (Bearer token)
POST /auth/github/callback                  # GitHub OAuth (JSON body: { code, redirect_uri })
POST /auth/google/callback                  # Google OAuth (JSON body: { code, redirect_uri })
POST /auth/magic-link                       # Request magic link (JSON body: { email })
POST /auth/magic-link/verify                # Verify magic link (JSON body: { token })
POST /auth/mfa/setup                        # Setup MFA (Bearer token)
POST /auth/mfa/verify                       # Verify MFA (JSON body: { code }, Bearer token)
```

### Frontend API Routes (Next.js)
```
POST /api/ai/chat                           # LLM chat with viewer context
POST /api/ai/summary                        # Stream summary generation
POST /api/ai/thumbnail                      # Thumbnail generation
POST /api/ai/tts                            # Text-to-speech
POST /api/ai/captions                       # VOD caption generation
POST /api/ai/moderate                       # Chat moderation
POST /api/ai/social-post                    # Social media post generation
POST /api/memory                            # ZeroMemory proxy
POST /api/recommendations                   # GraphRAG related streams
POST /api/search/semantic                   # Semantic vector search
POST /api/whip                              # WHIP proxy for WebRTC
```

---

## Important Integration Notes

### snake_case to camelCase Transform
The backend API returns all fields in `snake_case` format. The frontend `apiClient` (in `lib/api-client.ts`) automatically transforms responses to `camelCase` for use in TypeScript/React code. For example:
- `access_token` -> `accessToken`
- `viewer_count` -> `viewerCount`
- `display_name` -> `displayName`

When sending data TO the API, the client transforms `camelCase` back to `snake_case`.

### OAuth Callback Token Handling
When handling OAuth callbacks (GitHub/Google), the response tokens arrive as `access_token` from the API but are transformed by the API client to `accessToken` in frontend code. Always use the camelCase version (`accessToken`) when reading from the response in TypeScript.

### Stream End Path
The stream end endpoint does NOT follow the same pattern as other stream endpoints:
- Start: `POST /streams/id/{id}/start` (has `/id/` prefix)
- End: `POST /streams/{stream_id}/end` (NO `/id/` prefix)

This is a known API inconsistency. The frontend `services/streams.ts` handles this correctly.

---

**Document Version:** 2.0.0
**Last Updated:** 2026-06-20
**Author:** AI Native Studio Engineering Team
