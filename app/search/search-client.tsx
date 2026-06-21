'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamCard } from '@/components/stream-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, Users, PlayCircle, Sparkles } from 'lucide-react';
import { streamsService } from '@/services/streams';
import { vodService } from '@/services/vod';
import { semanticSearchService } from '@/services/semantic-search';
import type { SemanticSearchResult } from '@/services/semantic-search';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Stream, Category, VODRecording } from '@/types';
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
  const [vods, setVods] = useState<VODRecording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [semanticEnabled, setSemanticEnabled] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [semanticInterpretation, setSemanticInterpretation] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live Now' },
    { id: 'categories', label: 'Categories' },
    { id: 'coders', label: 'Developers' },
    { id: 'vods', label: 'VODs' },
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
        setVods([]);
        setSemanticResults([]);
        setSemanticInterpretation(null);
        return;
      }

      setIsLoading(true);

      try {
        if (semanticEnabled) {
          // Semantic search mode — use AI-powered search with text search fallback
          const [semanticResponse, streamResult, vodResult] = await Promise.all([
            semanticSearchService.searchStreams(debouncedQuery).catch(() => ({
              results: [],
              interpretation: null,
              fallback: true,
            })),
            streamsService.search({
              query: debouncedQuery,
              status: activeFilters.includes('live') ? 'live' : 'all',
            }),
            (activeFilters.includes('all') || activeFilters.includes('vods'))
              ? vodService.search(debouncedQuery).catch(() => ({ items: [], total: 0 }))
              : Promise.resolve({ items: [], total: 0 }),
          ]);

          setSemanticResults(semanticResponse.results || []);
          setSemanticInterpretation(semanticResponse.interpretation || null);
          setStreams(streamResult.streams);
          setUsers(extractUsersFromStreams(streamResult.streams));
          setVods((vodResult as any).items || []);
        } else {
          // Regular text search
          setSemanticResults([]);
          setSemanticInterpretation(null);

          // Determine status filter
          let statusFilter: 'live' | 'ended' | 'all' | undefined;
          if (activeFilters.includes('live')) {
            statusFilter = 'live';
          } else if (activeFilters.includes('all')) {
            statusFilter = 'all';
          }

          // Call APIs in parallel
          const [streamResult, vodResult] = await Promise.all([
            streamsService.search({
              query: debouncedQuery,
              status: statusFilter,
            }),
            (activeFilters.includes('all') || activeFilters.includes('vods'))
              ? vodService.search(debouncedQuery).catch(() => ({ items: [], total: 0 }))
              : Promise.resolve({ items: [], total: 0 }),
          ]);

          setStreams(streamResult.streams);
          setUsers(extractUsersFromStreams(streamResult.streams));
          setVods((vodResult as any).items || []);
        }
      } catch (error) {
        console.error('Search failed, using fallback data:', error);
        setSemanticResults([]);
        setSemanticInterpretation(null);
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
  }, [debouncedQuery, activeFilters, semanticEnabled]);

  const searchQuery = debouncedQuery.toLowerCase();
  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery)
  );

  const showCategories =
    (activeFilters.includes('all') || activeFilters.includes('categories')) &&
    filteredCategories.length > 0;
  const showUsers =
    activeFilters.includes('all') || activeFilters.includes('coders');
  const showVods =
    (activeFilters.includes('all') || activeFilters.includes('vods')) &&
    vods.length > 0;

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
                placeholder={semanticEnabled ? 'Describe what you\'re looking for...' : 'Search streams, categories, or developers...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-44 h-12 text-lg focus-visible:ring-brand-primary"
              />
              <Button
                variant={semanticEnabled ? 'default' : 'outline'}
                size="sm"
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${
                  semanticEnabled
                    ? 'bg-brand-primary hover:bg-brand-primary/90'
                    : 'hover:border-brand-primary/50'
                }`}
                onClick={() => setSemanticEnabled(!semanticEnabled)}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Semantic Search
              </Button>
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
                {showVods && `, ${vods.length} VODs`}
                {showCategories && `, ${filteredCategories.length} categories`}
                {showUsers && users.length > 0 && `, ${users.length} developers`}
              </p>
            </div>
          )}

          {!isLoading && semanticEnabled && semanticInterpretation && (
            <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground bg-brand-primary/5 border border-brand-primary/20 rounded-md px-4 py-3">
              <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
              <span>{semanticInterpretation}</span>
            </div>
          )}

          {!isLoading && semanticEnabled && semanticResults.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                Semantic Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semanticResults.map((result) => (
                  <Card
                    key={result.streamId}
                    className="border-border hover:border-brand-primary/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0 border-brand-primary/30 text-brand-primary"
                        >
                          {Math.round(result.relevanceScore * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {result.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {result.matchReason}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

          {showVods && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">VODs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vods.map((vod: VODRecording) => (
                  <a key={vod.id} href={`/vod/${vod.id}`}>
                    <Card className="border-border hover:border-brand-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <PlayCircle className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{vod.title || 'Untitled VOD'}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {vod.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {vod.duration
                                ? `${Math.floor(vod.duration / 60)}m`
                                : 'Unknown duration'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
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
            vods.length === 0 &&
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
