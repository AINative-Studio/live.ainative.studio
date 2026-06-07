'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { Brain, Zap, Layout, Code, Cpu, Server, Link as LinkIcon, Gamepad2, Home, Search, LucideIcon } from 'lucide-react';
import { streamsService } from '@/services/streams';
import type { Category, Stream } from '@/types';
import streamsData from '@/data/streams.json';
import categoriesData from '@/data/categories.json';

// Fallback mock data
const mockStreams = streamsData as any;
const mockCategories = categoriesData as any;

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  zap: Zap,
  layout: Layout,
  code: Code,
  cpu: Cpu,
  server: Server,
  link: LinkIcon,
  'gamepad-2': Gamepad2,
};

// Extended type to support both mock and API data
interface CategoryDisplay extends Partial<Category> {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon?: string;
  iconUrl?: string | null;
  color?: string;
  viewerCount?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [category, setCategory] = useState<CategoryDisplay | null>(null);
  const [categoryStreams, setCategoryStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setNotFound(false);

      // Always resolve mock data first so we have a fallback ready
      const mockCategory = mockCategories.find((c: any) => c.slug === slug) ?? null;

      try {
        // Fetch category and streams from API
        const [categoryData, streamsResult] = await Promise.all([
          streamsService.getCategoryBySlug(slug),
          streamsService.getStreamsByCategory(slug),
        ]);

        setCategory(categoryData);
        setCategoryStreams(streamsResult);
      } catch (error) {
        console.warn('Failed to fetch category data from API, falling back to mock data:', error);

        if (mockCategory) {
          setCategory(mockCategory);

          // Filter mock streams by category slug
          const mockCategoryStreams = mockStreams.filter(
            (s: any) => s.categorySlug === slug || s.category?.slug === slug
          );
          setCategoryStreams(mockCategoryStreams);
        } else {
          // Slug is not in mock data either — synthesise a minimal category object
          // so the page renders an empty-streams state instead of a hard 404.
          // This covers categories the API knows about but the mock snapshot doesn't
          // (e.g. newly created categories).
          setCategory({
            id: slug,
            name: slug
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            slug,
            description: null,
          });
          setCategoryStreams([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // Redirect to 404 only when both API and mock data fail (notFound === true)
  useEffect(() => {
    if (!loading && notFound) {
      router.replace('/not-found');
    }
  }, [loading, notFound, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-muted rounded mb-4 mx-auto"></div>
              <div className="h-4 w-64 bg-muted rounded mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // notFound means both API and mock data failed — redirect is in flight
  if (notFound) {
    return null;
  }

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This category does not exist or has been removed.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <a href="/"><Home className="w-4 h-4 mr-2" />Go Home</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/search"><Search className="w-4 h-4 mr-2" />Search Streams</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Support both mock data (live) and API data (status)
  const liveStreams = categoryStreams.filter((s: any) =>
    s.live === true || s.status === 'live'
  );

  // Get icon from mock data or use default
  const Icon = category.icon ? iconMap[category.icon] || Code : Code;

  // Calculate total viewer count from live streams
  const viewerCount = liveStreams.reduce((total, stream: any) => {
    const viewers = stream.viewers || stream.viewerCount || 0;
    return total + viewers;
  }, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                <Icon className="w-12 h-12 text-brand-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{category.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-mono">
                    {liveStreams.length} live {liveStreams.length === 1 ? 'stream' : 'streams'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono">
                    {(viewerCount ?? 0).toLocaleString()} viewers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {liveStreams.length > 0 ? 'Live Channels' : 'No Live Streams'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select defaultValue="trending">
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
          </div>

          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStreams.map((stream: any) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No live streams right now</h3>
              <p className="text-muted-foreground mb-6">
                Check back later or explore other categories
              </p>
              <Button variant="outline" asChild>
                <a href="/">Browse All Categories</a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
