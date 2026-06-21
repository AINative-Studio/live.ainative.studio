'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Copy, Check, Gift, Twitter, Linkedin, Users, Star, Crown, Zap } from 'lucide-react';

const REFERRAL_TIERS = [
  { count: 5, label: 'Referral Badge', icon: Star, color: 'text-amber-400' },
  { count: 10, label: 'Featured Streamer', icon: Crown, color: 'text-brand-primary' },
  { count: 25, label: 'Pro Access', icon: Zap, color: 'text-emerald-400' },
];

export function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Placeholder referral count — will be wired to API when backend is ready
  const referralCount = 0;

  const referralLink = `https://live.ainative.studio/register?ref=${user?.username || ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on AINative Studio Live — the developer streaming platform with AI-powered chat, code-aware streams, and tech-stack discovery. Sign up here:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!user?.username) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-brand-primary" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Stats */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Referred users</span>
          </div>
          <span className="font-bold text-lg">{referralCount}</span>
        </div>

        {/* Referral Link */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Your referral link</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono truncate text-muted-foreground">
              {referralLink}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0"
              aria-label={copied ? 'Copied' : 'Copy referral link'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={shareOnTwitter}
          >
            <Twitter className="w-4 h-4 mr-1" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={shareOnLinkedIn}
          >
            <Linkedin className="w-4 h-4 mr-1" />
            LinkedIn
          </Button>
        </div>

        {/* Tier Progress */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Rewards</p>
          <div className="space-y-2">
            {REFERRAL_TIERS.map((tier) => {
              const Icon = tier.icon;
              const achieved = referralCount >= tier.count;
              return (
                <div
                  key={tier.count}
                  className={`flex items-center justify-between text-sm p-2 rounded ${
                    achieved ? 'bg-brand-primary/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${achieved ? tier.color : 'text-muted-foreground'}`} />
                    <span className={achieved ? 'font-medium' : 'text-muted-foreground'}>
                      {tier.label}
                    </span>
                  </div>
                  {achieved ? (
                    <Badge variant="secondary" className="text-xs">Unlocked</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {tier.count - referralCount} more
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
