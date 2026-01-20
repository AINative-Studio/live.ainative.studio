import {
  setAuthToken,
  clearAuth,
  getAuthToken,
} from '../auth';

describe('auth cookie management', () => {
  beforeEach(() => {
    // Clear localStorage and cookies before each test
    localStorage.clear();
    document.cookie = 'ainative_access_token=; path=/; max-age=0';
    document.cookie = 'auth_token=; path=/; max-age=0';
  });

  describe('setAuthToken', () => {
    it('should set cookie named "ainative_access_token" on login', () => {
      const token = 'test-access-token-123';
      setAuthToken(token);

      // Parse cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      // Should have ainative_access_token cookie
      expect(cookies['ainative_access_token']).toBe(token);
      // Should NOT have old auth_token cookie
      expect(cookies['auth_token']).toBeUndefined();
    });

    it('should set localStorage with correct key', () => {
      const token = 'test-access-token-456';
      setAuthToken(token);

      expect(localStorage.getItem('ainative_access_token')).toBe(token);
    });

    it('should set cookie with proper attributes', () => {
      const token = 'test-token';
      setAuthToken(token);

      // Cookie should be set (path and max-age are set but not readable via document.cookie)
      expect(document.cookie).toContain('ainative_access_token=test-token');
    });
  });

  describe('clearAuth', () => {
    it('should clear "ainative_access_token" cookie on logout', () => {
      // Set up initial state
      setAuthToken('some-token');

      // Verify token exists
      expect(getAuthToken()).toBe('some-token');

      // Clear auth
      clearAuth();

      // Parse cookies after clearing
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Cookie should be cleared
      expect(cookies['ainative_access_token']).toBeUndefined();
      // localStorage should be cleared
      expect(localStorage.getItem('ainative_access_token')).toBeNull();
    });

    it('should clear all auth-related data', () => {
      // Set up initial state
      localStorage.setItem('ainative_access_token', 'token');
      localStorage.setItem('ainative_refresh_token', 'refresh');
      localStorage.setItem('ainative_user', JSON.stringify({ id: '1' }));

      clearAuth();

      expect(localStorage.getItem('ainative_access_token')).toBeNull();
      expect(localStorage.getItem('ainative_refresh_token')).toBeNull();
      expect(localStorage.getItem('ainative_user')).toBeNull();
    });
  });

  describe('getAuthToken', () => {
    it('should read "ainative_access_token" from localStorage for auth state', () => {
      const token = 'test-token-789';
      localStorage.setItem('ainative_access_token', token);

      const result = getAuthToken();

      expect(result).toBe(token);
    });

    it('should return null when no token exists', () => {
      const result = getAuthToken();

      expect(result).toBeNull();
    });
  });
});

// Mock fetch for user endpoint tests
global.fetch = jest.fn();

describe('auth user profile fetching', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.cookie = 'ainative_access_token=; path=/; max-age=0';
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getCurrentUser endpoint', () => {
    it('should call GET /v1/auth/me to fetch current user', async () => {
      // Arrange
      const mockToken = 'test-token-123';
      const mockUser = {
        id: 'user-123',
        email: 'test@ainative.studio',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        role: 'USER' as const,
      };

      const { login } = await import('../auth');

      // Mock login endpoint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: mockToken,
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      // Mock user profile endpoint (/v1/auth/me)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      // Act
      await login({ username: 'test', password: 'password' });

      // Assert - check that the user profile fetch used correct endpoint
      const userFetchCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[0].includes('/auth/me')
      );

      expect(userFetchCall).toBeTruthy();
      expect(userFetchCall[0]).toBe(`${API_BASE_URL}/auth/me`);
      expect(userFetchCall[1]).toMatchObject({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockToken}`,
        }),
      });
    });

    it('should return user profile data with camelCase keys', async () => {
      // Arrange
      const mockToken = 'test-token-456';
      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        username: 'username',
        displayName: 'Display Name',
        avatar: 'https://example.com/avatar.jpg',
        role: 'ADMIN' as const,
      };

      const { login } = await import('../auth');

      // Mock login endpoint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: mockToken,
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      // Mock user profile endpoint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      // Act
      await login({ username: 'test', password: 'password' });

      // Assert
      const storedUser = localStorage.getItem('ainative_user');
      expect(storedUser).toBeTruthy();
      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser).toEqual(mockUser);
      expect(parsedUser.id).toBe('user-456');
      expect(parsedUser.username).toBe('username');
      expect(parsedUser.displayName).toBe('Display Name');
    });

    it('should handle unauthorized error (401)', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockToken = 'invalid-token';

      const { login } = await import('../auth');

      // Mock login endpoint
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: mockToken,
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      // Mock user profile endpoint with 401 error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // Act
      await login({ username: 'test', password: 'password' });

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch user, status:',
        401
      );
      expect(localStorage.getItem('ainative_user')).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
