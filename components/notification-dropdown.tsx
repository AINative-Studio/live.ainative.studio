'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { dashboardService } from '@/services/dashboard';
import { useAuth } from '@/contexts/auth-context';
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

export function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<FollowNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Only load notifications when dropdown opens, not on every mount
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadNotifications();
    }
  }, [isAuthenticated, isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await dashboardService.getNotifications(1);
      // Safely handle response - ensure notifications is an array
      const notificationsArray = Array.isArray(response?.notifications)
        ? response.notifications
        : [];
      const recentNotifications = notificationsArray.slice(0, 5);
      setNotifications(recentNotifications);
      setUnreadCount(response?.unreadCount ?? recentNotifications.filter((n: FollowNotification) => !n.isRead).length);
    } catch (error) {
      // Endpoint may not exist yet — silently use empty state
      setNotifications([]);
      setUnreadCount(0);
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
      // Mark as read locally even if API fails
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = (notification: FollowNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer p-3 focus:bg-accent"
                  onClick={() => handleNotificationClick(notification)}
                  asChild
                >
                  <Link
                    href={
                      notification.type === 'new_follower'
                        ? `/user/${notification.followerUsername}`
                        : `/stream/${notification.followerUsername}`
                    }
                    className="flex items-start gap-3"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={notification.followerAvatar || undefined} />
                      <AvatarFallback>
                        {notification.followerUsername.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1.5" />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/notifications" className="w-full text-center text-sm py-2">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
