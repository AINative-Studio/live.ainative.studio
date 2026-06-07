'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserMinus, Video, Twitter, Github, Globe, Youtube, Loader2 } from 'lucide-react';
import { usersService } from '@/services/users';
import { useAuth } from '@/contexts/auth-context';
import type { User, Stream } from '@/types';
import usersData from '@/data/users.json';
import streamsData from '@/data/streams.json';

// Fallback mock data
const users = usersData as any;
const streams = streamsData as any;

export default function UserPage() {
  const params = useParams();
  const username = params.username as string;
  const { isAuthenticated } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [userStreams, setUserStreams] = useState<Stream[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      setNotFound(false);

      try {
        // Fetch user profile
        const profileData = await usersService.getProfile(username);
        setUser(profileData);

        // Fetch user's streams
        const streamsData = await usersService.getStreams(username);
        setUserStreams(streamsData);

        // Check if following (only if authenticated)
        if (isAuthenticated) {
          try {
            const followStatus = await usersService.isFollowing(username);
            setIsFollowing(followStatus.isFollowing);
          } catch (error) {
            console.error('Error checking follow status:', error);
            setIsFollowing(false);
          }
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);

        // Always try to fallback to mock data first
        console.log('Falling back to mock data');
        const mockUser = users.find((u: any) => u.username === username);

        if (mockUser) {
          // Transform mock data to match User type
          setUser({
            id: mockUser.username,
            email: `${mockUser.username}@example.com`,
            username: mockUser.username,
            displayName: mockUser.displayName || null,
            avatar: mockUser.avatar || null,
            bio: mockUser.bio || null,
            role: 'USER',
            followerCount: mockUser.followers || 0,
            followingCount: 0,
            isLive: mockUser.isLive || false,
            socials: mockUser.socials,
            createdAt: new Date().toISOString(),
          });

          // Get mock streams
          const mockStreams = streams.filter(
            (s: any) => s.user?.username === username || s.username === username
          );
          setUserStreams(mockStreams);
        } else {
          // Only set notFound if user doesn't exist in mock data either
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [username, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login or show a message
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await usersService.unfollow(username);
        setIsFollowing(false);
        // Update follower count
        setUser((prev) => prev ? { ...prev, followerCount: prev.followerCount - 1 } : null);
      } else {
        await usersService.follow(username);
        setIsFollowing(true);
        // Update follower count
        setUser((prev) => prev ? { ...prev, followerCount: prev.followerCount + 1 } : null);
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
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
            <p className="text-muted-foreground">Loading user profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // User not found — show a basic profile page using the username from URL
  if (notFound || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="border-b border-border bg-gradient-to-b from-card/50 to-background">
            <div className="container mx-auto px-4 py-12">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <Avatar className="w-32 h-32 border-4 border-border">
                  <AvatarFallback className="text-4xl">{username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">{username}</h1>
                      <p className="text-muted-foreground font-mono">@{username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button className="font-mono" asChild>
                        <Link href="/login">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl">0</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <Tabs defaultValue="past" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="past">Past Streams</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6">
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">About {username}</h3>
                    <p className="text-muted-foreground leading-relaxed">No bio yet.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="past" className="mt-6">
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No streams yet</h3>
                    <p className="text-muted-foreground">Check back later for recorded streams</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get live stream and past streams
  const liveStream = userStreams.find((s) => s.status === 'live');
  const pastStreams = userStreams.filter((s) => s.status === 'ended');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Avatar className="w-32 h-32 border-4 border-brand-primary">
                <AvatarImage src={user.avatar || undefined} alt={user.displayName || user.username || 'User'} />
                <AvatarFallback className="text-4xl">{(user.displayName || user.username || 'U')[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{user.displayName || user.username}</h1>
                    <p className="text-muted-foreground font-mono">@{user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    {isAuthenticated && (
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
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <Button className="font-mono" asChild>
                        <Link href="/login">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </Link>
                      </Button>
                    )}
                    {user.isLive && liveStream && (
                      <Button variant="default" className="bg-red-600 hover:bg-red-700" asChild>
                        <Link href={`/stream/${user.username}`}>
                          <Video className="w-4 h-4 mr-2" />
                          Watch Live
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-lg mb-4">{user.bio}</p>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">{(user.followerCount ?? 0).toLocaleString()}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  {user.isLive && (
                    <Badge variant="destructive" className="font-mono">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                      LIVE
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {user.socials?.twitter && (
                    <a
                      href={`https://twitter.com/${user.socials.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-secondary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials?.github && (
                    <a
                      href={`https://github.com/${user.socials.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials?.youtube && (
                    <a
                      href={`https://youtube.com/@${user.socials.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials?.website && (
                    <a
                      href={user.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-brand-primary hover:text-primary-foreground transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="past">Past Streams</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">About {user.displayName || user.username}</h3>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pastStreams.map((stream) => (
                    <Card key={stream.id} className="overflow-hidden border-border">
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={stream.thumbnailUrl || '/placeholder-stream.jpg'}
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold line-clamp-2 mb-1">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">{stream.category?.name || 'Uncategorized'}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border">
                  <CardContent className="p-12 text-center">
                    <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No past streams</h3>
                    <p className="text-muted-foreground">
                      Check back later for recorded streams
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
