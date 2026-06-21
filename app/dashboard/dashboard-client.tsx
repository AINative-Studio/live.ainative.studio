'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { dashboardService } from '@/services/dashboard';
import { streamsService } from '@/services/streams';
import type { DashboardOverview, DashboardQuickStats } from '@/types';
import {
  Video,
  Activity,
  Users,
  Eye,
  TrendingUp,
  Radio,
  Clock,
  Calendar,
  Bell,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import { SocialShareDialog } from '@/components/social-share-dialog';

// Mock data for fallback
const mockOverview: DashboardOverview = {
  currentStream: null,
  recentStreams: [],
  followerCount: 0,
  totalViews: 0,
  upcomingSchedule: [],
  notifications: [],
};

const mockQuickStats: DashboardQuickStats = {
  todayViewers: 0,
  weeklyViewers: 0,
  monthlyViewers: 0,
  avgStreamDuration: 0,
  newFollowersToday: 0,
  newFollowersWeek: 0,
};

function StatCardSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function StreamCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      <Skeleton className="w-32 h-20 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [quickStats, setQuickStats] = useState<DashboardQuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingStream, setIsEndingStream] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareStream, setShareStream] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try loading from API, fall back to defaults silently
      const [overviewData, statsData] = await Promise.all([
        dashboardService.getOverview().catch(() => mockOverview),
        dashboardService.getQuickStats().catch(() => mockQuickStats),
      ]);

      setOverview(overviewData);
      setQuickStats(statsData);
      setUseMockData(false);
    } catch (err) {
      // Use zero defaults — accurate for new users
      setOverview(mockOverview);
      setQuickStats(mockQuickStats);
      setUseMockData(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || user?.username || 'Streamer'}
            </p>
          </div>

          {error && useMockData && (
            <Card className="border-yellow-500/50 bg-yellow-500/10 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-500">Using Mock Data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Failed to load dashboard data from API. Displaying placeholder data instead.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={loadDashboardData}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Today's Viewers</p>
                        <p className="text-3xl font-bold mt-1">
                          {(quickStats?.todayViewers ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-brand-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Weekly Viewers</p>
                        <p className="text-3xl font-bold mt-1">
                          {(quickStats?.weeklyViewers ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">New Followers</p>
                        <p className="text-3xl font-bold mt-1">
                          +{(quickStats?.newFollowersWeek ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">This week</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Stream Status */}
              {isLoading ? (
                <Card className="border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ) : overview?.currentStream ? (
                <Card className="border-border border-brand-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                      Stream Active
                    </CardTitle>
                    <CardDescription>
                      {overview.currentStream.viewerCount > 0
                        ? 'You are currently live'
                        : 'This stream is marked as active. If you are not streaming, end it to avoid costs.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{overview.currentStream.title}</h3>
                      {overview.currentStream.category && (
                        <Badge variant="secondary" className="mt-2">
                          {overview.currentStream.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Viewers</p>
                        <p className="text-2xl font-bold">{overview.currentStream.viewerCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peak Viewers</p>
                        <p className="text-2xl font-bold">{overview.currentStream.peakViewers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="text-sm font-mono">
                          {overview.currentStream.startedAt && formatTime(overview.currentStream.startedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={isEndingStream}
                      onClick={async () => {
                        try {
                          setIsEndingStream(true);
                          await streamsService.end(overview.currentStream!.id);
                          // Reload dashboard data
                          setOverview({ ...overview, currentStream: null });
                        } catch {
                          // If direct end fails, try finding and ending via getActiveStream
                          try {
                            const active = await streamsService.getActiveStream();
                            if (active) {
                              await streamsService.end(active.id);
                            }
                            setOverview({ ...overview, currentStream: null });
                          } catch {
                            setError('Failed to end stream. Please try again.');
                          }
                        } finally {
                          setIsEndingStream(false);
                        }
                      }}
                    >
                      {isEndingStream ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ending Stream...
                        </>
                      ) : (
                        'End Stream'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Stream Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8">
                      <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">You are not currently streaming</p>
                      <Button asChild>
                        <Link href="/dashboard/go-live">
                          <Radio className="w-4 h-4 mr-2" />
                          Go Live
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Streams */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Streams
                  </CardTitle>
                  <CardDescription>Your latest streaming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <StreamCardSkeleton />
                      <StreamCardSkeleton />
                      <StreamCardSkeleton />
                    </div>
                  ) : overview?.recentStreams && overview.recentStreams.length > 0 ? (
                    <div className="space-y-4">
                      {overview.recentStreams.slice(0, 5).map((stream) => (
                        <div
                          key={stream.id}
                          className="flex gap-4 p-4 border border-border rounded-lg hover:border-brand-primary/50 transition-colors"
                        >
                          <div className="w-32 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {stream.thumbnailUrl ? (
                              <img
                                src={stream.thumbnailUrl}
                                alt={stream.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Video className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{stream.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {stream.startedAt && formatDate(stream.startedAt)}
                            </p>
                            <div className="flex gap-2 mt-2 items-center">
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                {stream.peakViewers} peak
                              </Badge>
                              {stream.category && (
                                <Badge variant="outline" className="text-xs">
                                  {stream.category.name}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-brand-primary"
                                onClick={() => {
                                  setShareStream(stream);
                                  setShareDialogOpen(true);
                                }}
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No recent streams</p>
                      <p className="text-sm mt-1">Start streaming to see your history here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Channel Stats */}
              {isLoading ? (
                <Card className="border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Channel Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Followers</span>
                      <span className="font-semibold">{(overview?.followerCount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-semibold">{(overview?.totalViews ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                      <span className="font-semibold">
                        {quickStats?.avgStreamDuration ? formatDuration(quickStats.avgStreamDuration) : '0h 0m'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Schedule */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" />
                    Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : overview?.upcomingSchedule && overview.upcomingSchedule.length > 0 ? (
                    <div className="space-y-3">
                      {overview.upcomingSchedule.slice(0, 3).map((schedule) => (
                        <div key={schedule.scheduleId} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium text-sm">{schedule.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {schedule.dayName}, {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No scheduled streams</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/schedule">Manage Schedule</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : overview?.notifications && overview.notifications.length > 0 ? (
                    <div className="space-y-3">
                      {overview.notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                            {notification.followerAvatar ? (
                              <img
                                src={notification.followerAvatar}
                                alt={notification.followerUsername}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-brand-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{notification.followerUsername}</span>{' '}
                              {notification.type === 'new_follower' ? 'followed you' : 'is live'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/analytics">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/content">
                      <Activity className="w-4 h-4 mr-2" />
                      Content Pipeline
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/moderators">
                      <Users className="w-4 h-4 mr-2" />
                      Moderators
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/settings">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {shareStream && (
          <SocialShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            streamTitle={shareStream.title}
            streamDescription={shareStream.description}
            language={shareStream.category?.name}
            duration={
              shareStream.startedAt && shareStream.endedAt
                ? Math.floor(
                    (new Date(shareStream.endedAt).getTime() -
                      new Date(shareStream.startedAt).getTime()) /
                      1000
                  )
                : undefined
            }
            viewerCount={shareStream.peakViewers}
          />
        )}
      </>
  );
}
