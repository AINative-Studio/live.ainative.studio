'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamCard } from '@/components/stream-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import { streamsService } from '@/services/streams';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Stream, Category } from '@/types';
import streamsData from '@/data/streams.json';
import categoriesData from '@/data/categories.json';

function SearchPageFallback() {
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
                className="pl-12 h-12 text-lg"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Fallback mock data
const mockStreams = streamsData as any;
const mockCategories = categoriesData as any;

interface SearchUser {
  username: string;
  displayName: string;
  avatar: string | null;
  isLive: boolean;
}

/** Extract unique users from a list of streams */
function extractUsersFromStreams(streams: Stream[]): SearchUser[] {
  const seen = new Set<string>();
  const users: SearchUser[] = [];

  for (const stream of streams) {
    const user = stream.user || stream.streamer;
    const username = user?.username || (stream as any).username;
    if (!username || seen.has(username)) continue;
    seen.add(username);
    users.push({
      username,
      displayName: user?.displayName || (stream as any).displayName || username,
      avatar: user?.avatar || (stream as any).avatar || null,
      isLive: stream.status === 'live' || !!(stream as any).live,
    });
  }

  return users;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await streamsService.getCategories();
        setCategories(result);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(mockCategories);
      }
    };

    fetchCategories();
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setStreams([]);
        setUsers([]);
        return;
      }

      setIsLoading(true);

      try {
        // Determine status filter
        let statusFilter: 'live' | 'ended' | 'all' | undefined;
        if (activeFilters.includes('live')) {
          statusFilter = 'live';
        } else if (activeFilters.includes('all')) {
          statusFilter = 'all';
        }

        // Call API
        const result = await streamsService.search({
          query: debouncedQuery,
          status: statusFilter,
        });

        setStreams(result.streams);
        setUsers(extractUsersFromStreams(result.streams));
      } catch (error) {
        console.error('Search failed, using fallback data:', error);
        // Fallback to mock data filtering
        const searchQuery = debouncedQuery.toLowerCase();
        const filteredStreams = mockStreams.filter((stream: any) => {
          const matchesQuery =
            stream.title.toLowerCase().includes(searchQuery) ||
            stream.displayName.toLowerCase().includes(searchQuery) ||
            stream.category.toLowerCase().includes(searchQuery) ||
            stream.tags.some((tag: any) => tag.toLowerCase().includes(searchQuery));

          if (activeFilters.includes('all')) return matchesQuery;
          if (activeFilters.includes('live')) return matchesQuery && stream.live;
          return matchesQuery;
        });
        setStreams(filteredStreams);
        setUsers(extractUsersFromStreams(filteredStreams));
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeFilters]);

  const searchQuery = debouncedQuery.toLowerCase();
  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery)
  );

  const showCategories =
    (activeFilters.includes('all') || activeFilters.includes('categories')) &&
    filteredCategories.length > 0;
  const showUsers =
    activeFilters.includes('all') || activeFilters.includes('coders');

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

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <span className="ml-3 text-muted-foreground">Searching...</span>
            </div>
          )}

          {!isLoading && query && (
            <div className="mb-4">
              <p className="text-muted-foreground">
                Found {streams.length} streams
                {showCategories && `, ${filteredCategories.length} categories`}
                {showUsers && users.length > 0 && `, ${users.length} developers`}
              </p>
            </div>
          )}

          {!isLoading && streams.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Streams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {streams.map((stream: any) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </div>
          )}

          {showCategories && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredCategories.map((category: any) => (
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

          {showUsers && query && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">AI-Native Developers</h2>
              {users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {users.map((user) => (
                    <a
                      key={user.username}
                      href={`/user/${user.username}`}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-brand-primary/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.displayName} />
                        ) : null}
                        <AvatarFallback className="bg-brand-primary/20 text-brand-primary text-sm">
                          {(user.displayName || user.username).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      </div>
                      {user.isLive && (
                        <Badge className="bg-red-500 text-white text-xs shrink-0">LIVE</Badge>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-border rounded-lg bg-card/50">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No developers found for &ldquo;{query}&rdquo;</p>
                </div>
              )}
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

          {!isLoading &&
            query &&
            streams.length === 0 &&
            filteredCategories.length === 0 &&
            users.length === 0 && (
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

export default function SearchClient() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchContent />
    </Suspense>
  );
}
