'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { aiChatService } from '@/services/ai-chat';
import { NotFoundError } from '@/lib/api-client';

interface AiSummaryCardProps {
  streamId: string;
}

const REFRESH_INTERVAL_MS = 2.5 * 60 * 1000; // 2.5 minutes

export function AiSummaryCard({ streamId }: AiSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await aiChatService.getStreamSummary(streamId);
      setSummary(data.summary);
      setTopics(data.topics);
      setCurrentActivity(data.currentActivity);
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError('AI summary coming soon! This feature is not available yet.');
      } else {
        setError('Unable to load AI summary right now.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  // Fetch on expand, and set up auto-refresh
  useEffect(() => {
    if (isExpanded) {
      fetchSummary();
      intervalRef.current = setInterval(fetchSummary, REFRESH_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isExpanded, fetchSummary]);

  return (
    <Card className="border-border">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            AI Summary
            <Badge className="text-[10px] px-1.5 py-0 bg-brand-primary/20 text-brand-primary border-brand-primary/30 font-medium">
              Beta
            </Badge>
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading && !summary && (
            <div className="flex items-center gap-2 py-4">
              <Sparkles className="w-4 h-4 text-brand-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Generating summary...</span>
            </div>
          )}

          {error && !summary && (
            <p className="text-sm text-muted-foreground py-2">{error}</p>
          )}

          {summary && (
            <div className="space-y-3">
              {currentActivity && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Currently Working On
                  </h4>
                  <p className="text-sm text-foreground">{currentActivity}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Summary
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
              </div>

              {topics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="font-mono text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchSummary();
                  }}
                  disabled={isLoading}
                  className="text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
