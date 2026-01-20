'use client';

import { useState, useEffect, useCallback } from 'react';
import { moderatorService } from '@/services/moderator';
import type { Moderator, ModeratorSearchResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Shield, UserX, Star, AlertCircle, Loader2, Users } from 'lucide-react';

interface ModeratorManagementProps {
  streamId: string;
}

export function ModeratorManagement({ streamId }: ModeratorManagementProps) {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ModeratorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [moderatorToRemove, setModeratorToRemove] = useState<Moderator | null>(null);

  // Load moderators
  const loadModerators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await moderatorService.getModerators(streamId);
      setModerators(data);
    } catch (err) {
      console.error('Failed to load moderators:', err);
      setError('Failed to load moderators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    loadModerators();
  }, [loadModerators]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await moderatorService.searchUsers(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('No users found');
        }
      } catch (err) {
        console.error('Search failed:', err);
        setSearchError('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Add moderator
  const handleAddModerator = async (user: ModeratorSearchResult) => {
    // Check if already a moderator
    const isAlreadyModerator = moderators.some((mod) => mod.userId === user.id);
    if (isAlreadyModerator) {
      setSearchError('This user is already a moderator');
      return;
    }

    try {
      await moderatorService.addModerator(streamId, {
        userId: user.id,
        isVip: false,
      });
      setSearchQuery('');
      setSearchResults([]);
      await loadModerators();
    } catch (err) {
      console.error('Failed to add moderator:', err);
      setSearchError('Failed to add moderator. Please try again.');
    }
  };

  // Remove moderator
  const handleRemoveClick = (moderator: Moderator) => {
    setModeratorToRemove(moderator);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!moderatorToRemove) return;

    try {
      await moderatorService.removeModerator(streamId, moderatorToRemove.id);
      setRemoveDialogOpen(false);
      setModeratorToRemove(null);
      await loadModerators();
    } catch (err) {
      console.error('Failed to remove moderator:', err);
      setError('Failed to remove moderator. Please try again.');
      setRemoveDialogOpen(false);
    }
  };

  const cancelRemove = () => {
    setRemoveDialogOpen(false);
    setModeratorToRemove(null);
  };

  // Toggle VIP status
  const handleVipToggle = async (moderator: Moderator) => {
    try {
      await moderatorService.updateModerator(streamId, moderator.id, {
        isVip: !moderator.isVip,
      });
      await loadModerators();
    } catch (err) {
      console.error('Failed to update VIP status:', err);
      setError('Failed to update VIP status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderator Management
          </CardTitle>
          <CardDescription>Manage moderators and VIPs for your stream</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Add Moderator */}
          <div className="space-y-4">
            <Label htmlFor="search-users">Add Moderator</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-users"
                type="text"
                placeholder="Search users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {searchError && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <p className="text-sm text-yellow-500">{searchError}</p>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2 border border-border rounded-lg p-2">
                {searchResults.map((user) => {
                  const isAlreadyModerator = moderators.some((mod) => mod.userId === user.id);

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar || undefined} alt={user.username} />
                        <AvatarFallback className="bg-dark-3 text-brand-primary">
                          {user.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.username}
                        </p>
                      </div>
                      {isAlreadyModerator ? (
                        <Badge variant="outline">Already a moderator</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddModerator(user)}
                          aria-label="Add moderator"
                        >
                          Add Moderator
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Moderator List */}
          <div className="space-y-4">
            <h3 className="font-semibold">Current Moderators</h3>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {!isLoading && !error && moderators.length === 0 && (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No moderators yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Search and add users as moderators above
                </p>
              </div>
            )}

            {!isLoading && !error && moderators.length > 0 && (
              <div className="space-y-3">
                {moderators.map((moderator) => (
                  <div
                    key={moderator.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-brand-primary/50 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={moderator.avatar || undefined}
                        alt={moderator.username}
                      />
                      <AvatarFallback className="bg-dark-3 text-brand-primary">
                        {moderator.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">
                          {moderator.displayName || moderator.username}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-brand-primary/20 text-brand-primary"
                        >
                          Moderator
                        </Badge>
                        {moderator.isVip && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-accent/20 text-accent"
                          >
                            VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {moderator.username}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`vip-${moderator.id}`}
                          className="text-sm cursor-pointer"
                        >
                          VIP
                        </Label>
                        <Switch
                          id={`vip-${moderator.id}`}
                          checked={moderator.isVip}
                          onCheckedChange={() => handleVipToggle(moderator)}
                          aria-label="VIP"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveClick(moderator)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        aria-label="Remove"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {moderatorToRemove?.displayName || moderatorToRemove?.username} as a
              moderator? They will no longer have moderation privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
