'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamPlayer } from '@/components/stream-player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Share2, UserPlus, UserMinus, Twitter, Github, Globe, Loader2, Scissors, ExternalLink, Code2, DollarSign } from 'lucide-react';
import { LanguageBadge, extractLanguages, extractGithubRepo } from '@/components/language-badge';
import { CreateClipDialog } from '@/components/create-clip-dialog';
import { AiSummaryCard } from '@/components/ai-summary-card';
import { TipDialog } from '@/components/tip-dialog';
import { usersService } from '@/services/users';
import { recommendationsService } from '@/services/recommendations';
import type { StreamRecommendation } from '@/services/recommendations';
import { useAuth } from '@/contexts/auth-context';
import { useStreamChat } from '@/hooks/use-stream-chat';
import type { User, Stream } from '@/types';
import streamsData from '@/data/streams.json';
import usersData from '@/data/users.json';

const ChatPanel = dynamic(() => import('@/components/chat-panel').then(mod => ({ default: mod.ChatPanel })), {
  ssr: false,
  loading: () => <div className="h-full bg-card animate-pulse rounded-lg" />
});

// Mock data fallback
const streams = streamsData as any;
const users = usersData as any;

export default function StreamPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isClipDialogOpen, setIsClipDialogOpen] = useState(false);
  const [isTipDialogOpen, setIsTipDialogOpen] = useState(false);
  const [relatedStreams, setRelatedStreams] = useState<StreamRecommendation[]>([]);

  // Initialize chat hook only if stream exists (prevents empty streamId issue #64)
  const chat = useStreamChat({
    streamId: stream?.id || '',
    initialMessages: [],
  });

  // Fetch user profile and check if live
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user profile
        const profile = await usersService.getProfile(username);
        setUserProfile(profile);

        // Check if user is live
        const liveStatus = await usersService.isLive(username);
        setIsLive(liveStatus.isLive);

        if (liveStatus.isLive && liveStatus.stream) {
          setStream(liveStatus.stream);
        }

        // Check if following (only if authenticated)
        if (isAuthenticated) {
          try {
            const followStatus = await usersService.isFollowing(username);
            setIsFollowing(followStatus.isFollowing);
          } catch (followErr) {
            console.error('Error checking follow status:', followErr);
            setIsFollowing(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch stream data:', err);
        setError('Failed to load stream data');

        // Fall back to mock data
        const mockStream = streams.find((s: any) => s.username === username);
        const mockUser = users.find((u: any) => u.username === username);

        if (mockStream && mockUser) {
          setUserProfile(mockUser);
          setStream(mockStream);
          setIsLive(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, isAuthenticated]);

  // Fetch related streams when stream data is available
  useEffect(() => {
    if (!stream?.id || !stream?.tags?.length) return;

    const tags = stream.tags.map((t: any) => (typeof t === 'string' ? t : t.name));
    recommendationsService
      .getRelatedStreams(stream.id, tags)
      .then((data) => setRelatedStreams(data.suggestions.slice(0, 4)))
      .catch(() => setRelatedStreams([]));
  }, [stream?.id, stream?.tags]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!userProfile) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await usersService.unfollow(username);
        setIsFollowing(false);
        setUserProfile((prev) => prev ? { ...prev, followerCount: prev.followerCount - 1 } : null);
      } else {
        await usersService.follow(username);
        setIsFollowing(true);
        setUserProfile((prev) => prev ? { ...prev, followerCount: prev.followerCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stream...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User not found or no profile — show offline state using username from URL
  if (notFound || !userProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-border">
              <AvatarFallback>{username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mb-2">@{username} is not currently streaming</h1>
            <p className="text-muted-foreground mb-6">This channel is offline. Check back later.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/user/${username}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Link href="/">
                <Button className="bg-brand-primary hover:bg-primary-dark">Browse Streams</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User is not live
  if (!isLive || !stream) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-border">
              <AvatarImage src={userProfile.avatar || ''} alt={userProfile.displayName || ''} />
              <AvatarFallback>{userProfile.displayName?.[0] || username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mb-2">@{userProfile.displayName || username} is not currently streaming</h1>
            <p className="text-muted-foreground mb-6">This channel is offline. Check back later.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/user/${username}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Button
                className="font-mono"
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-4">
              <StreamPlayer
                title={stream.title}
                viewers={chat.viewerCount || stream.viewerCount || 0}
                username={userProfile.username || username}
                thumbnail={stream.thumbnailUrl || ''}
                streamId={stream.id}
                cloudflareVideoId={stream.cloudflareVideoId ?? undefined}
              />

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-brand-primary">
                      <AvatarImage src={userProfile.avatar || ''} alt={userProfile.displayName || ''} />
                      <AvatarFallback>{userProfile.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-2xl font-bold mb-1">{stream.title}</h1>
                          <Link
                            href={`/user/${userProfile.username}`}
                            className="text-lg text-muted-foreground hover:text-brand-primary transition-colors"
                          >
                            {userProfile.displayName}
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="font-mono"
                            variant={isFollowing ? "outline" : "default"}
                            onClick={handleFollowToggle}
                            disabled={isFollowLoading}
                          >
                            {isFollowLoading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : isFollowing ? (
                              <UserMinus className="w-4 h-4 mr-2" />
                            ) : (
                              <UserPlus className="w-4 h-4 mr-2" />
                            )}
                            {isFollowing ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{(userProfile.followerCount ?? 0).toLocaleString()} followers</span>
                        {stream.category && (
                          <>
                            <span>•</span>
                            <Link
                              href={`/category/${stream.category.slug}`}
                              className="hover:text-brand-primary transition-colors"
                            >
                              {stream.category.name}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {userProfile.bio && (
                    <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                  )}

                  {stream.tags && stream.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stream.tags
                        .filter((tag) => !tag.name.startsWith('repo:') && !tag.name.startsWith('lang:'))
                        .map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="font-mono">
                          {tag.name}
                        </Badge>
                      ))}
                      {extractLanguages(stream.tags).map((lang) => (
                        <LanguageBadge key={lang} language={lang} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.share({
                            title: stream.title,
                            text: `Watch ${userProfile.displayName || username} live on AINative Studio`,
                            url: window.location.href,
                          });
                        } catch {
                          await navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsClipDialogOpen(true)}
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      Clip
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsTipDialogOpen(true)}
                      className="text-accent hover:text-accent"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Tip
                    </Button>
                    {userProfile.socials && (
                      <div className="flex gap-2 ml-auto">
                        {userProfile.socials.twitter && (
                          <a
                            href={`https://twitter.com/${userProfile.socials.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-secondary hover:text-primary-foreground transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.socials.github && (
                          <a
                            href={`https://github.com/${userProfile.socials.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {userProfile.socials.website && (
                          <a
                            href={userProfile.socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-brand-primary hover:text-primary-foreground transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Code Context Card */}
              {stream.tags && stream.tags.length > 0 && (extractGithubRepo(stream.tags) || extractLanguages(stream.tags).length > 0) && (() => {
                const repoSlug = extractGithubRepo(stream.tags);
                const languages = extractLanguages(stream.tags);
                return (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 className="w-4 h-4 text-brand-primary" />
                        <h3 className="font-semibold text-sm">Code Context</h3>
                      </div>

                      {repoSlug && (
                        <div className="flex items-center gap-3 mb-3">
                          <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <a
                              href={`https://github.com/${repoSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-mono text-brand-primary hover:underline truncate block"
                            >
                              {repoSlug}
                            </a>
                          </div>
                        </div>
                      )}

                      {languages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {languages.map((lang) => (
                            <LanguageBadge
                              key={lang}
                              language={lang}
                              className="bg-muted px-2 py-1 rounded-md"
                            />
                          ))}
                        </div>
                      )}

                      {repoSlug && (
                        <a
                          href={`https://github.com/${repoSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Github className="w-4 h-4 mr-2" />
                            View on GitHub
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* AI Summary */}
              <AiSummaryCard
                streamId={stream.id}
                streamTitle={stream.title}
                streamLanguage={stream.tags?.map((t: any) => typeof t === 'string' ? t : t.name).join(', ')}
                streamDescription={stream.description || undefined}
              />

              {/* Related Streams */}
              {relatedStreams.length > 0 && (
                <Card className="border-border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-3">You Might Also Like</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedStreams.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-lg border border-border hover:border-brand-primary/50 transition-colors"
                        >
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {rec.description}
                          </p>
                          {rec.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {rec.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {typeof tag === 'string' ? tag : (tag as any).name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:sticky lg:top-20 h-[calc(100vh-7rem)]">
              <ChatPanel
                messages={chat.messages}
                onSendMessage={chat.sendMessage}
                isConnected={chat.isConnected}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                streamId={stream.id}
                streamTitle={stream.title}
                streamLanguage={stream.tags?.map((t: any) => typeof t === 'string' ? t : t.name).join(', ')}
                streamDescription={stream.description || undefined}
                onLoadMore={chat.loadHistory}
                isLoadingMore={chat.isLoadingHistory}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CreateClipDialog
        open={isClipDialogOpen}
        onOpenChange={setIsClipDialogOpen}
        streamId={stream.id}
        streamTitle={stream.title}
        isLive={true}
      />

      <TipDialog
        open={isTipDialogOpen}
        onOpenChange={setIsTipDialogOpen}
        streamerName={userProfile.displayName || username}
        streamerUsername={userProfile.username || username}
      />
    </div>
  );
}
