'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VODQualitySelector } from './vod-quality-selector';
import type { VODQualityLevel } from '@/types';
import type { VODChapter } from '@/types';
import { Play, Loader2, ListVideo } from 'lucide-react';

// Dynamically import video player (client-side only)
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface VODPlayerProps {
  title: string;
  duration: number;
  videoUrl?: string;
  qualityLevels?: VODQualityLevel[];
  thumbnailUrl?: string;
  chapters?: VODChapter[];
  vodId?: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onGenerateChapters?: () => Promise<void>;
  isGeneratingChapters?: boolean;
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

// Chapter timeline marker — shows as a pip on the progress bar area below the video
function ChapterMarker({
  chapter,
  duration,
  onClick,
}: {
  chapter: VODChapter;
  duration: number;
  onClick: () => void;
}) {
  if (!duration) return null;
  const pct = Math.min(100, (chapter.startTimeSeconds / duration) * 100);

  return (
    <button
      onClick={onClick}
      title={`${chapter.title} — ${formatDuration(chapter.startTimeSeconds)}`}
      aria-label={`Jump to chapter: ${chapter.title} at ${formatDuration(chapter.startTimeSeconds)}`}
      className="absolute top-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-white shadow hover:scale-125 transition-transform z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      style={{ left: `${pct}%` }}
    />
  );
}

// Chapter list panel rendered below the player
function ChapterList({
  chapters,
  onSeek,
}: {
  chapters: VODChapter[];
  onSeek: (time: number) => void;
}) {
  if (!chapters.length) return null;

  return (
    <div className="mt-3 border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border">
        <ListVideo className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Chapters</span>
        <Badge variant="secondary" className="text-xs ml-auto">{chapters.length}</Badge>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {chapters.map((chapter, i) => (
          <button
            key={chapter.id}
            onClick={() => onSeek(chapter.startTimeSeconds)}
            className="w-full text-left px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
          >
            <span className="font-mono text-xs text-brand-primary shrink-0 w-12">
              {formatDuration(chapter.startTimeSeconds)}
            </span>
            <span className="text-sm truncate flex-1">
              {i + 1}. {chapter.title}
            </span>
            {chapter.isAiGenerated && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5 shrink-0">AI</Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function VODPlayer({
  title,
  duration,
  videoUrl,
  qualityLevels,
  thumbnailUrl,
  chapters = [],
  vodId,
  currentTime,
  onTimeUpdate,
  onGenerateChapters,
  isGeneratingChapters = false,
}: VODPlayerProps) {
  const [currentQuality, setCurrentQuality] = useState<VODQualityLevel | undefined>(
    qualityLevels?.[0]
  );
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>(videoUrl);
  // react-player v3 forwards a ref to the underlying HTMLVideoElement
  const playerRef = useRef<HTMLVideoElement>(null);

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

  // Seek to external currentTime when it changes (from transcript panel clicks)
  useEffect(() => {
    if (currentTime !== undefined && playerRef.current) {
      playerRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleSeekToChapter = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time;
    }
  };

  const hasQualityOptions = qualityLevels && qualityLevels.length > 0;
  const hasChapters = chapters.length > 0;

  return (
    <div className="space-y-1">
      <Card className="overflow-hidden border-border bg-black">
        <div className="relative aspect-video bg-black">
          {playbackUrl ? (
            <>
              <ReactPlayer
                ref={playerRef}
                src={playbackUrl}
                controls
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                  onTimeUpdate?.((e.currentTarget as HTMLVideoElement).currentTime);
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

        {/* Chapter timeline markers — rendered in a thin bar below the video */}
        {hasChapters && duration > 0 && (
          <div className="relative h-5 bg-muted/30 border-t border-border px-2">
            {chapters.map((chapter) => (
              <ChapterMarker
                key={chapter.id}
                chapter={chapter}
                duration={duration}
                onClick={() => handleSeekToChapter(chapter.startTimeSeconds)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Chapter list + auto-generate button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {hasChapters ? `${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}` : 'No chapters'}
        </span>
        {onGenerateChapters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateChapters}
            disabled={isGeneratingChapters}
            className="text-xs h-7"
          >
            {isGeneratingChapters ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ListVideo className="w-3 h-3 mr-1.5" />
                Auto-generate Chapters
              </>
            )}
          </Button>
        )}
      </div>

      {/* Chapter list */}
      {hasChapters && (
        <ChapterList chapters={chapters} onSeek={handleSeekToChapter} />
      )}
    </div>
  );
}
