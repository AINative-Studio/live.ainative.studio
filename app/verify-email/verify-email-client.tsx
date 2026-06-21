'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, CircleX, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { TerminalHeader } from '@/components/terminal-header';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

type VerificationState = 'loading' | 'success' | 'error' | 'idle';

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const registered = searchParams.get('registered');
  const emailParam = searchParams.get('email');

  const [state, setState] = useState<VerificationState>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setState('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      if (response.ok) {
        setState('success');
        setMessage('Your email has been verified successfully!');
      } else {
        const error = await response.json();
        setState('error');
        setMessage(error.detail || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setState('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        const error = await response.json();
        setMessage(error.detail || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (token) {
      // Token-based verification flow
      if (state === 'loading') {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
            <h3 className="text-xl font-bold mb-2">Verifying Your Email</h3>
            <p className="text-sm text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        );
      }

      if (state === 'success') {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
              <CircleCheck className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-500">Email Verified!</h3>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-brand-primary hover:bg-primary-dark text-white font-medium"
            >
              Continue to Login
            </Button>
          </div>
        );
      }

      if (state === 'error') {
        const isExpired = message.toLowerCase().includes('expired');

        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <CircleX className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-red-500">
              {isExpired ? 'Link Expired' : 'Verification Failed'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>

            {isExpired && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Would you like to resend the verification email?
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isResending}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-primary-dark text-white font-medium"
                    disabled={isResending || !email}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </Button>
                </form>

                {resendSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-500">Check your email for the verification link!</p>
                  </div>
                )}
              </div>
            )}

            {!isExpired && (
              <div className="space-y-2 mt-4">
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Go to Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );
      }
    }

    // No token - show resend form or post-registration message
    const isPostRegistration = registered === 'true';

    return (
      <div className="space-y-6">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isPostRegistration ? 'bg-green-500/10' : 'bg-amber-500/10'
          }`}>
            <Mail className={`w-10 h-10 ${isPostRegistration ? 'text-green-500' : 'text-amber-500'}`} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isPostRegistration ? 'text-green-500' : 'text-amber-500'}`}>
            {isPostRegistration ? 'Check Your Email' : 'Invalid Link'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isPostRegistration
              ? 'We\'ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.'
              : 'No verification token provided'}
          </p>
        </div>

        {!isPostRegistration && (
          <div className="text-sm text-muted-foreground text-center mb-4">
            <p>If you need a verification email, enter your email below:</p>
          </div>
        )}

        <form onSubmit={handleResendVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isResending}
            />
          </div>

          {message && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border ${
              resendSuccess
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              {resendSuccess ? (
                <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${resendSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-brand-primary hover:bg-primary-dark text-white font-medium"
            disabled={isResending || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Verification Email'
            )}
          </Button>
        </form>

        <div className="space-y-2">
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Go to Register
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <img src="/ainative-icon.svg" alt="AINative Studio Live" className="h-10 w-auto" />
          <span className="text-xl font-bold tracking-tight uppercase flex items-center gap-1">
            <span className="text-white">AI</span>
            <span className="text-brand-primary">NATIVE</span>
            <span className="text-muted-foreground text-sm ml-2 font-normal">LIVE</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <TerminalHeader text="> verify_email" typingSpeed={80} />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
