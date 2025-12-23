import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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
import { Brain, Zap, Layout, Code, Cpu, Server, Link as LinkIcon, Gamepad2, LucideIcon } from 'lucide-react';
import streamsData from '@/data/streams.json';
import categoriesData from '@/data/categories.json';
import type { Stream, Category } from '@/types';

const streams = streamsData as Stream[];
const categories = categoriesData as Category[];

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

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Streams | VibeCode Live`,
    description: category.description,
  };
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: PageProps) {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const categoryStreams = streams.filter((s) => s.categorySlug === params.slug);
  const liveStreams = categoryStreams.filter((s) => s.live);
  const Icon = iconMap[category.icon] || Code;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-lg bg-${category.color}/10 border border-${category.color}/20`}>
                <Icon className={`w-12 h-12 text-${category.color}`} />
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
                    {category.viewerCount.toLocaleString()} viewers
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
              {liveStreams.map((stream) => (
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
