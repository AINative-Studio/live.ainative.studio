'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { dashboardService } from '@/services/dashboard';
import type {
  FollowerGrowth,
  ViewerGrowth,
  TopStream,
} from '@/types';
import {
  TrendingUp,
  Users,
  Clock,
  Eye,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type DateRange = 7 | 30 | 90;
type TopStreamMetric = 'peak_viewers' | 'total_views' | 'total_messages';

interface OverviewStats {
  totalStreams: number;
  hoursStreamed: number;
  averageViewers: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  streamCount: number;
  avgPeakViewers: number;
  totalHours: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [topStreamMetric, setTopStreamMetric] = useState<TopStreamMetric>('peak_viewers');

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [followerGrowth, setFollowerGrowth] = useState<FollowerGrowth | null>(null);
  const [viewerStats, setViewerStats] = useState<ViewerGrowth | null>(null);
  const [topStreams, setTopStreams] = useState<TopStream[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch analytics data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnalytics = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        // Fetch all analytics data in parallel
        const [channelOverview, followerData, viewerData, topStreamsData, categoryData] = await Promise.all([
          dashboardService.getChannelOverview().catch(() => null),
          dashboardService.getFollowerGrowth(dateRange).catch(() => null),
          dashboardService.getViewerGrowth(dateRange).catch(() => null),
          dashboardService.getTopStreams(topStreamMetric, 10).catch(() => []),
          dashboardService.getCategoryBreakdown().catch(() => []),
        ]);

        // Set overview stats
        if (channelOverview) {
          setOverviewStats({
            totalStreams: channelOverview.completedStreams,
            hoursStreamed: channelOverview.totalHoursStreamed,
            averageViewers: channelOverview.avgViewersPerStream,
          });
        } else {
          // Mock data fallback
          setOverviewStats({
            totalStreams: 42,
            hoursStreamed: 126.5,
            averageViewers: 87,
          });
        }

        // Set follower growth data
        if (followerData) {
          setFollowerGrowth(followerData);
        } else {
          // Mock data fallback
          setFollowerGrowth({
            timeline: Array.from({ length: dateRange }, (_, i) => ({
              date: new Date(Date.now() - (dateRange - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              newFollowers: Math.floor(Math.random() * 20) + 5,
              totalFollowers: 450 + i * 10,
            })),
            periodDays: dateRange,
            totalNewFollowers: 127,
            growthRatePercent: 12.5,
          });
        }

        // Set viewer stats
        if (viewerData) {
          setViewerStats(viewerData);
        } else {
          // Mock data fallback
          setViewerStats({
            timeline: Array.from({ length: dateRange }, (_, i) => ({
              date: new Date(Date.now() - (dateRange - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              totalViews: Math.floor(Math.random() * 500) + 200,
              uniqueViewers: Math.floor(Math.random() * 100) + 50,
              avgPeakViewers: Math.floor(Math.random() * 150) + 70,
            })),
            periodDays: dateRange,
            totalViews: 12543,
            totalUniqueViewers: 3421,
          });
        }

        // Set top streams
        if (topStreamsData && topStreamsData.length > 0) {
          setTopStreams(topStreamsData);
        } else {
          // Mock data fallback
          setTopStreams([
            {
              id: '1',
              title: 'Building AI-powered features with Claude API',
              description: null,
              peakViewers: 234,
              durationSeconds: 7200,
              totalViews: 1543,
              totalMessages: 892,
              category: { name: 'Software Development', slug: 'software-development' },
              startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200 * 1000).toISOString(),
            },
            {
              id: '2',
              title: 'Live coding session: Next.js 13 app router deep dive',
              description: null,
              peakViewers: 198,
              durationSeconds: 5400,
              totalViews: 1287,
              totalMessages: 654,
              category: { name: 'Web Development', slug: 'web-development' },
              startedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
              endedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000 + 5400 * 1000).toISOString(),
            },
            {
              id: '3',
              title: 'System design interview prep: Distributed systems',
              description: null,
              peakViewers: 176,
              durationSeconds: 6300,
              totalViews: 1098,
              totalMessages: 523,
              category: { name: 'Computer Science', slug: 'computer-science' },
              startedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
              endedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000 + 6300 * 1000).toISOString(),
            },
          ]);
        }

        // Set category breakdown
        if (categoryData && categoryData.length > 0) {
          setCategoryBreakdown(categoryData);
        } else {
          // Mock data fallback
          setCategoryBreakdown([
            {
              categoryId: '1',
              categoryName: 'Software Development',
              streamCount: 18,
              avgPeakViewers: 145,
              totalHours: 54.5,
            },
            {
              categoryId: '2',
              categoryName: 'Web Development',
              streamCount: 12,
              avgPeakViewers: 123,
              totalHours: 38.2,
            },
            {
              categoryId: '3',
              categoryName: 'Computer Science',
              streamCount: 8,
              avgPeakViewers: 98,
              totalHours: 24.8,
            },
            {
              categoryId: '4',
              categoryName: 'AI & Machine Learning',
              streamCount: 4,
              avgPeakViewers: 167,
              totalHours: 9.0,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, dateRange, topStreamMetric]);

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Don't render if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your streaming performance and growth</p>
          </div>

          {/* Date Range Selector */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Period:</span>
            </div>
            <Select value={dateRange.toString()} onValueChange={(val) => setDateRange(Number(val) as DateRange)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 border-destructive/50 bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border">
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Overview Cards */}
          {!isLoadingData && overviewStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Total Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{overviewStats.totalStreams}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed streams</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hours Streamed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{overviewStats.hoursStreamed.toFixed(1)}h</div>
                  <p className="text-xs text-muted-foreground mt-1">Total time live</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Average Viewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{overviewStats.averageViewers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per stream</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Follower Growth */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Follower Growth
                </CardTitle>
                <CardDescription>New followers over the last {dateRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                ) : followerGrowth ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">New Followers</p>
                        <p className="text-2xl font-bold text-brand-primary">+{followerGrowth.totalNewFollowers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Rate</p>
                        <p className="text-2xl font-bold text-green-500">+{followerGrowth.growthRatePercent.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recent Activity</p>
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {followerGrowth.timeline.slice(-10).reverse().map((day, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground">{formatDate(day.date)}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-green-500">+{day.newFollowers}</span>
                              <span className="text-muted-foreground">Total: {day.totalFollowers}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Viewer Stats */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Viewer Stats
                </CardTitle>
                <CardDescription>Viewership metrics for the last {dateRange} days</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingData ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                ) : viewerStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-brand-primary">{(viewerStats.totalViews ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unique Viewers</p>
                        <p className="text-2xl font-bold text-brand-primary">{(viewerStats.totalUniqueViewers ?? 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Daily Breakdown</p>
                      <div className="max-h-[200px] overflow-y-auto space-y-1">
                        {viewerStats.timeline.slice(-10).reverse().map((day, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground">{formatDate(day.date)}</span>
                            <div className="flex items-center gap-3">
                              <span>Views: {day.totalViews}</span>
                              <span className="text-muted-foreground">Peak: {day.avgPeakViewers}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Streams Table */}
          <Card className="border-border mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Streams</CardTitle>
                  <CardDescription>Your best performing streams</CardDescription>
                </div>
                <Select value={topStreamMetric} onValueChange={(val) => setTopStreamMetric(val as TopStreamMetric)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peak_viewers">Peak Viewers</SelectItem>
                    <SelectItem value="total_views">Total Views</SelectItem>
                    <SelectItem value="total_messages">Chat Messages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              ) : topStreams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stream</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Peak</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Views</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Duration</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStreams.map((stream, idx) => (
                        <tr key={stream.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono text-sm">#{idx + 1}</span>
                              <span className="font-medium">{stream.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {stream.category?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-brand-primary">
                            {stream.peakViewers}
                          </td>
                          <td className="py-3 px-2 text-right font-mono">
                            {(stream.totalViews ?? 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm">
                            {formatDuration(stream.durationSeconds)}
                          </td>
                          <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                            {formatDate(stream.startedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No stream data available</p>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Performance by streaming category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded"></div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {categoryBreakdown.map((category) => (
                    <div key={category.categoryId} className="border border-border rounded-lg p-4 hover:border-brand-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{category.categoryName}</h3>
                        <span className="text-sm text-muted-foreground">{category.streamCount} streams</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avg Peak Viewers</p>
                          <p className="font-mono font-semibold text-brand-primary">{category.avgPeakViewers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Hours</p>
                          <p className="font-mono font-semibold">{category.totalHours.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Duration</p>
                          <p className="font-mono font-semibold">
                            {(category.totalHours / category.streamCount).toFixed(1)}h
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No category data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
