import React from 'react';
import { render, screen } from '@testing-library/react';
import RegisterPage from '../page';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock AuthContext
const mockRegister = jest.fn();
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
  }),
}));

describe('RegisterPage Password Field Autocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Autocomplete Attributes', () => {
    it('should have autocomplete="new-password" attribute on password field', () => {
      // Given the register page
      render(<RegisterPage />);

      // When finding the password input (not confirm password)
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Then it should have autocomplete="new-password"
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should have autocomplete="new-password" attribute on confirm password field', () => {
      // Given the register page
      render(<RegisterPage />);

      // When finding the confirm password input
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Then it should have autocomplete="new-password"
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should have autocomplete="username" attribute on username field', () => {
      // Given the register page
      render(<RegisterPage />);

      // When finding the username input
      const usernameInput = screen.getByLabelText(/username/i);

      // Then it should have autocomplete="username"
      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
    });

    it('should have autocomplete="email" attribute on email field', () => {
      // Given the register page
      render(<RegisterPage />);

      // When finding the email input
      const emailInput = screen.getByLabelText(/email/i);

      // Then it should have autocomplete="email"
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });
  });
});
