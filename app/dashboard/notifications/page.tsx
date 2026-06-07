'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, UserPlus, Radio } from 'lucide-react';
import { dashboardService } from '@/services/dashboard';
import type { FollowNotification } from '@/types';

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

  return date.toLocaleDateString();
}

function getNotificationMessage(notification: FollowNotification): string {
  if (notification.type === 'new_follower') {
    return `${notification.followerUsername} started following you`;
  } else if (notification.type === 'stream_live') {
    return `${notification.followerUsername} is now live`;
  }
  return 'New notification';
}

function getNotificationIcon(type: FollowNotification['type']) {
  if (type === 'new_follower') {
    return <UserPlus className="w-5 h-5 text-brand-primary" />;
  } else if (type === 'stream_live') {
    return <Radio className="w-5 h-5 text-success" />;
  }
  return <Bell className="w-5 h-5" />;
}

// Empty fallback when API is unavailable
const emptyNotifications: FollowNotification[] = [];

interface NotificationItemProps {
  notification: FollowNotification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Link
      href={
        notification.type === 'new_follower'
          ? `/user/${notification.followerUsername}`
          : `/stream/${notification.followerUsername}`
      }
      onClick={handleClick}
      className={`block p-4 rounded-lg border transition-colors hover:bg-accent ${
        notification.isRead ? 'border-border bg-card' : 'border-brand-primary/30 bg-brand-primary/5'
      }`}
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={notification.followerAvatar || undefined} />
          <AvatarFallback>
            {notification.followerUsername.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-white' : 'text-foreground'}`}>
              {getNotificationMessage(notification)}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1.5" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              {getNotificationIcon(notification.type)}
              <span className="text-xs text-muted-foreground capitalize">
                {notification.type === 'new_follower' ? 'New Follower' : 'Now Live'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NotificationSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadNotifications(currentPage);
  }, [currentPage]);

  const loadNotifications = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getNotifications(page);
      setNotifications(response.notifications);
      setTotalNotifications(response.total);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications, using mock data:', error);
      setNotifications(emptyNotifications);
      setTotalNotifications(emptyNotifications.length);
      setUnreadCount(emptyNotifications.filter(n => !n.isRead).length);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dashboardService.markNotificationRead(notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'followers') return notification.type === 'new_follower';
    if (activeTab === 'live') return notification.type === 'stream_live';
    return true;
  });

  const hasMore = notifications.length < totalNotifications;

  return (
    <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-brand-primary" />
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your followers and streams
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Notifications</CardTitle>
                      <CardDescription>
                        {totalNotifications} total notification{totalNotifications !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="text-sm">
                        {unreadCount} unread
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="unread">Unread</TabsTrigger>
                      <TabsTrigger value="followers">Followers</TabsTrigger>
                      <TabsTrigger value="live">Live</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-3">
                    {isLoading ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <NotificationSkeleton key={i} />
                        ))}
                      </>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          {activeTab === 'unread'
                            ? 'No unread notifications'
                            : 'No notifications yet'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredNotifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))}

                        {hasMore && activeTab === 'all' && (
                          <div className="pt-4">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                              Load More
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-brand-primary" />
                      <span className="text-sm font-medium">New Followers</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {notifications.filter(n => n.type === 'new_follower').length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium">Live Alerts</span>
                    </div>
                    <Badge variant="secondary" className="font-mono">
                      {notifications.filter(n => n.type === 'stream_live').length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-accent" />
                      <span className="text-sm font-medium">Unread</span>
                    </div>
                    <Badge variant="destructive" className="font-mono">
                      {unreadCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border border-brand-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Click on any notification to mark it as read</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Use tabs to filter notifications by type</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-brand-primary">→</span>
                    <p>Configure notification preferences in settings</p>
                  </div>
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/settings">Manage Preferences</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
  );
}
