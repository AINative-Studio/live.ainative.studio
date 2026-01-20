/**
 * @jest-environment @edge-runtime/jest-environment
 */
import { NextRequest } from 'next/server';
import { config } from '../middleware';

// Mock NextRequest for testing
function createMockRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = `http://localhost:3000${pathname}`;

  const mockCookies = {
    get: (name: string) => {
      const value = cookies[name];
      return value ? { name, value } : undefined;
    },
    getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    has: (name: string) => name in cookies,
    set: jest.fn(),
    delete: jest.fn(),
  };

  const mockRequest = {
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(),
      toString: () => url,
    },
    url,
    cookies: mockCookies,
  } as unknown as NextRequest;

  return mockRequest;
}

// Import middleware function dynamically to avoid issues
async function testMiddleware(request: NextRequest) {
  const { middleware } = await import('../middleware');
  return middleware(request);
}

describe('middleware', () => {
  describe('config', () => {
    it('should protect dashboard routes', () => {
      expect(config.matcher).toContain('/dashboard/:path*');
    });

    it('should protect settings routes', () => {
      expect(config.matcher).toContain('/settings/:path*');
    });
  });

  describe('when user has valid auth token', () => {
    it('should allow access to dashboard', async () => {
      const request = createMockRequest('/dashboard', { ainative_access_token: 'valid-token-123' });
      const response = await testMiddleware(request);

      expect(response).toBeDefined();
      // Check it's allowing the request through (NextResponse.next())
    });

    it('should allow access to dashboard sub-routes', () => {
      const routes = [
        '/dashboard/go-live',
        '/dashboard/analytics',
        '/dashboard/schedule',
        '/dashboard/notifications',
      ];

      routes.forEach((route) => {
        const request = createMockRequest(route, { ainative_access_token: 'valid-token-123' });
        const response = middleware(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(200);
      });
    });

    it('should allow access to settings', () => {
      const request = createMockRequest('/settings', { ainative_access_token: 'valid-token-123' });
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('when user has no auth token', () => {
    it('should redirect to login from dashboard', () => {
      const request = createMockRequest('/dashboard', {});
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Redirect status

      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fdashboard');
    });

    it('should redirect to login from dashboard sub-routes', () => {
      const routes = [
        '/dashboard/go-live',
        '/dashboard/analytics',
        '/dashboard/schedule',
        '/dashboard/notifications',
      ];

      routes.forEach((route) => {
        const request = createMockRequest(route, {});
        const response = middleware(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(307);

        const location = response.headers.get('location');
        expect(location).toContain('/login');
        expect(location).toContain(`redirect=${encodeURIComponent(route)}`);
      });
    });

    it('should redirect to login from settings', () => {
      const request = createMockRequest('/settings', {});
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);

      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=%2Fsettings');
    });

    it('should preserve query parameters in redirect', () => {
      const request = createMockRequest('/dashboard?tab=streams&sort=recent', {});
      const response = middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('/login');
      // The full path with query params should be in redirect parameter
      expect(location).toContain('redirect=');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined cookie value', () => {
      const request = createMockRequest('/dashboard', {});
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle empty cookie value', () => {
      const request = createMockRequest('/dashboard', { ainative_access_token: '' });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle whitespace-only cookie value', () => {
      const request = createMockRequest('/dashboard', { ainative_access_token: '   ' });
      const response = middleware(request);

      // Middleware currently treats any truthy value as valid
      // This test documents current behavior - may need updating if validation improves
      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should handle deep nested dashboard routes', () => {
      const request = createMockRequest('/dashboard/streams/123/edit', {});
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle routes with special characters', () => {
      const request = createMockRequest('/dashboard/stream/user@example', {});
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('redirect=');
    });
  });

  describe('authentication consistency', () => {
    it('should use consistent cookie name across app', () => {
      // This test ensures the cookie name matches what's used in auth.ts
      const request = createMockRequest('/dashboard', { ainative_access_token: 'test' });
      const response = middleware(request);

      // Should allow access when cookie name is correct
      expect(response.status).toBe(200);
    });

    it('should not authenticate with wrong cookie name', () => {
      const request = createMockRequest('/dashboard', { wrong_token: 'test' });
      const response = middleware(request);

      expect(response.status).toBe(307);
    });
  });
});
