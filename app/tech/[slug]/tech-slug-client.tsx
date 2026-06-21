'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamCard } from '@/components/stream-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Code, Boxes, Home, Search } from 'lucide-react';
import { findTechBySlug, techTagType } from '@/lib/tech-stack';
import { streamsService } from '@/services/streams';
import type { Stream } from '@/types';

export default function TechSlugClient() {
  const params = useParams();
  const slug = params.slug as string;
  const tech = findTechBySlug(slug);

  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('viewers');

  useEffect(() => {
    async function fetchStreams() {
      setLoading(true);
      try {
        // Try to search streams with the tech tag
        const result = await streamsService.search({
          query: tech?.tag || slug,
          status: 'live',
        });
        setStreams(result.streams || []);
      } catch {
        // API unavailable — show empty state
        setStreams([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStreams();
  }, [slug, tech]);

  if (!tech) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Technology Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We don&apos;t have a listing for this technology yet.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/tech"><Home className="w-4 h-4 mr-2" />Browse Tech</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/search"><Search className="w-4 h-4 mr-2" />Search Streams</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const type = techTagType(tech.tag);
  const Icon = type === 'framework' ? Boxes : Code;

  const sortedStreams = [...streams].sort((a: any, b: any) => {
    if (sortBy === 'viewers') {
      return (b.viewerCount || b.viewers || 0) - (a.viewerCount || a.viewers || 0);
    }
    if (sortBy === 'recent') {
      return new Date(b.startedAt || b.createdAt || 0).getTime() -
        new Date(a.startedAt || a.createdAt || 0).getTime();
    }
    return (b.viewerCount || b.viewers || 0) - (a.viewerCount || a.viewers || 0);
  });

  const totalViewers = sortedStreams.reduce((total, s: any) => {
    return total + (s.viewerCount || s.viewers || 0);
  }, 0);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://live.ainative.studio/' },
      { '@type': 'ListItem', position: 2, name: 'Tech Stack', item: 'https://live.ainative.studio/tech' },
      { '@type': 'ListItem', position: 3, name: tech.name },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-lg ${type === 'framework' ? 'bg-secondary/10 border border-secondary/20' : 'bg-brand-primary/10 border border-brand-primary/20'}`}>
                <Icon className={`w-12 h-12 ${type === 'framework' ? 'text-secondary' : 'text-brand-primary'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{tech.name}</h1>
                  <span className="text-sm text-muted-foreground font-mono px-2 py-0.5 bg-muted rounded">
                    {type === 'framework' ? 'Framework' : 'Language'}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  Live streams using {tech.name}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono">
                    {sortedStreams.length} live {sortedStreams.length === 1 ? 'stream' : 'streams'}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono">
                    {totalViewers.toLocaleString()} viewers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {sortedStreams.length > 0 ? 'Live Channels' : 'No Live Streams'}
                </h2>
                {sortedStreams.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="viewers">Most Viewed</SelectItem>
                        <SelectItem value="recent">Recently Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {sortedStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedStreams.map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No live {tech.name} streams right now</h3>
                  <p className="text-muted-foreground mb-6">
                    Check back later or explore other technologies
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/tech">Browse All Tech</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
