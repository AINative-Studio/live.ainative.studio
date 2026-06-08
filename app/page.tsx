'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { TerminalHeader } from '@/components/terminal-header';
import { StreamCard } from '@/components/stream-card';
import { CategoryCard } from '@/components/category-card';
import { Skeleton } from '@/components/ui/skeleton';
import { StreamCardSkeleton, CategoryCardSkeleton } from '@/components/skeletons';
import { ArrowRight, TrendingUp, Radio, LayoutGrid } from 'lucide-react';
import { streamsService } from '@/services/streams';
import type { Stream, Category } from '@/types';
import streamsData from '@/data/streams.json';
import categoriesData from '@/data/categories.json';

export default function Home() {
  const [trendingStreams, setTrendingStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingStreams, setIsLoadingStreams] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingStreams() {
      try {
        setIsLoadingStreams(true);
        const response = await streamsService.getTrending(12);
        let streams = response.streams || [];

        // If no trending streams, fetch all currently live streams as fallback
        if (streams.length === 0) {
          try {
            const liveResponse = await streamsService.getLive(12);
            streams = liveResponse.streams || [];
          } catch { /* ignore */ }
        }

        setTrendingStreams(streams);
        setError(null);
      } catch (err) {
        // Silent fallback
        setTrendingStreams([]);
      } finally {
        setIsLoadingStreams(false);
      }
    }

    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        // Try popular categories first, fall back to full list if empty
        let cats = await streamsService.getPopularCategories(8);
        if (!cats || cats.length === 0) {
          const allCats = await streamsService.getCategories();
          cats = Array.isArray(allCats) ? allCats.slice(0, 8) : [];
        }
        if (cats.length > 0) {
          setCategories(cats);
        } else {
          setCategories(categoriesData as any);
        }
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch categories from API, falling back to mock data:', err);
        setCategories(categoriesData as any);
      } finally {
        setIsLoadingCategories(false);
      }
    }

    fetchTrendingStreams();
    fetchCategories();
  }, []);

  const featuredStreams = trendingStreams.slice(0, 3);
  const liveStreams = trendingStreams;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-4 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto text-center">
            <div className="mb-6 inline-block">
              <TerminalHeader text="> AINative Live" typingSpeed={100} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Stream Your IDE. <span className="text-primary">Build in Public.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Watch the future of development unfold in real-time. AI-native developers streaming AI-native workflows,
              multi-agent systems, and cutting-edge IDE sessions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="font-mono" asChild>
                <Link href="/dashboard">
                  Start Streaming <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-mono" asChild>
                <Link href="/vibe-coding">What is AI-Native Development?</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                Featured Live Now
              </h2>
              <Button variant="ghost" className="font-mono" asChild>
                <Link href="/search">View All</Link>
              </Button>
            </div>
            {isLoadingStreams ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <StreamCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredStreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} priority />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-card/30">
                <Radio className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No streams live right now</h3>
                <p className="text-muted-foreground max-w-sm">
                  Check back soon — AI-native developers stream here daily.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 px-4 bg-card/50">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Browse Categories</h2>
              <p className="text-muted-foreground">Explore streams by development focus</p>
            </div>
            {isLoadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-card/30">
                <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Categories coming soon</h3>
                <p className="text-muted-foreground max-w-sm">
                  We are setting up stream categories. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Live Channels</h2>
                {isLoadingStreams ? (
                  <Skeleton className="h-5 w-48" />
                ) : liveStreams.length > 0 ? (
                  <p className="text-muted-foreground">
                    {liveStreams.length} AI-native developer{liveStreams.length === 1 ? '' : 's'} streaming now
                  </p>
                ) : null}
              </div>
            </div>
            {isLoadingStreams ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <StreamCardSkeleton key={i} />
                ))}
              </div>
            ) : liveStreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {liveStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border bg-card/30">
                <Radio className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live channels right now — check back soon!</h3>
                <p className="text-muted-foreground max-w-sm">
                  AI-native developers go live every day. Follow your favourite streamers so you never miss a session.
                </p>
                <Button variant="outline" className="mt-6 font-mono" asChild>
                  <Link href="/dashboard">Start Streaming</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-t from-background to-card">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Go Live?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the community of AI-native developers streaming their development sessions.
              Share your workflow, collaborate in real-time, and inspire others.
            </p>
            <Button size="lg" className="font-mono text-lg" asChild>
              <Link href="/dashboard">
                Start Streaming Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
