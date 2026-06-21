'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TerminalHeader } from '@/components/terminal-header';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ainative.studio/v1';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send reset email';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
          // Response wasn't JSON
        }
        throw new Error(errorMessage);
      }

      setSubmittedEmail(trimmedEmail);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setEmail('');
    setSubmittedEmail('');
    setError(null);
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
              <TerminalHeader text="> forgot-password" typingSpeed={80} />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              {isSuccess
                ? "Check your email for reset instructions"
                : "Enter your email address and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSuccess ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-md bg-success/10 border border-success/20">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-success mb-1">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to <strong className="text-foreground">{submittedEmail}</strong>.
                      Click the link in the email to reset your password.
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm space-y-2">
                  <p className="text-muted-foreground">Didn't receive the email?</p>
                  <Button
                    variant="outline"
                    onClick={handleTryAgain}
                    className="w-full"
                  >
                    Try a different email
                  </Button>
                </div>

                <div className="text-center text-sm">
                  <Link href="/login" className="text-brand-primary hover:underline font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-brand-primary hover:bg-primary-dark text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <Link href="/login" className="text-brand-primary hover:underline font-medium inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
