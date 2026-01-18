import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { ProtectedRoute } from '../protected-route';
import { useAuth } from '@/contexts/auth-context';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          avatar: null,
          role: 'USER',
        },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('should render children without redirecting', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not show loading state', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('should redirect to login with current path as redirect parameter', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
      });
    });

    it('should not render children', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should handle special characters in pathname', () => {
      mockUsePathname.mockReturnValue('/dashboard/stream?test=value&other=param');

      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/login?redirect=')
        );
      });
    });
  });

  describe('when auth is loading', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });
    });

    it('should show loading state', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render children', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not redirect while loading', () => {
      render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('auth state transitions', () => {
    it('should redirect when auth changes from loading to unauthenticated', async () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      const { rerender } = render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Update to unauthenticated
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      rerender(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
      });
    });

    it('should render content when auth changes from loading to authenticated', () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      const { rerender } = render(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Update to authenticated
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          displayName: 'Test User',
          avatar: null,
          role: 'USER',
        },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      rerender(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('different dashboard routes', () => {
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/go-live',
      '/dashboard/analytics',
      '/dashboard/schedule',
      '/dashboard/notifications',
    ];

    dashboardRoutes.forEach((route) => {
      it(`should protect ${route} when unauthenticated`, () => {
        mockUsePathname.mockReturnValue(route);
        mockUseAuth.mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          login: jest.fn(),
          register: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        });

        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        );

        waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(
            `/login?redirect=${encodeURIComponent(route)}`
          );
        });
      });

      it(`should render ${route} when authenticated`, () => {
        mockUsePathname.mockReturnValue(route);
        mockUseAuth.mockReturnValue({
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
            role: 'USER',
          },
          isAuthenticated: true,
          isLoading: false,
          login: jest.fn(),
          register: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        });

        render(
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
});
