'use client';

import { useEffect, useState } from 'react';
import { Check, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { VODQualityLevel } from '@/types';

interface VODQualitySelectorProps {
  qualityLevels?: VODQualityLevel[];
  currentQuality?: VODQualityLevel;
  onQualityChange: (quality: VODQualityLevel) => void;
}

const QUALITY_STORAGE_KEY = 'vod_quality_preference';

export function VODQualitySelector({
  qualityLevels,
  currentQuality,
  onQualityChange,
}: VODQualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle missing or empty quality levels
  if (!qualityLevels || qualityLevels.length === 0) {
    return null;
  }

  // Load saved quality preference on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !qualityLevels || qualityLevels.length === 0) {
      return;
    }

    try {
      const savedQuality = localStorage.getItem(QUALITY_STORAGE_KEY);
      if (savedQuality) {
        const matchingQuality = qualityLevels.find(
          (q) => q.label === savedQuality
        );
        if (matchingQuality && matchingQuality.label !== currentQuality?.label) {
          onQualityChange(matchingQuality);
        }
      }
    } catch (error) {
      console.error('Failed to load quality preference:', error);
    }
  }, [qualityLevels, currentQuality, onQualityChange]);

  const handleQualitySelect = (quality: VODQualityLevel) => {
    onQualityChange(quality);
    setIsOpen(false);

    // Save preference to localStorage
    try {
      localStorage.setItem(QUALITY_STORAGE_KEY, quality.label);
    } catch (error) {
      console.error('Failed to save quality preference:', error);
    }
  };

  // If only one quality level, disable the selector
  const isSingleQuality = qualityLevels.length === 1;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isSingleQuality}
          className="gap-2 font-mono text-xs"
          aria-label={`Quality: ${currentQuality?.label || 'Auto'}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <Settings className="w-4 h-4" />
          {currentQuality?.label || 'Auto'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {qualityLevels.map((quality) => {
          const isSelected = quality.label === currentQuality?.label;
          return (
            <DropdownMenuItem
              key={quality.label}
              onClick={() => handleQualitySelect(quality)}
              className="cursor-pointer"
              data-selected={isSelected}
              role="menuitem"
              aria-label={quality.label}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-sm">{quality.label}</span>
                {isSelected && <Check className="w-4 h-4 text-brand-primary" />}
              </div>
              {quality.height > 0 && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {quality.bitrate} kbps
                </div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
