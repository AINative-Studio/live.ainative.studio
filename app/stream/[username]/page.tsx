'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamPlayer } from '@/components/stream-player';
import { ChatPanel } from '@/components/chat-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Share2, UserPlus, Twitter, Github, Globe } from 'lucide-react';
import { usersService } from '@/services/users';
import { useAuth } from '@/contexts/auth-context';
import { useStreamChat } from '@/hooks/use-stream-chat';
import type { User, Stream } from '@/types';
import streamsData from '@/data/streams.json';
import usersData from '@/data/users.json';

// Mock data fallback
const streams = streamsData as any;
const users = usersData as any;

export default function StreamPage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat hook only if stream is live
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
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

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

  // User not found
  if (!userProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground">This user does not exist.</p>
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
              <AvatarFallback>{userProfile.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold mb-2">{userProfile.displayName} is Offline</h1>
            <p className="text-muted-foreground mb-6">This channel is not currently streaming.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/user/${username}`}>
                <Button variant="outline">View Profile</Button>
              </Link>
              <Button className="bg-brand-primary hover:bg-primary-dark">
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
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
                          <Button size="sm" className="font-mono">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{userProfile.followerCount.toLocaleString()} followers</span>
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
                      {stream.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="font-mono">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
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
            </div>

            <div className="lg:sticky lg:top-20 h-[calc(100vh-7rem)]">
              <ChatPanel
                messages={chat.messages}
                onSendMessage={chat.sendMessage}
                isConnected={chat.isConnected}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLoadMore={chat.loadHistory}
                isLoadingMore={chat.isLoadingHistory}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
