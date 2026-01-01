'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ViewerCountBadge } from './viewer-count-badge';

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
          </div>
        ) : (
          /* Mock Player Fallback */
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 text-center max-w-md px-4">
                <p className="text-brand-primary font-mono text-xl mb-4">
                  CLOUDFLARE STREAM NOT CONFIGURED
                </p>
                <p className="text-white/80 text-sm mb-2">
                  To enable live streaming, configure Cloudflare Stream credentials
                </p>
                <p className="text-white/60 text-xs font-mono">
                  Set NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID in .env.local
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

            <div className="absolute top-4 right-4 z-20">
              <p className="text-white font-semibold text-sm bg-black/80 px-3 py-1 rounded">
                {title}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
