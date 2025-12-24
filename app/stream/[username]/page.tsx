import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StreamPlayer } from '@/components/stream-player';
import { ChatPanel } from '@/components/chat-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Share2, UserPlus, Twitter, Github, Globe } from 'lucide-react';
import streamsData from '@/data/streams.json';
import usersData from '@/data/users.json';

// TODO: Remove type assertions when API integration is complete
const streams = streamsData as any;
const users = usersData as any;

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stream = streams.find((s: any) => s.username === params.username);
  const user = users.find((u: any) => u.username === params.username);

  if (!stream || !user) {
    return {
      title: 'Stream Not Found',
    };
  }

  return {
    title: `${stream.title} - ${user.displayName} | AINative Studio Live`,
    description: `Watch ${user.displayName} live on AINative Studio Live: ${stream.title}. Experience AI-native development workflows in real-time.`,
    openGraph: {
      title: `${stream.title} - ${user.displayName}`,
      description: `Watch ${user.displayName} live on AINative Studio Live: ${stream.title}`,
      type: 'video.other',
      images: [{ url: stream.thumbnail }],
    },
  };
}

export async function generateStaticParams() {
  return streams.map((stream: any) => ({
    username: stream.username,
  }));
}

export default function StreamPage({ params }: PageProps) {
  const stream = streams.find((s: any) => s.username === params.username);
  const user = users.find((u: any) => u.username === params.username);

  if (!stream || !user) {
    notFound();
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
                viewers={stream.viewers}
                username={stream.username}
                thumbnail={stream.thumbnail}
              />

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-brand-primary">
                      <AvatarImage src={user.avatar} alt={user.displayName} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-2xl font-bold mb-1">{stream.title}</h1>
                          <Link
                            href={`/user/${user.username}`}
                            className="text-lg text-muted-foreground hover:text-brand-primary transition-colors"
                          >
                            {user.displayName}
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
                        <span>{user.followers.toLocaleString()} followers</span>
                        <span>•</span>
                        <Link
                          href={`/category/${stream.categorySlug}`}
                          className="hover:text-brand-primary transition-colors"
                        >
                          {stream.category}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{user.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {stream.tags.map((tag: any) => (
                      <Badge key={tag} variant="secondary" className="font-mono">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <div className="flex gap-2 ml-auto">
                      {user.socials?.twitter && (
                        <a
                          href={`https://twitter.com/${user.socials.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-secondary hover:text-primary-foreground transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {user.socials?.github && (
                        <a
                          href={`https://github.com/${user.socials.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {user.socials?.website && (
                        <a
                          href={user.socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-muted rounded flex items-center justify-center hover:bg-brand-primary hover:text-primary-foreground transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:sticky lg:top-20 h-[calc(100vh-7rem)]">
              <ChatPanel
                messages={[]}
                onSendMessage={() => {}}
                isConnected={false}
                isAuthenticated={false}
                currentUser={null}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
