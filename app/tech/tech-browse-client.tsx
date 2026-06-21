'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Code, Boxes } from 'lucide-react';
import { LANGUAGES, FRAMEWORKS, TechItem } from '@/lib/tech-stack';
import { streamsService } from '@/services/streams';

interface TechWithCount extends TechItem {
  streamCount: number;
}

function TechGrid({ items, label }: { items: TechWithCount[]; label: string }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        {label === 'Languages' ? (
          <Code className="w-6 h-6 text-brand-primary" />
        ) : (
          <Boxes className="w-6 h-6 text-secondary" />
        )}
        {label}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((tech) => (
          <Link
            key={tech.slug}
            href={`/tech/${tech.slug}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-brand-primary hover:bg-card/80 transition-all duration-200"
          >
            <span className="text-lg font-semibold group-hover:text-brand-primary transition-colors">
              {tech.name}
            </span>
            <Badge variant="secondary" className="text-xs font-mono">
              {tech.streamCount} {tech.streamCount === 1 ? 'stream' : 'streams'}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function TechBrowseClient() {
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTagCounts() {
      try {
        const tags = await streamsService.getPopularTags(100);
        const counts: Record<string, number> = {};
        if (Array.isArray(tags)) {
          tags.forEach((t: any) => {
            counts[t.name || t.slug] = t.usageCount || 0;
          });
        }
        setTagCounts(counts);
      } catch {
        // Tags API unavailable — counts stay at 0
      } finally {
        setLoading(false);
      }
    }
    fetchTagCounts();
  }, []);

  const languagesWithCounts: TechWithCount[] = LANGUAGES.map((lang) => ({
    ...lang,
    streamCount: tagCounts[lang.tag] || 0,
  }));

  const frameworksWithCounts: TechWithCount[] = FRAMEWORKS.map((fw) => ({
    ...fw,
    streamCount: tagCounts[fw.tag] || 0,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-2">Browse by Tech Stack</h1>
            <p className="text-lg text-muted-foreground">
              Find streams by the languages and frameworks you care about.
              No more digging through generic categories.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <TechGrid items={languagesWithCounts} label="Languages" />
              <TechGrid items={frameworksWithCounts} label="Frameworks" />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
