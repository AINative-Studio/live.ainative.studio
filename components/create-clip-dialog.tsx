'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Scissors, Loader2 } from 'lucide-react';
import { clipsService } from '@/services/clips';

interface CreateClipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: string;
  streamTitle: string;
  /** Total duration of the content in seconds (for VODs) */
  totalDuration?: number;
  /** Whether clipping from a live stream (captures last N seconds) */
  isLive?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CreateClipDialog({
  open,
  onOpenChange,
  streamId,
  streamTitle,
  totalDuration,
  isLive = false,
}: CreateClipDialogProps) {
  const [title, setTitle] = useState('');
  const [clipDuration, setClipDuration] = useState(30);
  const [clipRange, setClipRange] = useState<[number, number]>([0, 60]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxClipDuration = 60;
  const minClipDuration = 30;

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your clip');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      let startTime: number;
      let endTime: number;

      if (isLive) {
        // For live streams, clip the last N seconds
        endTime = Math.floor(Date.now() / 1000);
        startTime = endTime - clipDuration;
      } else {
        // For VODs, use the selected range
        startTime = clipRange[0];
        endTime = clipRange[1];
      }

      await clipsService.create(streamId, {
        title: title.trim(),
        startTime,
        endTime,
      });

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setTitle('');
        setClipDuration(30);
        setClipRange([0, 60]);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create clip:', err);
      setError(err?.message || 'Failed to create clip. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isCreating) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setTitle('');
        setError(null);
        setSuccess(false);
        setClipDuration(30);
        setClipRange([0, 60]);
      }
    }
  };

  const vodMaxEnd = totalDuration || 3600;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-brand-primary" />
            Create Clip
          </DialogTitle>
          <DialogDescription>
            {isLive
              ? `Clip the last ${clipDuration} seconds from "${streamTitle}"`
              : `Select a 30-60 second segment from "${streamTitle}"`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scissors className="w-6 h-6 text-success" />
            </div>
            <p className="font-semibold text-lg">Clip Created!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your clip is being processed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clip-title">Clip Title</Label>
              <Input
                id="clip-title"
                placeholder="Enter a title for your clip..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/100
              </p>
            </div>

            {isLive ? (
              <div className="space-y-2">
                <Label>Clip Length: {clipDuration}s</Label>
                <Slider
                  value={[clipDuration]}
                  onValueChange={(v) => setClipDuration(v[0])}
                  min={minClipDuration}
                  max={maxClipDuration}
                  step={5}
                  disabled={isCreating}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minClipDuration}s</span>
                  <span>{maxClipDuration}s</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  Time Range: {formatTime(clipRange[0])} - {formatTime(clipRange[1])}
                  <span className="text-muted-foreground ml-2">
                    ({clipRange[1] - clipRange[0]}s)
                  </span>
                </Label>
                <Slider
                  value={clipRange}
                  onValueChange={(v) => {
                    const [start, end] = v;
                    const duration = end - start;
                    if (duration >= minClipDuration && duration <= maxClipDuration) {
                      setClipRange([start, end]);
                    }
                  }}
                  min={0}
                  max={vodMaxEnd}
                  step={1}
                  disabled={isCreating}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(0)}</span>
                  <span>{formatTime(vodMaxEnd)}</span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !title.trim()}
              className="bg-brand-primary hover:bg-primary-dark"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Create Clip
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
