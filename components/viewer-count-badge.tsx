import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewerCountBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  live?: boolean;
}

export function ViewerCountBadge({ count, size = 'md', live = false }: ViewerCountBadgeProps) {
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

  return (
    <Badge
      variant="secondary"
      className={`${sizeClasses[size]} bg-black/80 text-white font-mono flex items-center gap-1.5`}
    >
      {live && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
      <Eye className={iconSizes[size]} />
      <span>{count.toLocaleString()}</span>
    </Badge>
  );
}
