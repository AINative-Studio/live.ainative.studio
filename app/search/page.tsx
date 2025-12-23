'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamCard } from '@/components/stream-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import streamsData from '@/data/streams.json';
import categoriesData from '@/data/categories.json';
import usersData from '@/data/users.json';
import type { Stream, Category, User } from '@/types';

const streams = streamsData as Stream[];
const categories = categoriesData as Category[];
const users = usersData as User[];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live Now' },
    { id: 'categories', label: 'Categories' },
    { id: 'coders', label: 'Developers' },
  ];

  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setActiveFilters(['all']);
    } else {
      const newFilters = activeFilters.includes(filterId)
        ? activeFilters.filter((f) => f !== filterId)
        : [...activeFilters.filter((f) => f !== 'all'), filterId];
      setActiveFilters(newFilters.length === 0 ? ['all'] : newFilters);
    }
  };

  const searchQuery = query.toLowerCase();
  const filteredStreams = streams.filter((stream) => {
    const matchesQuery =
      stream.title.toLowerCase().includes(searchQuery) ||
      stream.displayName.toLowerCase().includes(searchQuery) ||
      stream.category.toLowerCase().includes(searchQuery) ||
      stream.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

    if (activeFilters.includes('all')) return matchesQuery;
    if (activeFilters.includes('live')) return matchesQuery && stream.live;
    return matchesQuery;
  });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery)
  );

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchQuery)
  );

  const showCategories =
    (activeFilters.includes('all') || activeFilters.includes('categories')) &&
    filteredCategories.length > 0;
  const showUsers =
    (activeFilters.includes('all') || activeFilters.includes('coders')) &&
    filteredUsers.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Search</h1>
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search streams, categories, or developers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 text-lg focus-visible:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeFilters.includes(filter.id) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  activeFilters.includes(filter.id)
                    ? 'bg-brand-primary hover:bg-brand-primary/90'
                    : 'hover:border-brand-primary/50'
                }`}
                onClick={() => toggleFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {query && (
            <div className="mb-4">
              <p className="text-muted-foreground">
                Found {filteredStreams.length} streams
                {showCategories && `, ${filteredCategories.length} categories`}
                {showUsers && `, ${filteredUsers.length} developers`}
              </p>
            </div>
          )}

          {filteredStreams.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStreams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </div>
          )}

          {showCategories && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    className="justify-start hover:border-brand-primary hover:text-brand-primary transition-colors"
                    asChild
                  >
                    <a href={`/category/${category.slug}`}>{category.name}</a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {showUsers && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">AI-Native Developers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredUsers.map((user) => (
                  <Button
                    key={user.username}
                    variant="outline"
                    className="justify-start hover:border-brand-primary hover:text-brand-primary transition-colors"
                    asChild
                  >
                    <a href={`/user/${user.username}`}>{user.displayName}</a>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start searching</h3>
              <p className="text-muted-foreground">
                Find streams, categories, and AI-native developers
              </p>
            </div>
          )}

          {query &&
            filteredStreams.length === 0 &&
            filteredCategories.length === 0 &&
            filteredUsers.length === 0 && (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
