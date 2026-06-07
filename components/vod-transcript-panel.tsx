'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, Loader2, Clock } from 'lucide-react';

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

interface VODTranscriptPanelProps {
  vodId: string;
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  isGenerating?: boolean;
  onGenerateTranscript?: () => void;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VODTranscriptPanel({
  vodId,
  segments,
  currentTime,
  onSeek,
  isGenerating = false,
  onGenerateTranscript,
}: VODTranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeSegmentRef = useRef<HTMLButtonElement | null>(null);

  // Find the segment that contains the current playback time
  const activeSegmentIndex = segments.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  // Filter segments by search query
  const filteredSegments = segments.filter((seg) =>
    seg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll the active segment into view when currentTime changes
  useEffect(() => {
    if (activeSegmentRef.current && !searchQuery) {
      activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSegmentIndex, searchQuery]);

  const hasSegments = segments.length > 0;

  return (
    <Card className="border-border flex flex-col h-full">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transcript
            {hasSegments && (
              <Badge variant="secondary" className="text-xs font-normal">
                {segments.length} segments
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Search input — only shown when there are segments */}
        {hasSegments && (
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
              aria-label="Search transcript"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        {isGenerating ? (
          /* Generating skeleton */
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : hasSegments ? (
          /* Transcript segments list */
          <div className="max-h-[520px] overflow-y-auto" role="list" aria-label="Transcript segments">
            {filteredSegments.length > 0 ? (
              filteredSegments.map((seg, i) => {
                // Map filtered index back to original index for active state
                const originalIndex = segments.indexOf(seg);
                const isActive = originalIndex === activeSegmentIndex;

                return (
                  <button
                    key={`${seg.start}-${i}`}
                    ref={isActive ? activeSegmentRef : null}
                    onClick={() => onSeek(seg.start)}
                    className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset ${
                      isActive ? 'bg-brand-primary/10 border-l-2 border-l-brand-primary' : ''
                    }`}
                    role="listitem"
                    aria-label={`Seek to ${formatTimestamp(seg.start)}: ${seg.text}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-brand-primary shrink-0 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(seg.start)}
                      </span>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {seg.text}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No results for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          /* Empty state with generate button */
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4">
            <FileText className="w-12 h-12 opacity-40" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">No transcript available</p>
              <p className="text-xs">
                Generate a transcript to search through the recording and jump to any moment.
              </p>
            </div>
            {onGenerateTranscript && (
              <Button
                onClick={onGenerateTranscript}
                size="sm"
                className="bg-brand-primary hover:bg-primary-dark text-white"
              >
                Generate Transcript
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
