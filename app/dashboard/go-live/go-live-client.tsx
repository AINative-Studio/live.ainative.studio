'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { StreamSetupForm } from '@/components/stream-setup-form';
import { StreamMethodSelector, StreamMethod } from '@/components/stream-method-selector';
import { BrowserStreamPreview } from '@/components/browser-stream-preview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { streamsService } from '@/services/streams';
import { WHIPClient } from '@/lib/whip-client';
import type { Stream } from '@/types';
import { Copy, Eye, EyeOff, Radio, AlertCircle, CheckCircle, Loader2, ArrowLeft, Wifi, WifiOff } from 'lucide-react';

export default function GoLivePage() {
  return (
    <ProtectedRoute>
      <GoLiveContent />
    </ProtectedRoute>
  );
}

function GoLiveContent() {
  const router = useRouter();
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check for existing stream
  const [error, setError] = useState<string | null>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Browser streaming state
  const [streamMethod, setStreamMethod] = useState<StreamMethod | null>(null);
  const [showBrowserPreview, setShowBrowserPreview] = useState(false);
  const [browserStream, setBrowserStream] = useState<MediaStream | null>(null);
  const [isBrowserStreaming, setIsBrowserStreaming] = useState(false);
  const [whipClient, setWhipClient] = useState<WHIPClient | null>(null);
  const [whipStatus, setWhipStatus] = useState<string>('idle');

  const RTMP_INGEST_URL = 'rtmp://live.cloudflarestream.com/live';

  // Check for existing active stream on mount
  useEffect(() => {
    const checkActiveStream = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const activeStream = await streamsService.getActiveStream();
        if (activeStream) {
          setStream(activeStream);
        }
      } catch (err) {
        console.log('No active stream found or error checking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveStream();
  }, []);

  const handleCopy = async (text: string, type: 'url' | 'key') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNavigateToStream = () => {
    if (!stream) return;
    // Stream goes live automatically when RTMP connection is established
    // Just navigate to the stream page to view it
    const username = stream.user?.username || 'me';
    router.push(`/stream/${username}`);
  };

  const handleEndStream = async () => {
    if (!stream) return;

    try {
      setIsLoading(true);
      setError(null);
      await streamsService.end(stream.id);

      // Reset streaming state but keep the user in the flow —
      // they can create a new stream from the setup form.
      setStream(null);
      setStreamMethod(null);
      setShowBrowserPreview(false);
      await stopStreaming();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStream = async (data: { title: string; description?: string; categoryId?: string; tags?: string[] }) => {
    try {
      setIsLoading(true);
      setError(null);
      const newStream = await streamsService.create(data);
      setStream(newStream);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create stream';

      // If error is about existing active stream, end it automatically and retry
      if (errorMessage.includes('already have an active stream')) {
        try {
          const activeStream = await streamsService.getActiveStream();
          if (activeStream) {
            await streamsService.end(activeStream.id);
            // Small delay for the backend to process
            await new Promise(r => setTimeout(r, 500));
            // Retry creating the stream
            const newStream = await streamsService.create(data);
            setStream(newStream);
            return; // Success — skip the error display
          }
        } catch {
          // Auto-end failed — fall through to show the error with manual option
        }
      }

      setError(errorMessage);
      throw err; // Re-throw to let form handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStream = async (data: { title: string; description?: string; categoryId?: string; tags?: string[] }) => {
    if (!stream) return;

    try {
      const updatedStream = await streamsService.update(stream.id, data);
      setStream(updatedStream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stream');
      throw err; // Re-throw to let form handle the error state
    }
  };

  const handleStreamMethodSelect = (method: StreamMethod) => {
    setStreamMethod(method);
    if (method === 'browser') {
      setShowBrowserPreview(true);
    }
  };

  const handleBrowserStreamStart = async (mediaStream: MediaStream) => {
    if (!stream) return;

    let webrtcUrl = stream.ingest?.webrtcUrl;

    // If existing stream has no WHIP URL, end it and create a fresh one
    if (!webrtcUrl) {
      try {
        setError(null);
        // End the current stream first
        await streamsService.end(stream.id).catch(() => {});
        // Small delay for backend to process
        await new Promise(r => setTimeout(r, 500));
        const freshStream = await streamsService.create({ title: stream.title || 'Live Stream' });
        setStream(freshStream);
        webrtcUrl = freshStream.ingest?.webrtcUrl;
      } catch (err) {
        // If create fails (still has active stream), try ending harder and retry
        try {
          const active = await streamsService.getActiveStream();
          if (active) {
            await streamsService.end(active.id).catch(() => {});
            await new Promise(r => setTimeout(r, 500));
          }
          const retryStream = await streamsService.create({ title: stream.title || 'Live Stream' });
          setStream(retryStream);
          webrtcUrl = retryStream.ingest?.webrtcUrl;
        } catch {
          setError('Could not start browser streaming. Please end your current stream first and try again.');
          return;
        }
      }
    }

    if (!webrtcUrl) {
      setError('Browser streaming could not be provisioned. Try using RTMP software instead.');
      return;
    }

    try {
      setBrowserStream(mediaStream);
      setWhipStatus('connecting');
      setError(null);

      // Connect to Cloudflare via WHIP
      const client = new WHIPClient(webrtcUrl);
      client.onConnectionStateChange((state) => {
        setWhipStatus(state);
        if (state === 'failed' || state === 'disconnected') {
          setError('Stream connection lost. Please try again.');
          setIsBrowserStreaming(false);
        }
      });

      await client.publish(mediaStream);
      setWhipClient(client);
      setIsBrowserStreaming(true);
      setWhipStatus('connected');

      // Mark stream as live in the backend
      if (stream) {
        await streamsService.start(stream.id).catch(() => {});
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start browser stream';
      setError(msg);
      setWhipStatus('failed');
      setIsBrowserStreaming(false);
    }
  };

  const stopStreaming = async () => {
    if (whipClient) {
      await whipClient.disconnect();
      setWhipClient(null);
    }
    if (browserStream) {
      browserStream.getTracks().forEach(track => track.stop());
      setBrowserStream(null);
    }
    setIsBrowserStreaming(false);
    setWhipStatus('idle');
  };

  const handleStopBrowserPreview = async () => {
    await stopStreaming();
    setShowBrowserPreview(false);
    setStreamMethod(null);
  };

  const handleBackToMethodSelect = async () => {
    await stopStreaming();
    setStreamMethod(null);
    setShowBrowserPreview(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Go Live</h1>
            <p className="text-muted-foreground">Set up your stream and start broadcasting</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  {error.includes('already have an active stream') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          setError(null);
                          // Try to find and end whatever stream is blocking
                          const active = await streamsService.getActiveStream();
                          if (active) {
                            await streamsService.end(active.id);
                          }
                          setStream(null);
                          setStreamMethod(null);
                        } catch (err) {
                          setError('Failed to end stream. Please try again.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                      className="ml-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Ending...
                        </>
                      ) : (
                        'End Current Stream'
                      )}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="text-sm text-muted-foreground">Creating your stream...</p>
              </div>
            </div>
          ) : !stream ? (
            <div className="max-w-3xl mx-auto">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Create Your Stream</CardTitle>
                  <CardDescription>
                    Fill in your stream details to get started. You'll receive your streaming setup after creating the stream.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StreamSetupForm onSubmit={handleCreateStream} />
                </CardContent>
              </Card>
            </div>
          ) : streamMethod === null ? (
            <div className="max-w-5xl mx-auto">
              {stream.status === 'live' && (
                <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-200">
                        You have a stream marked as live. If you&apos;re not actively streaming, end it to avoid unnecessary costs.
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEndStream}
                        disabled={isLoading}
                        className="ml-4 border-amber-500/50 hover:bg-amber-500/20"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Ending...
                          </>
                        ) : (
                          'End Stream'
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              <StreamMethodSelector
                onSelect={handleStreamMethodSelect}
                selectedMethod={streamMethod || undefined}
              />
            </div>
          ) : streamMethod === 'browser' && showBrowserPreview ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBackToMethodSelect}
                  className="gap-2"
                  disabled={isBrowserStreaming}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Method Selection
                </Button>
                {isBrowserStreaming && (
                  <div className="flex items-center gap-3">
                    <Badge className="bg-success text-white animate-pulse gap-1.5">
                      <Wifi className="w-3 h-3" />
                      LIVE — Streaming to Cloudflare
                    </Badge>
                    <Button variant="destructive" size="sm" onClick={async () => {
                      await stopStreaming();
                      if (stream) {
                        await streamsService.end(stream.id).catch(() => {});
                      }
                      setStream(null);
                      setStreamMethod(null);
                      setShowBrowserPreview(false);
                    }}>
                      <WifiOff className="w-4 h-4 mr-2" />
                      End Stream
                    </Button>
                  </div>
                )}
                {whipStatus === 'connecting' && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting to Cloudflare...
                  </Badge>
                )}
              </div>
              <BrowserStreamPreview
                onStartStreaming={handleBrowserStreamStart}
                onStopPreview={handleStopBrowserPreview}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBackToMethodSelect}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Method Selection
                </Button>
                <Badge variant="secondary">RTMP Streaming</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Stream Configuration */}
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Stream Configuration</CardTitle>
                      <CardDescription>Update your stream details before going live</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StreamSetupForm
                        initialData={{
                          title: stream.title,
                          description: stream.description || '',
                          categoryId: stream.categoryId || '',
                          tags: stream.tags?.map(t => t.name) || [],
                        }}
                        onSubmit={handleUpdateStream}
                      />
                    </CardContent>
                  </Card>

                {/* RTMP Settings */}
                <Card className="border-border border-brand-primary/30">
                  <CardHeader>
                    <CardTitle>RTMP Settings</CardTitle>
                    <CardDescription>
                      Configure your streaming software (OBS, Streamlabs, etc.) with these credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* RTMP URL */}
                    <div className="space-y-2">
                      <Label htmlFor="rtmp-url">RTMP Ingest URL</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="rtmp-url"
                            value={RTMP_INGEST_URL}
                            readOnly
                            className="font-mono text-sm pr-10 bg-muted"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(RTMP_INGEST_URL, 'url')}
                          className="flex-shrink-0"
                        >
                          {copiedUrl ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Stream Key */}
                    <div className="space-y-2">
                      <Label htmlFor="stream-key">Stream Key</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            id="stream-key"
                            type={showStreamKey ? 'text' : 'password'}
                            value={stream.streamKey || 'No stream key available'}
                            readOnly
                            className="font-mono text-sm pr-20 bg-muted"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowStreamKey(!showStreamKey)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                            type="button"
                          >
                            {showStreamKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(stream.streamKey || '', 'key')}
                          disabled={!stream.streamKey}
                          className="flex-shrink-0"
                        >
                          {copiedKey ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep your stream key private. Never share it with anyone.
                      </p>
                    </div>

                    {/* Code block style display */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Quick Setup</p>
                      <div className="space-y-2 text-xs font-mono">
                        <div>
                          <span className="text-muted-foreground">Server:</span>{' '}
                          <span className="text-brand-primary">{RTMP_INGEST_URL}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stream Key:</span>{' '}
                          <span className="text-brand-primary">
                            {showStreamKey ? stream.streamKey : '••••••••••••••••'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stream Status */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Stream Status</CardTitle>
                    <CardDescription>
                      Your stream will go live automatically when you start broadcasting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stream.status === 'live' ? (
                      <div className="space-y-3">
                        <Badge variant="destructive" className="w-full justify-center py-2 font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                          LIVE
                        </Badge>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleNavigateToStream}
                        >
                          Go to Stream
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleEndStream}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Ending...
                            </>
                          ) : (
                            'End Stream'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-muted/50 border border-border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground text-center">
                            Stream is ready. Start streaming in your software and your stream will go live automatically.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleNavigateToStream}
                            disabled={!stream.streamKey}
                          >
                            View Stream Page
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleEndStream}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'End & Start Over'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">1.</span>
                      <p>Open your streaming software (OBS, Streamlabs, etc.)</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">2.</span>
                      <p>Copy the RTMP Ingest URL to the Server field</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">3.</span>
                      <p>Copy the Stream Key to the Stream Key field</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">4.</span>
                      <p>Configure your stream settings (title, category, tags)</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary font-medium">5.</span>
                      <p>Start streaming in your software - your stream will go live automatically!</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="border-border border-brand-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Test your stream before going live</p>
                    </div>
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
                      <p>Keep your stream key private and secure</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            </div>
          )}
        </div>
  );
}
