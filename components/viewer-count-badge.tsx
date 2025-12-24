'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewerCountBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  isLive?: boolean;
  animated?: boolean;
}

export function ViewerCountBadge({
  count,
  size = 'md',
  isLive = false,
  animated = false
}: ViewerCountBadgeProps) {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Animate count changes when enabled
  useEffect(() => {
    if (!animated) {
      setDisplayCount(count);
      return;
    }

    if (count !== displayCount) {
      setIsAnimating(true);
      setDisplayCount(count);

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [count, animated, displayCount]);

  return (
    <Badge
      variant="secondary"
      className={`${sizeClasses[size]} bg-dark-2/90 text-white font-medium flex items-center gap-1.5 transition-all ${
        isAnimating ? 'scale-110' : 'scale-100'
      }`}
    >
      {isLive && <span className="w-2 h-2 bg-success rounded-full animate-live-pulse" />}
      <Eye className={iconSizes[size]} />
      <span className={isAnimating ? 'font-bold' : ''}>{displayCount.toLocaleString()}</span>
    </Badge>
  );
}
