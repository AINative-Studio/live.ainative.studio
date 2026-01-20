'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Authentication hook
 *
 * This is a stub implementation that checks for ainative_access_token cookie.
 * Will be replaced with full auth context implementation (issue #27).
 *
 * @returns Authentication state including user, isAuthenticated, and isLoading
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for auth token in cookies
    const checkAuth = () => {
      try {
        // Get all cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const token = cookies['ainative_access_token'];

        if (token) {
          // TODO: Validate token with backend and fetch user data
          // For now, just set a mock user if token exists
          setUser({
            id: '1',
            username: 'demo-user',
            email: 'demo@ainative.studio',
            displayName: 'Demo User',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
