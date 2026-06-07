'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ViewerCountBadge } from './viewer-count-badge';
import { Subtitles } from 'lucide-react';

// Dynamically import Cloudflare Stream player (client-side only)
const Stream = dynamic(
  () => import('@cloudflare/stream-react').then((mod) => mod.Stream),
  { ssr: false }
);

interface StreamPlayerProps {
  title: string;
  viewers?: number;
  viewerCount?: number;
  username: string;
  thumbnail: string;
  isLive?: boolean;
  streamId?: string;
  cloudflareVideoId?: string; // Cloudflare Stream video ID
}

// Caption overlay rendered at the bottom of the video frame
function CaptionOverlay({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="absolute bottom-14 left-0 right-0 flex justify-center px-4 pointer-events-none z-30">
      <span className="bg-black/80 text-white text-sm px-3 py-1.5 rounded max-w-[80%] text-center leading-snug">
        {text}
      </span>
    </div>
  );
}

// Toast shown when captions are toggled but backend is required
function CaptionToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-brand-primary text-white text-xs px-4 py-2 rounded shadow-lg pointer-events-none whitespace-nowrap">
      Live captions coming soon — requires backend transcription service
    </div>
  );
}

export function StreamPlayer({
  title,
  viewers,
  viewerCount,
  username,
  thumbnail,
  isLive = true,
  streamId,
  cloudflareVideoId
}: StreamPlayerProps) {
  const [showMockPlayer, setShowMockPlayer] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [showCaptionToast, setShowCaptionToast] = useState(false);

  // Ref to hold the toast timer so we can clear it on unmount
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use viewerCount if provided (real-time from WebSocket), otherwise fall back to viewers
  const currentViewerCount = viewerCount !== undefined ? viewerCount : (viewers || 0);

  // Get Cloudflare configuration from environment
  const cloudflareAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
  const cloudflareCustomerSubdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN;

  // Check if we have valid Cloudflare configuration
  useEffect(() => {
    const hasCloudflareConfig = cloudflareAccountId && cloudflareAccountId !== 'your_account_id_here';
    const hasVideoId = cloudflareVideoId && cloudflareVideoId !== '';

    setShowMockPlayer(!hasCloudflareConfig || !hasVideoId);
  }, [cloudflareAccountId, cloudflareVideoId]);

  // Reset captions and clear any pending timers when component unmounts
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleToggleCaptions = () => {
    const next = !showCaptions;
    setShowCaptions(next);

    if (next) {
      // Show a toast notifying the user that live captions require a backend service.
      // When the backend transcription endpoint is available, this is where we would
      // call captureStream() on the video element, chunk audio every ~5s, and send
      // each chunk to transcribeAudio() from @ainative/ai-kit-video.
      setShowCaptionToast(true);
      setCaptionText('');

      toastTimerRef.current = setTimeout(() => {
        setShowCaptionToast(false);
      }, 4000);
    } else {
      setCaptionText('');
      setShowCaptionToast(false);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    }
  };

  const captionButton = (
    <Button
      variant={showCaptions ? 'default' : 'ghost'}
      size="icon"
      onClick={handleToggleCaptions}
      aria-label={showCaptions ? 'Disable captions' : 'Enable captions'}
      aria-pressed={showCaptions}
      title="Closed captions (CC)"
      className={`h-8 w-8 rounded ${
        showCaptions
          ? 'bg-brand-primary text-white hover:bg-primary-dark'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      <Subtitles className="h-4 w-4" />
    </Button>
  );

  return (
    <Card className="overflow-hidden border-border bg-black">
      <div className="relative aspect-video bg-black">
        {/* Cloudflare Stream Player */}
        {!showMockPlayer && cloudflareVideoId ? (
          <div className="relative w-full h-full">
            <Stream
              src={cloudflareVideoId}
              controls
              autoplay={isLive}
              muted={false}
              preload="auto"
              responsive={true}
              primaryColor="#5867EF"
              letterboxColor="#000000"
            />

            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
              {isLive && (
                <div className="bg-success text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
              <ViewerCountBadge
                count={currentViewerCount}
                isLive={isLive}
                animated={viewerCount !== undefined}
              />
            </div>

            {/* CC toggle — top-right corner */}
            <div className="absolute top-4 right-4 z-20">
              {captionButton}
            </div>

            {/* Caption toast */}
            <CaptionToast visible={showCaptionToast} />

            {/* Caption overlay */}
            <CaptionOverlay text={captionText} />
          </div>
        ) : (
          /* Offline / Not Broadcasting State */
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black/70" />
              <div className="relative z-10 text-center max-w-md px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <p className="text-white text-lg font-medium mb-2">
                  {username} is currently not broadcasting
                </p>
                <p className="text-white/50 text-sm">
                  Check back later or explore other live streams
                </p>
              </div>
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              {isLive && (
                <div className="bg-success text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
              <ViewerCountBadge
                count={currentViewerCount}
                isLive={isLive}
                animated={viewerCount !== undefined}
              />
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <p className="text-white font-semibold text-sm bg-black/80 px-3 py-1 rounded">
                {title}
              </p>
              {captionButton}
            </div>

            {/* Caption toast (offline state) */}
            <CaptionToast visible={showCaptionToast} />

            {/* Caption overlay (offline state) */}
            <CaptionOverlay text={captionText} />
          </div>
        )}
      </div>
    </Card>
  );
}
