'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
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
  const [geographicData, setGeographicData] = useState<{
    geographicBreakdown: { countryCode: string; viewerCount: number; percentage: number }[];
    viewerTypeBreakdown: { authenticated: number; anonymous: number };
    avgWatchTimeMinutes: number;
  } | null>(null);

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
        const [channelOverview, followerData, viewerData, topStreamsData, categoryData, audienceData] = await Promise.all([
          dashboardService.getChannelOverview().catch(() => null),
          dashboardService.getFollowerGrowth(dateRange).catch(() => null),
          dashboardService.getViewerGrowth(dateRange).catch(() => null),
          dashboardService.getTopStreams(topStreamMetric, 10).catch(() => []),
          dashboardService.getCategoryBreakdown().catch(() => []),
          dashboardService.getAudienceDemographics().catch(() => null),
        ]);

        // Set overview stats
        if (channelOverview) {
          setOverviewStats({
            totalStreams: channelOverview.completedStreams,
            hoursStreamed: channelOverview.totalHoursStreamed,
            averageViewers: channelOverview.avgViewersPerStream,
          });
        } else {
          setOverviewStats({ totalStreams: 0, hoursStreamed: 0, averageViewers: 0 });
        }

        // Set follower growth data
        if (followerData) {
          setFollowerGrowth(followerData);
        } else {
          setFollowerGrowth({ timeline: [], periodDays: dateRange, totalNewFollowers: 0, growthRatePercent: 0 });
        }

        // Set viewer stats
        if (viewerData) {
          setViewerStats(viewerData);
        } else {
          setViewerStats({ timeline: [], periodDays: dateRange, totalViews: 0, totalUniqueViewers: 0 });
        }

        // Set top streams
        setTopStreams(topStreamsData && topStreamsData.length > 0 ? topStreamsData : []);
        setCategoryBreakdown(categoryData && categoryData.length > 0 ? categoryData : []);

        // Set geographic data
        if (audienceData) {
          setGeographicData(audienceData);
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

  // Helper function to convert country code to name
  const getCountryName = (countryCode: string): string => {
    const countryMap: Record<string, string> = {
      US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
      DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
      SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland',
      BR: 'Brazil', MX: 'Mexico', AR: 'Argentina', CL: 'Chile', JP: 'Japan',
      KR: 'South Korea', CN: 'China', IN: 'India', SG: 'Singapore', NZ: 'New Zealand',
      ZA: 'South Africa', RU: 'Russia', UA: 'Ukraine',
    };
    return countryMap[countryCode] || `${countryCode} (Unknown)`;
  };

  // Helper function to get country flag emoji
  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      US: '\u{1F1FA}\u{1F1F8}', GB: '\u{1F1EC}\u{1F1E7}', CA: '\u{1F1E8}\u{1F1E6}',
      DE: '\u{1F1E9}\u{1F1EA}', FR: '\u{1F1EB}\u{1F1F7}', AU: '\u{1F1E6}\u{1F1FA}',
      IT: '\u{1F1EE}\u{1F1F9}', ES: '\u{1F1EA}\u{1F1F8}', NL: '\u{1F1F3}\u{1F1F1}',
      SE: '\u{1F1F8}\u{1F1EA}', NO: '\u{1F1F3}\u{1F1F4}', DK: '\u{1F1E9}\u{1F1F0}',
      FI: '\u{1F1EB}\u{1F1EE}', PL: '\u{1F1F5}\u{1F1F1}', BR: '\u{1F1E7}\u{1F1F7}',
      MX: '\u{1F1F2}\u{1F1FD}', AR: '\u{1F1E6}\u{1F1F7}', CL: '\u{1F1E8}\u{1F1F1}',
      JP: '\u{1F1EF}\u{1F1F5}', KR: '\u{1F1F0}\u{1F1F7}', CN: '\u{1F1E8}\u{1F1F3}',
      IN: '\u{1F1EE}\u{1F1F3}', SG: '\u{1F1F8}\u{1F1EC}', NZ: '\u{1F1F3}\u{1F1FF}',
      ZA: '\u{1F1FF}\u{1F1E6}', RU: '\u{1F1F7}\u{1F1FA}', UA: '\u{1F1FA}\u{1F1E6}',
    };
    return flags[countryCode] || '\u{1F30D}';
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
          <Card className="border-border mb-8">
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

          {/* Geographic Analytics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Geographic Analytics
              </CardTitle>
              <CardDescription>Viewer distribution by location</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              ) : geographicData && geographicData.geographicBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {geographicData.geographicBreakdown.map((country) => (
                    <div
                      key={country.countryCode}
                      className="border border-border rounded-lg p-4 hover:border-brand-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getCountryFlag(country.countryCode)}</div>
                          <div>
                            <h3 className="font-semibold">
                              {getCountryName(country.countryCode)}
                            </h3>
                            <p className="text-sm text-muted-foreground">{country.countryCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-brand-primary">
                            {country.viewerCount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">viewers</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Percentage of total</span>
                          <span className="font-semibold text-green-500">{country.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-brand-primary h-2 rounded-full transition-all"
                            style={{ width: `${country.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No geographic data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
  );
}
