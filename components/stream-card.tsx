import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye } from 'lucide-react';
import { LanguageBadge, extractLanguages } from '@/components/language-badge';
import { isTechTag, techTagDisplayName, techTagType } from '@/lib/tech-stack';
import type { Stream } from '@/types';

interface StreamCardProps {
  stream: Stream;
  priority?: boolean;
}

export function StreamCard({ stream, priority = false }: StreamCardProps) {
  // Support API data (stream.streamer or stream.user) and legacy mock data (stream.username)
  const streamer = stream.streamer || stream.user;
  const username = streamer?.username || stream.username || 'unknown';
  const displayName = streamer?.displayName || stream.displayName || username;
  const avatar = (streamer as any)?.avatarUrl || streamer?.avatar || stream.user?.avatar || stream.avatar;
  const thumbnail = stream.thumbnailUrl || stream.thumbnail || '/placeholder-stream.jpg';
  const isLive = stream.status === 'live' || stream.live === true;
  const viewerCount = stream.viewerCount || stream.viewers || 0;
  const categoryName = stream.category?.name || (typeof stream.category === 'string' ? stream.category : '') || '';
  const tags = stream.tags || [];

  return (
    <Link href={`/stream/${username}`}>
      <Card className="group overflow-hidden border-border hover:border-brand-primary transition-all duration-300 cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnail}
            alt={stream.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <Badge variant="destructive" className="bg-success text-white font-medium text-xs">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1.5" />
                LIVE
              </Badge>
              <Badge variant="secondary" className="bg-black/80 text-white font-mono text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {(viewerCount ?? 0).toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/50">
              <AvatarImage src={avatar || undefined} alt={displayName} />
              <AvatarFallback>{displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {stream.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{displayName}</p>
              <p className="text-xs text-muted-foreground">{categoryName}</p>
            </div>
          </div>
          {tags.length > 0 && (() => {
            const languages = extractLanguages(tags);
            // Extract framework tags (fw:*)
            const frameworks = tags
              .map((tag: any) => {
                const name = typeof tag === 'string' ? tag : tag.name;
                return name.startsWith('fw:') ? name : null;
              })
              .filter((t): t is string => t !== null);
            const visibleTags = tags.filter((tag: any) => {
              const name = tag.name || tag;
              return !name.startsWith('lang:') && !name.startsWith('fw:') && !name.startsWith('repo:');
            });
            return (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {languages.map((lang: string) => (
                  <LanguageBadge key={lang} language={lang} size="sm" className="bg-muted px-1.5 py-0 rounded" />
                ))}
                {frameworks.slice(0, 2).map((fwTag: string) => (
                  <Badge key={fwTag} variant="outline" className="text-[10px] px-1.5 py-0 border-secondary/40 text-secondary">
                    {techTagDisplayName(fwTag) || fwTag.slice(3)}
                  </Badge>
                ))}
                {visibleTags.slice(0, 3 - frameworks.length).map((tag: any, index: number) => (
                  <Badge key={tag.id || tag || index} variant="outline" className="text-[10px] px-1.5 py-0">
                    {tag.name || tag}
                  </Badge>
                ))}
              </div>
            );
          })()}
        </div>
      </Card>
    </Link>
  );
}
