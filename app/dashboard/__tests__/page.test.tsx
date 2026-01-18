import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '../page';
import { useAuth } from '@/contexts/auth-context';
import { dashboardService } from '@/services/dashboard';
import type { DashboardOverview, DashboardQuickStats } from '@/types';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/dashboard', () => ({
  dashboardService: {
    getOverview: jest.fn(),
    getQuickStats: jest.fn(),
  },
}));

jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

describe('Dashboard Page - Navigation Links', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockAuthenticatedUser = {
    id: 'user-1',
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    avatar: null,
  };

  const mockOverviewWithActiveStream: DashboardOverview = {
    currentStream: {
      id: 'stream-1',
      userId: 'user-1',
      title: 'Test Stream',
      description: 'Test stream description',
      category: {
        id: 'cat-1',
        name: 'Programming',
        slug: 'programming',
        description: 'Programming content',
        icon: '💻',
        followerCount: 100,
      },
      viewerCount: 42,
      peakViewers: 50,
      isLive: true,
      startedAt: '2024-01-01T12:00:00Z',
      endedAt: null,
      thumbnailUrl: null,
      cloudflareVideoId: null,
      streamKey: null,
    },
    recentStreams: [],
    followerCount: 100,
    totalViews: 1000,
    upcomingSchedule: [],
    notifications: [],
  };

  const mockOverviewNoStream: DashboardOverview = {
    currentStream: null,
    recentStreams: [],
    followerCount: 100,
    totalViews: 1000,
    upcomingSchedule: [],
    notifications: [],
  };

  const mockQuickStats: DashboardQuickStats = {
    todayViewers: 10,
    weeklyViewers: 100,
    monthlyViewers: 500,
    avgStreamDuration: 3600,
    newFollowersToday: 2,
    newFollowersWeek: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('End Stream Button Navigation', () => {
    it('should link to /dashboard/go-live when clicking End Stream button', async () => {
      // Given an authenticated user with an active stream
      (useAuth as jest.Mock).mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      (dashboardService.getOverview as jest.Mock).mockResolvedValue(mockOverviewWithActiveStream);
      (dashboardService.getQuickStats as jest.Mock).mockResolvedValue(mockQuickStats);

      // When rendering the dashboard page
      render(<DashboardPage />);

      // Then wait for the End Stream button to appear
      await waitFor(() => {
        expect(screen.getByText('End Stream')).toBeInTheDocument();
      });

      // And it should have the correct href attribute
      const endStreamLink = screen.getByText('End Stream').closest('a');
      expect(endStreamLink).toHaveAttribute('href', '/dashboard/go-live');
    });

    it('should NOT link to /dashboard/stream (non-existent route)', async () => {
      // Given an authenticated user with an active stream
      (useAuth as jest.Mock).mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      (dashboardService.getOverview as jest.Mock).mockResolvedValue(mockOverviewWithActiveStream);
      (dashboardService.getQuickStats as jest.Mock).mockResolvedValue(mockQuickStats);

      // When rendering the dashboard page
      render(<DashboardPage />);

      // Then wait for the End Stream button to appear
      await waitFor(() => {
        expect(screen.getByText('End Stream')).toBeInTheDocument();
      });

      // And it should NOT link to the broken /dashboard/stream route
      const endStreamLink = screen.getByText('End Stream').closest('a');
      expect(endStreamLink).not.toHaveAttribute('href', '/dashboard/stream');
    });
  });

  describe('Go Live Button Navigation', () => {
    it('should link to /dashboard/go-live when clicking Go Live button', async () => {
      // Given an authenticated user with no active stream
      (useAuth as jest.Mock).mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      (dashboardService.getOverview as jest.Mock).mockResolvedValue(mockOverviewNoStream);
      (dashboardService.getQuickStats as jest.Mock).mockResolvedValue(mockQuickStats);

      // When rendering the dashboard page
      render(<DashboardPage />);

      // Then wait for the Go Live button to appear
      await waitFor(() => {
        expect(screen.getByText('Go Live')).toBeInTheDocument();
      });

      // And it should have the correct href attribute
      const goLiveLink = screen.getByText('Go Live').closest('a');
      expect(goLiveLink).toHaveAttribute('href', '/dashboard/go-live');
    });
  });

  describe('Manage Schedule Button Navigation', () => {
    it('should link to /dashboard/schedule when clicking Manage Schedule button', async () => {
      // Given an authenticated user
      (useAuth as jest.Mock).mockReturnValue({
        user: mockAuthenticatedUser,
        isAuthenticated: true,
        isLoading: false,
      });
      (dashboardService.getOverview as jest.Mock).mockResolvedValue(mockOverviewNoStream);
      (dashboardService.getQuickStats as jest.Mock).mockResolvedValue(mockQuickStats);

      // When rendering the dashboard page
      render(<DashboardPage />);

      // Then wait for the Manage Schedule button to appear
      await waitFor(() => {
        expect(screen.getByText('Manage Schedule')).toBeInTheDocument();
      });

      // And it should have the correct href attribute
      const scheduleLink = screen.getByText('Manage Schedule').closest('a');
      expect(scheduleLink).toHaveAttribute('href', '/dashboard/schedule');
    });
  });

  describe('Authentication Flow', () => {
    it('should redirect to login when user is not authenticated', () => {
      // Given an unauthenticated user
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // When rendering the dashboard page
      render(<DashboardPage />);

      // Then it should redirect to login
      expect(mockRouter.push).toHaveBeenCalledWith('/login?redirect=/dashboard');
    });

    it('should not render content when loading authentication', () => {
      // Given authentication is loading
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      });

      // When rendering the dashboard page
      const { container } = render(<DashboardPage />);

      // Then it should not render any content
      expect(container.firstChild).toBeNull();
    });
  });
});
