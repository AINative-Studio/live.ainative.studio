import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import type { Stream } from '@/types';

interface StreamCardProps {
  stream: Stream;
}

export function StreamCard({ stream }: StreamCardProps) {
  return (
    <Link href={`/stream/${stream.username}`}>
      <Card className="group overflow-hidden border-border hover:border-neon-green transition-all duration-300 cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={stream.thumbnail}
            alt={stream.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {stream.live && (
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-600 text-white font-mono text-xs">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1.5" />
                LIVE
              </Badge>
              <Badge variant="secondary" className="bg-black/80 text-white font-mono text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {stream.viewers.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border-2 border-neon-green/50">
              <AvatarImage src={stream.avatar} alt={stream.displayName} />
              <AvatarFallback>{stream.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-neon-green transition-colors">
                {stream.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{stream.displayName}</p>
              <p className="text-xs text-muted-foreground">{stream.category}</p>
            </div>
          </div>
          {stream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stream.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
