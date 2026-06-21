'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, Twitter, Linkedin, Copy, Check, Loader2 } from 'lucide-react';

interface SocialShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamTitle: string;
  streamDescription?: string;
  language?: string;
  duration?: number;
  viewerCount?: number;
}

export function SocialShareDialog({
  open,
  onOpenChange,
  streamTitle,
  streamDescription,
  language,
  duration,
  viewerCount,
}: SocialShareDialogProps) {
  const [twitterPost, setTwitterPost] = useState('');
  const [linkedinPost, setLinkedinPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamTitle,
          streamDescription,
          language,
          duration,
          viewerCount,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate posts');
      }

      const data = await res.json();
      setTwitterPost(data.twitter || '');
      setLinkedinPost(data.linkedin || '');
      setIsGenerated(true);
    } catch (err) {
      console.error('Failed to generate social posts:', err);
      setError('Failed to generate posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setTwitterPost('');
      setLinkedinPost('');
      setIsGenerated(false);
      setError(null);
      setCopiedPlatform(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-brand-primary" />
            Share to Social
          </DialogTitle>
          <DialogDescription>
            Generate social media posts for &quot;{streamTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {!isGenerated ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate ready-to-post content for Twitter and LinkedIn about your stream.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={generatePosts}
              disabled={isLoading}
              className="bg-brand-primary hover:bg-primary-dark"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Posts
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Twitter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  <span className="font-medium text-sm">Twitter / X</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {twitterPost.length}/280
                </Badge>
              </div>
              <Textarea
                value={twitterPost}
                onChange={(e) => setTwitterPost(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
                maxLength={280}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copyToClipboard(twitterPost, 'twitter')}
              >
                {copiedPlatform === 'twitter' ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                  <span className="font-medium text-sm">LinkedIn</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {linkedinPost.length}/700
                </Badge>
              </div>
              <Textarea
                value={linkedinPost}
                onChange={(e) => setLinkedinPost(e.target.value)}
                className="min-h-[140px] text-sm resize-none"
                maxLength={700}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copyToClipboard(linkedinPost, 'linkedin')}
              >
                {copiedPlatform === 'linkedin' ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-success" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={generatePosts}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Regenerate Posts
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
