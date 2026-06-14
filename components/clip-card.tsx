import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Scissors } from 'lucide-react';
import type { Clip } from '@/types';

interface ClipCardProps {
  clip: Clip;
  priority?: boolean;
}

function formatClipDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function ClipCard({ clip, priority = false }: ClipCardProps) {
  const thumbnail = clip.thumbnailUrl || '/placeholder-stream.jpg';
  const username = clip.user?.username || 'unknown';
  const displayName = clip.user?.displayName || username;
  const avatar = clip.user?.avatar;

  return (
    <Link href={`/clips/${clip.id}`}>
      <Card className="group overflow-hidden border-border hover:border-brand-primary transition-all duration-300 cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnail}
            alt={clip.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <Badge variant="secondary" className="bg-brand-primary/90 text-white font-mono text-xs flex items-center gap-1">
              <Scissors className="w-3 h-3" />
              Clip
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-black/80 text-white font-mono text-xs">
              {formatClipDuration(clip.duration)}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-black/80 text-white font-mono text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(clip.viewCount)}
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-primary/50">
              <AvatarImage src={avatar || undefined} alt={displayName} />
              <AvatarFallback>{displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {clip.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Clipped by {displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {clip.stream?.title}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
