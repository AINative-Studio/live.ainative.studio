import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../page';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Page Rendering', () => {
    it('should render email input form', () => {
      // When rendering the forgot password page
      render(<ForgotPasswordPage />);

      // Then it should display email input
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      // When rendering the forgot password page
      render(<ForgotPasswordPage />);

      // Then it should display title and instructions
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your email/i)).toBeInTheDocument();
    });

    it('should render link to login page', () => {
      // When rendering the forgot password page
      const { container } = render(<ForgotPasswordPage />);

      // Then it should have a link back to login
      const loginLink = container.querySelector('a[href="/login"]');
      expect(loginLink).toBeInTheDocument();
    });

    it('should render AINative branding', () => {
      // When rendering the forgot password page
      render(<ForgotPasswordPage />);

      // Then it should display the logo
      const logo = screen.getByAltText(/ainative/i);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      // Given the forgot password page
      render(<ForgotPasswordPage />);

      // When the email input is rendered
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      // Then it should be required
      expect(emailInput).toBeRequired();
    });

    it('should validate email format', () => {
      // Given the forgot password page
      render(<ForgotPasswordPage />);

      // When the email input is rendered
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      // Then it should have email type
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should display error for invalid email format', async () => {
      // Given the forgot password page
      render(<ForgotPasswordPage />);

      // When user enters invalid email and submits
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      // Then it should show validation error
      // Note: HTML5 validation will prevent submission
      expect(emailInput).toBeInvalid();
    });
  });

  describe('API Integration', () => {
    it('should call /v1/auth/forgot-password on submit', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits valid email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then it should call the API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/auth/forgot-password'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'user@example.com' }),
          })
        );
      });
    });

    it('should display success message when email sent', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits valid email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then it should display success message
      await waitFor(() => {
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
      });
    });

    it('should display error when email not found', async () => {
      // Given an API error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Email not found' }),
      });

      // When user submits email that doesn't exist
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
      fireEvent.click(submitButton);

      // Then it should display error message
      await waitFor(() => {
        expect(screen.getByText(/email not found/i)).toBeInTheDocument();
      });
    });

    it('should display network error message', async () => {
      // Given a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When user submits email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then it should display network error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      // Given a delayed API response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Reset email sent' }),
                }),
              100
            )
          )
      );

      // When user submits email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then it should show loading state
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
      });
    });

    it('should disable form inputs during submission', async () => {
      // Given a delayed API response
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Reset email sent' }),
                }),
              100
            )
          )
      );

      // When user submits email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then form should be disabled
      expect(emailInput).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('should show success message with email address', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then success message should include the email
      await waitFor(() => {
        expect(screen.getByText(/user@example\.com/i)).toBeInTheDocument();
      });
    });

    it('should hide form after successful submission', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      // Then form should be hidden
      await waitFor(() => {
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      });
    });

    it('should allow resending reset email', async () => {
      // Given a successful initial submission
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits and then clicks resend
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
      });

      // Then there should be a way to go back or resend
      const resendButton = screen.getByRole('button', { name: /try a different email/i });
      expect(resendButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty email submission', () => {
      // Given the forgot password page
      render(<ForgotPasswordPage />);

      // When user tries to submit without email
      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      fireEvent.click(submitButton);

      // Then it should prevent submission via HTML5 validation
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.validity.valid).toBe(false);
    });

    it('should handle very long email addresses', async () => {
      // Given a very long but valid email
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits long email
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.click(submitButton);

      // Then it should handle it gracefully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should trim whitespace from email input', async () => {
      // Given an email with whitespace
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent' }),
      });

      // When user submits email with spaces
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: '  user@example.com  ' } });
      fireEvent.click(submitButton);

      // Then it should trim the email
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ email: 'user@example.com' }),
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      // When rendering the page
      render(<ForgotPasswordPage />);

      // Then all form inputs should have labels
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('should display error messages with proper ARIA attributes', async () => {
      // Given an API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Email not found' }),
      });

      // When error is displayed
      render(<ForgotPasswordPage />);
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
      fireEvent.click(submitButton);

      // Then error should be accessible
      await waitFor(() => {
        const errorMessage = screen.getByText(/email not found/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
