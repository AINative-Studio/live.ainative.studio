'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { VODQualitySelector } from './vod-quality-selector';
import type { VODQualityLevel } from '@/types';
import { Play } from 'lucide-react';

// Dynamically import video player (client-side only)
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

interface VODPlayerProps {
  title: string;
  duration: number;
  videoUrl?: string;
  qualityLevels?: VODQualityLevel[];
  thumbnailUrl?: string;
}

export function VODPlayer({
  title,
  duration,
  videoUrl,
  qualityLevels,
  thumbnailUrl,
}: VODPlayerProps) {
  const [currentQuality, setCurrentQuality] = useState<VODQualityLevel | undefined>(
    qualityLevels?.[0]
  );
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>(videoUrl);

  // Update playback URL when quality changes
  const handleQualityChange = (quality: VODQualityLevel) => {
    setCurrentQuality(quality);
    setPlaybackUrl(quality.url);
  };

  // Initialize with first quality level or videoUrl
  useEffect(() => {
    if (qualityLevels && qualityLevels.length > 0) {
      const defaultQuality = qualityLevels.find((q) => q.label === 'Auto') || qualityLevels[0];
      setCurrentQuality(defaultQuality);
      setPlaybackUrl(defaultQuality.url);
    } else if (videoUrl) {
      setPlaybackUrl(videoUrl);
    }
  }, [qualityLevels, videoUrl]);

  const hasQualityOptions = qualityLevels && qualityLevels.length > 0;

  return (
    <Card className="overflow-hidden border-border bg-black">
      <div className="relative aspect-video bg-black">
        {playbackUrl ? (
          <>
            <ReactPlayer
              url={playbackUrl}
              controls
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                  },
                },
              }}
            />

            {/* Quality Selector Overlay */}
            {hasQualityOptions && (
              <div className="absolute bottom-16 right-4 z-20">
                <VODQualitySelector
                  qualityLevels={qualityLevels}
                  currentQuality={currentQuality}
                  onQualityChange={handleQualityChange}
                />
              </div>
            )}
          </>
        ) : (
          /* Placeholder when no video URL */
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
              style={{
                backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
              }}
            >
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 text-center max-w-md px-4">
                <Play className="w-20 h-20 text-white/80 mx-auto mb-4" />
                <p className="text-brand-primary font-mono text-xl mb-4">VOD PLAYER</p>
                <p className="text-white/80 text-sm mb-2">
                  Video playback would be integrated here
                </p>
                <p className="text-white/60 text-xs">
                  This VOD is not yet available for playback
                </p>
              </div>
            </div>

            {/* VOD Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-brand-primary text-white px-3 py-1 rounded text-xs font-medium">
                VOD
              </div>
            </div>

            {/* Duration */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/80 text-white px-3 py-1 rounded text-xs font-mono">
                {formatDuration(duration)}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
