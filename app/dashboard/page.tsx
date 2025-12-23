'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video, Upload, Settings, Activity, Radio } from 'lucide-react';
import categoriesData from '@/data/categories.json';
import type { Category } from '@/types';

const categories = categoriesData as Category[];

function SimpleProgress({ value }: { value: number }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const [streamTitle, setStreamTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isLive, setIsLive] = useState(false);

  const handleGoLive = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Streamer Dashboard</h1>
            <p className="text-muted-foreground">Manage your stream settings and go live</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Stream Settings
                  </CardTitle>
                  <CardDescription>Configure your stream details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Stream Title</Label>
                    <Input
                      id="title"
                      placeholder="Building an AI Native IDE with Cursor & Claude"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="AI, Cursor, Claude, IDE (comma separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add tags to help viewers find your stream
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Stream Thumbnail</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-brand-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-lg font-medium"
                    variant={isLive ? 'destructive' : 'default'}
                    onClick={handleGoLive}
                  >
                    {isLive ? (
                      <>
                        <Radio className="w-5 h-5 mr-2 animate-pulse" />
                        End Stream
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-2" />
                        Go Live
                      </>
                    )}
                  </Button>

                  {isLive && (
                    <Badge variant="destructive" className="w-full justify-center py-2 font-medium">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                      YOU ARE LIVE
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Stream Health
                  </CardTitle>
                  <CardDescription>Monitor your stream performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Bitrate</Label>
                      <span className="text-sm font-mono text-brand-primary font-semibold">6000 kbps</span>
                    </div>
                    <SimpleProgress value={85} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Resolution</Label>
                      <span className="text-sm font-mono text-brand-primary font-semibold">1920x1080</span>
                    </div>
                    <SimpleProgress value={100} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Dropped Frames</Label>
                      <span className="text-sm font-mono text-yellow-500">0.2%</span>
                    </div>
                    <SimpleProgress value={5} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">CPU Usage</Label>
                      <span className="text-sm font-mono">45%</span>
                    </div>
                    <SimpleProgress value={45} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Stream Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isLive ? 'Stream Active' : 'No Active Stream'}
                      </p>
                    </div>
                  </div>
                  {isLive && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Viewers</span>
                        <span className="font-mono font-semibold">127</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stream Duration</span>
                        <span className="font-mono">1:23:45</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Peak Viewers</span>
                        <span className="font-mono">156</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border border-brand-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Use a clear, descriptive title</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Select the right category for visibility</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Add relevant tags to reach your audience</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Upload a custom thumbnail</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Interact with chat regularly</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
