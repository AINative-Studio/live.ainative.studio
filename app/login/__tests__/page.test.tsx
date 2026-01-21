import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

// Mock Next.js navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}));

describe('LoginPage Password Field Autocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Autocomplete Attributes', () => {
    it('should have autocomplete="current-password" attribute on password field', () => {
      // Given the login page
      render(<LoginPage />);

      // When finding the password input
      const passwordInput = screen.getByLabelText(/password/i);

      // Then it should have autocomplete="current-password"
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should have autocomplete="email" attribute on email field', () => {
      // Given the login page
      render(<LoginPage />);

      // When finding the email input
      const emailInput = screen.getByLabelText(/email/i);

      // Then it should have autocomplete="email"
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });
  });
});
