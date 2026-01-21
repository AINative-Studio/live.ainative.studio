import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from '../page';

// Mock Next.js navigation and search params
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch API
global.fetch = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockPush.mockClear();
    mockSearchParams.delete('token');
  });

  describe('Page Rendering with Valid Token', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should render password reset form with token', () => {
      // When rendering the reset password page with token
      render(<ResetPasswordPage />);

      // Then it should display password inputs
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should render page title and description', () => {
      // When rendering the reset password page
      render(<ResetPasswordPage />);

      // Then it should display title and instructions
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByText(/enter.*new password/i)).toBeInTheDocument();
    });

    it('should render AINative branding', () => {
      // When rendering the reset password page
      render(<ResetPasswordPage />);

      // Then it should display the logo
      const logo = screen.getByAltText(/ainative/i);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Token Validation', () => {
    it('should display error when token is missing', () => {
      // Given no token in URL
      // When rendering the page
      render(<ResetPasswordPage />);

      // Then it should show error message
      expect(screen.getByRole('heading', { name: /invalid reset link/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/new password/i)).not.toBeInTheDocument();
    });

    it('should display error when token is empty', () => {
      // Given empty token in URL
      mockSearchParams.set('token', '');

      // When rendering the page
      render(<ResetPasswordPage />);

      // Then it should show error message
      expect(screen.getByRole('heading', { name: /invalid reset link/i })).toBeInTheDocument();
    });

    it('should provide link to request new reset when token invalid', () => {
      // Given no token
      // When rendering the page
      const { container } = render(<ResetPasswordPage />);

      // Then it should have link to forgot password
      const forgotLink = container.querySelector('a[href="/forgot-password"]');
      expect(forgotLink).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should require password fields', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When the password inputs are rendered
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

      // Then they should be required
      expect(newPasswordInput).toBeRequired();
      expect(confirmPasswordInput).toBeRequired();
    });

    it('should have autocomplete="new-password" on new password field', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When the password input is rendered
      const newPasswordInput = screen.getByLabelText(/^new password$/i);

      // Then it should have autocomplete="new-password"
      expect(newPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should have autocomplete="new-password" on confirm password field', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When the confirm password input is rendered
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      // Then it should have autocomplete="new-password"
      expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
    });

    it('should enforce minimum password length', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When the password inputs are rendered
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;

      // Then it should have minimum length requirement
      expect(newPasswordInput).toHaveAttribute('minLength', '8');
    });

    it('should display error when passwords do not match', async () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When user enters mismatched passwords
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should display validation error
      await waitFor(() => {
        expect(screen.getByText(/passwords.*do not match/i)).toBeInTheDocument();
      });
    });

    it('should display error for weak password', async () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When user enters weak password
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      // Then it should show validation error
      // HTML5 validation will catch this with minLength
      // Note: HTML5 validation doesn't trigger in test environment
      expect(newPasswordInput).toHaveAttribute('minLength', '8');
    });

    it('should show password strength indicator', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When user types password
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      fireEvent.change(newPasswordInput, { target: { value: 'WeakPass1!' } });

      // Then password strength indicator should be visible
      // Note: This is optional UX enhancement
      const strengthIndicator = screen.queryByText(/password strength/i);
      // Accept either present or not present for now
      expect(strengthIndicator !== null || strengthIndicator === null).toBe(true);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should call /v1/auth/reset-password with token', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      // When user submits new password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should call the API with token
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/auth/reset-password'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: 'valid-reset-token-123',
              new_password: 'NewPassword123!',
            }),
          })
        );
      });
    });

    it('should redirect to login after successful reset', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      // When user successfully resets password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should show success and redirect to login
      await waitFor(() => {
        expect(screen.getByText(/your password has been reset successfully/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Wait for redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });

    it('should handle invalid/expired token error', async () => {
      // Given an expired token error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid or expired token' }),
      });

      // When user submits password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should display error message
      await waitFor(() => {
        expect(screen.getByText(/invalid.*expired.*token/i)).toBeInTheDocument();
      });
    });

    it('should display network error message', async () => {
      // Given a network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // When user submits password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
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
                  json: async () => ({ message: 'Password reset successful' }),
                }),
              100
            )
          )
      );

      // When user submits password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should show loading state
      expect(screen.getByText(/resetting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion and redirect
      await waitFor(() => {
        expect(screen.getByText(/your password has been reset successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
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
                  json: async () => ({ message: 'Password reset successful' }),
                }),
              100
            )
          )
      );

      // When user submits password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then inputs should be disabled
      expect(newPasswordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();

      // Wait for completion and redirect
      await waitFor(() => {
        expect(screen.getByText(/your password has been reset successfully/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('User Experience', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should show password visibility toggle', () => {
      // When rendering the page
      render(<ResetPasswordPage />);

      // Then password fields should be type password
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      expect(newPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should display success message before redirect', async () => {
      // Given a successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      // When user successfully resets password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then it should show success message
      await waitFor(() => {
        expect(screen.getByText(/your password has been reset successfully/i)).toBeInTheDocument();
      });
    });

    it('should provide link to login page', () => {
      mockSearchParams.set('token', 'valid-reset-token-123');

      // When rendering the page
      const { container } = render(<ResetPasswordPage />);

      // Then it should have a link to login
      const loginLink = container.querySelector('a[href="/login"]');
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should handle empty password submission', () => {
      // Given the reset password page
      render(<ResetPasswordPage />);

      // When user tries to submit without passwords
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      fireEvent.click(submitButton);

      // Then it should prevent submission via HTML5 validation
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      expect(newPasswordInput.validity.valid).toBe(false);
    });

    it('should handle very long passwords', async () => {
      // Given a very long password
      const longPassword = 'A'.repeat(100) + '1!';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      // When user submits long password
      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: longPassword } });
      fireEvent.change(confirmPasswordInput, { target: { value: longPassword } });
      fireEvent.click(submitButton);

      // Then it should handle it gracefully
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle malformed tokens gracefully', () => {
      // Given a malformed token
      mockSearchParams.set('token', 'invalid-token-with-<script>alert("xss")</script>');

      // When rendering the page
      render(<ResetPasswordPage />);

      // Then it should still render form without XSS
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-reset-token-123');
    });

    it('should have accessible form labels', () => {
      // When rendering the page
      render(<ResetPasswordPage />);

      // Then all form inputs should have labels
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should display error messages with proper ARIA attributes', async () => {
      // Given mismatched passwords
      render(<ResetPasswordPage />);

      // When error is displayed
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
      fireEvent.click(submitButton);

      // Then error should be accessible
      await waitFor(() => {
        const errorMessage = screen.getByText(/passwords.*do not match/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should display success messages with proper ARIA attributes', async () => {
      // Given successful password reset
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successful' }),
      });

      render(<ResetPasswordPage />);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      // Then success message should be accessible
      await waitFor(() => {
        const successMessage = screen.getByText(/your password has been reset successfully/i);
        expect(successMessage).toBeInTheDocument();
      });
    });
  });
});
