import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Video, Calendar, Twitter, Github, Globe, Youtube } from 'lucide-react';
import usersData from '@/data/users.json';
import streamsData from '@/data/streams.json';
import type { User, Stream } from '@/types';

const users = usersData as User[];
const streams = streamsData as Stream[];

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = users.find((u) => u.username === params.username);

  if (!user) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.displayName} (@${user.username}) | AINative Studio Live`,
    description: user.bio,
  };
}

export async function generateStaticParams() {
  return users.map((user) => ({
    username: user.username,
  }));
}

export default function UserPage({ params }: PageProps) {
  const user = users.find((u) => u.username === params.username);

  if (!user) {
    notFound();
  }

  const userStream = streams.find((s) => s.username === params.username);
  const pastStreams = streams.filter(
    (s) => s.username === params.username && !s.live
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-border bg-gradient-to-b from-card/50 to-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Avatar className="w-32 h-32 border-4 border-brand-primary">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-4xl">{user.displayName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{user.displayName}</h1>
                    <p className="text-muted-foreground font-mono">@{user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="font-mono">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                    {user.isLive && userStream && (
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
                    <span className="font-bold text-xl">{user.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  {user.isLive && (
                    <Badge variant="destructive" className="font-mono">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                      LIVE
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule: {user.schedule}</span>
                </div>

                <div className="flex gap-2">
                  {user.socials.twitter && (
                    <a
                      href={`https://twitter.com/${user.socials.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-secondary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials.github && (
                    <a
                      href={`https://github.com/${user.socials.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials.youtube && (
                    <a
                      href={`https://youtube.com/@${user.socials.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-muted rounded flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                  {user.socials.website && (
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
                  <h3 className="text-xl font-bold mb-4">About {user.displayName}</h3>
                  <p className="text-muted-foreground leading-relaxed">{user.bio}</p>

                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-3">Streaming Schedule</h4>
                    <p className="text-muted-foreground">{user.schedule}</p>
                  </div>
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
                          src={stream.thumbnail}
                          alt={stream.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold line-clamp-2 mb-1">{stream.title}</h4>
                        <p className="text-sm text-muted-foreground">{stream.category}</p>
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
