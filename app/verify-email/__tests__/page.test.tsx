import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import EmailVerificationPage from '../page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('EmailVerificationPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('when token is provided in URL', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => (key === 'token' ? 'valid-token-123' : null),
      });
    });

    it('should verify email with valid token', async () => {
      // Given a valid token in the URL
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email verified successfully' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should call the verification API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/verify-email'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: 'valid-token-123' }),
          })
        );
      });
    });

    it('should display success message on verification', async () => {
      // Given successful verification
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email verified successfully' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show success message
      await waitFor(() => {
        expect(screen.getByText(/email verified/i)).toBeInTheDocument();
      });
    });

    it('should show continue to login button on success', async () => {
      // Given successful verification
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email verified successfully' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show continue button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue to login/i })).toBeInTheDocument();
      });
    });

    it('should navigate to login when continue button clicked', async () => {
      // Given successful verification
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email verified successfully' }),
      });

      render(<EmailVerificationPage />);

      // When clicking continue button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue to login/i })).toBeInTheDocument();
      });

      const continueButton = screen.getByRole('button', { name: /continue to login/i });
      await user.click(continueButton);

      // Then it should navigate to login
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should handle expired token', async () => {
      // Given an expired token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Verification token has expired' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show expired token message
      await waitFor(() => {
        expect(screen.getByText('Link Expired')).toBeInTheDocument();
      });
    });

    it('should show resend button when token expired', async () => {
      // Given an expired token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Verification token has expired' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show resend option
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
      });
    });

    it('should handle invalid token', async () => {
      // Given an invalid token
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid verification token' }),
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      // Given a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during verification', () => {
      // Given verification in progress
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show loading state
      expect(screen.getByText(/verifying/i)).toBeInTheDocument();
    });
  });

  describe('when no token is provided', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      });
    });

    it('should show email input form', () => {
      // Given no token
      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show email input
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should show resend verification button', () => {
      // Given no token
      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show resend button
      expect(screen.getByRole('button', { name: /send verification email/i })).toBeInTheDocument();
    });

    it('should allow resending verification email', async () => {
      // Given no token and user enters email
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Verification email sent' }),
      });

      render(<EmailVerificationPage />);

      // When entering email and clicking send
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');
      await user.click(screen.getByRole('button', { name: /send verification email/i }));

      // Then it should call resend API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/resend-verification'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'user@example.com' }),
          })
        );
      });
    });

    it('should show success message after resending', async () => {
      // Given successful resend
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Verification email sent' }),
      });

      render(<EmailVerificationPage />);

      // When resending verification email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');
      await user.click(screen.getByRole('button', { name: /send verification email/i }));

      // Then it should show success message
      await waitFor(() => {
        expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      // Given invalid email
      const user = userEvent.setup();
      render(<EmailVerificationPage />);

      // When entering invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /send verification email/i }));

      // Then it should not submit (HTML5 validation)
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle resend errors', async () => {
      // Given resend fails
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Email not found' }),
      });

      render(<EmailVerificationPage />);

      // When resending verification email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'notfound@example.com');
      await user.click(screen.getByRole('button', { name: /send verification email/i }));

      // Then it should show error message
      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });

    it('should disable button while sending', async () => {
      // Given form submission in progress
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<EmailVerificationPage />);

      // When submitting form
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'user@example.com');
      const button = screen.getByRole('button', { name: /send verification email/i });
      await user.click(button);

      // Then button should be disabled
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      });
    });

    it('should have proper form structure', () => {
      // Given the page is rendered
      const { container } = render(<EmailVerificationPage />);

      // Then form should exist with proper structure
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible labels', () => {
      // Given the page is rendered
      render(<EmailVerificationPage />);

      // Then labels should be associated with inputs
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should have required attribute on email input', () => {
      // Given the page is rendered
      render(<EmailVerificationPage />);

      // Then email input should be required
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });
  });

  describe('UI/UX', () => {
    it('should display logo and branding', () => {
      // Given any state
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      });

      // When rendering the page
      render(<EmailVerificationPage />);

      // Then it should show AINative branding
      expect(screen.getByAltText(/ainative/i)).toBeInTheDocument();
    });

    it('should have terminal header styling', () => {
      // Given any state
      (useSearchParams as jest.Mock).mockReturnValue({
        get: () => null,
      });

      // When rendering the page
      const { container } = render(<EmailVerificationPage />);

      // Then it should show terminal-style header
      const terminalHeader = container.querySelector('.font-mono.text-brand-primary');
      expect(terminalHeader).toBeInTheDocument();
    });
  });
});
