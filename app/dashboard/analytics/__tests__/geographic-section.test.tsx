import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AnalyticsPage from '../page';
import { useAuth } from '@/contexts/auth-context';
import { dashboardService } from '@/services/dashboard';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/dashboard', () => ({
  dashboardService: {
    getChannelOverview: jest.fn(),
    getFollowerGrowth: jest.fn(),
    getViewerGrowth: jest.fn(),
    getTopStreams: jest.fn(),
    getCategoryBreakdown: jest.fn(),
    getAudienceDemographics: jest.fn(),
  },
}));

describe('GeographicAnalytics', () => {
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

  const mockGeographicData = {
    geographicBreakdown: [
      { countryCode: 'US', viewerCount: 1234, percentage: 45.5 },
      { countryCode: 'GB', viewerCount: 567, percentage: 20.9 },
      { countryCode: 'CA', viewerCount: 432, percentage: 15.9 },
      { countryCode: 'DE', viewerCount: 321, percentage: 11.8 },
      { countryCode: 'FR', viewerCount: 160, percentage: 5.9 },
    ],
    viewerTypeBreakdown: { authenticated: 2100, anonymous: 614 },
    avgWatchTimeMinutes: 23.5,
  };

  const mockEmptyGeographicData = {
    geographicBreakdown: [],
    viewerTypeBreakdown: { authenticated: 0, anonymous: 0 },
    avgWatchTimeMinutes: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock other required endpoints to prevent errors
    (dashboardService.getChannelOverview as jest.Mock).mockResolvedValue({
      completedStreams: 42,
      totalHoursStreamed: 126.5,
      avgViewersPerStream: 87,
    });
    (dashboardService.getFollowerGrowth as jest.Mock).mockResolvedValue({
      timeline: [],
      periodDays: 30,
      totalNewFollowers: 127,
      growthRatePercent: 12.5,
    });
    (dashboardService.getViewerGrowth as jest.Mock).mockResolvedValue({
      timeline: [],
      periodDays: 30,
      totalViews: 12543,
      totalUniqueViewers: 3421,
    });
    (dashboardService.getTopStreams as jest.Mock).mockResolvedValue([]);
    (dashboardService.getCategoryBreakdown as jest.Mock).mockResolvedValue([]);
  });

  describe('when geographic data is available', () => {
    it('should display geographic breakdown section', async () => {
      // Given mock geographic data from API
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display the geographic section
      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });
    });

    it('should show top countries with viewer counts', async () => {
      // Given mock geographic data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display the top countries
      await waitFor(() => {
        expect(screen.getByText(/United States/i)).toBeInTheDocument();
        expect(screen.getByText(/1,234/)).toBeInTheDocument();
      });
    });

    it('should show percentages for each country', async () => {
      // Given mock geographic data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display percentages
      await waitFor(() => {
        expect(screen.getByText(/45.5%/)).toBeInTheDocument();
        expect(screen.getByText(/20.9%/)).toBeInTheDocument();
      });
    });

    it('should display at least top 5 countries', async () => {
      // Given mock geographic data with 5 countries
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display all 5 countries
      await waitFor(() => {
        expect(screen.getByText(/United States/i)).toBeInTheDocument();
        expect(screen.getByText(/United Kingdom/i)).toBeInTheDocument();
        expect(screen.getByText(/Canada/i)).toBeInTheDocument();
        expect(screen.getByText(/Germany/i)).toBeInTheDocument();
        expect(screen.getByText(/France/i)).toBeInTheDocument();
      });
    });

    it('should fetch data from /streams/analytics/channel/audience endpoint', async () => {
      // Given the analytics page
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the page
      render(<AnalyticsPage />);

      // Then it should call the audience demographics API
      await waitFor(() => {
        expect(dashboardService.getAudienceDemographics).toHaveBeenCalled();
      });
    });
  });

  describe('when geographic data is empty', () => {
    it('should handle empty data gracefully', async () => {
      // Given empty geographic data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockEmptyGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display a "no data" message
      await waitFor(() => {
        expect(screen.getByText(/No geographic data available/i)).toBeInTheDocument();
      });
    });

    it('should not crash when geographicBreakdown is empty array', async () => {
      // Given empty geographic data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockEmptyGeographicData);

      // When rendering the analytics page
      const { container } = render(<AnalyticsPage />);

      // Then it should render without errors
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('when API call fails', () => {
    it('should handle API errors gracefully', async () => {
      // Given API error
      (dashboardService.getAudienceDemographics as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch geographic data')
      );

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should still render the page without crashing
      await waitFor(() => {
        expect(screen.getByText('Analytics')).toBeInTheDocument();
      });
    });

    it('should use fallback data when API call fails', async () => {
      // Given API error
      (dashboardService.getAudienceDemographics as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display the page with fallback/empty state
      await waitFor(() => {
        const section = screen.queryByText('Geographic Analytics');
        // Section should either not exist or show empty state
        if (section) {
          expect(screen.getByText(/No geographic data available/i)).toBeInTheDocument();
        }
      });
    });
  });

  describe('loading state', () => {
    it('should display loading skeleton while fetching data', async () => {
      // Given a slow API response
      (dashboardService.getAudienceDemographics as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockGeographicData), 100))
      );

      // When rendering the analytics page
      const { container } = render(<AnalyticsPage />);

      // Then it should show loading state initially
      const loadingElements = container.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);

      // And data should appear after loading
      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('data formatting', () => {
    it('should format viewer counts with commas', async () => {
      // Given geographic data with large numbers
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then numbers should be formatted with commas
      await waitFor(() => {
        expect(screen.getByText(/1,234/)).toBeInTheDocument(); // US viewers
      });
    });

    it('should format percentages with one decimal place', async () => {
      // Given geographic data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then percentages should have one decimal
      await waitFor(() => {
        expect(screen.getByText(/45.5%/)).toBeInTheDocument();
        expect(screen.getByText(/20.9%/)).toBeInTheDocument();
      });
    });
  });

  describe('country code mapping', () => {
    it('should convert country codes to full names', async () => {
      // Given country codes in the data
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(mockGeographicData);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display full country names
      await waitFor(() => {
        expect(screen.getByText(/United States/i)).toBeInTheDocument();
        expect(screen.getByText(/United Kingdom/i)).toBeInTheDocument();
        expect(screen.getByText(/Canada/i)).toBeInTheDocument();
      });
    });

    it('should handle unknown country codes gracefully', async () => {
      // Given data with unknown country code
      const dataWithUnknownCountry = {
        ...mockGeographicData,
        geographicBreakdown: [
          { countryCode: 'XX', viewerCount: 100, percentage: 10.0 },
        ],
      };
      (dashboardService.getAudienceDemographics as jest.Mock).mockResolvedValue(dataWithUnknownCountry);

      // When rendering the analytics page
      render(<AnalyticsPage />);

      // Then it should display the country code with "Unknown" label
      await waitFor(() => {
        expect(screen.getByText(/XX \(Unknown\)/i)).toBeInTheDocument();
      });
    });
  });
});
