'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ScheduleEditor, type ScheduleFormData } from '@/components/schedule-editor';
import { dashboardService } from '@/services/dashboard';
import type { WeeklySchedule, Schedule } from '@/types';
import { Calendar, Clock, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Empty schedule fallback when API is unavailable
const EMPTY_SCHEDULE: WeeklySchedule = {
  userId: '',
  username: '',
  schedule: DAYS_OF_WEEK.map((dayName, i) => ({
    dayOfWeek: i,
    dayName,
    schedules: [],
  })),
  totalEntries: 0,
};

function SchedulePageContent() {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load schedule on mount
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMySchedule();
      setSchedule(data);
    } catch (err) {
      console.error('Failed to load schedule:', err);
      setSchedule(EMPTY_SCHEDULE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = () => {
    setEditorMode('create');
    setSelectedSchedule(null);
    setEditorOpen(true);
  };

  const handleEditEntry = (entry: Schedule) => {
    setEditorMode('edit');
    setSelectedSchedule(entry);
    setEditorOpen(true);
  };

  const handleDeleteClick = (entry: Schedule) => {
    setScheduleToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;

    setIsDeleting(true);
    try {
      await dashboardService.deleteSchedule(scheduleToDelete.id);
      await loadSchedule();
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (err) {
      console.error('Failed to delete schedule entry:', err);
      alert('Failed to delete schedule entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (data: ScheduleFormData) => {
    try {
      if (editorMode === 'create') {
        await dashboardService.createSchedule(data);
      } else if (selectedSchedule) {
        await dashboardService.updateSchedule(selectedSchedule.id, data);
      }
      await loadSchedule();
    } catch (err) {
      console.error('Failed to save schedule:', err);
      throw err;
    }
  };

  const getUpcomingEntries = () => {
    if (!schedule) return [];

    const allEntries: (Schedule & { dayName: string })[] = [];
    schedule.schedule.forEach((day) => {
      day.schedules.forEach((entry) => {
        allEntries.push({ ...entry, dayName: day.dayName });
      });
    });

    // Sort by day of week
    return allEntries.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  };

  const upcomingEntries = getUpcomingEntries();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Schedule Management</h1>
            <p className="text-muted-foreground">
              Manage your streaming schedule and let viewers know when you&#39;ll be live
            </p>
          </div>
          <Button onClick={handleCreateEntry} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Schedule
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Schedule Grid */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <CardTitle>Weekly Schedule</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={loadSchedule}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    <CardDescription>
                      Your recurring weekly streaming schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {schedule?.schedule.map((day) => (
                      <div key={day.dayOfWeek} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg">{day.dayName}</h3>
                          {day.schedules.length === 0 && (
                            <span className="text-sm text-muted-foreground">No streams scheduled</span>
                          )}
                        </div>

                        {day.schedules.length > 0 && (
                          <div className="space-y-2">
                            {day.schedules.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between bg-card/50 rounded-lg p-3 border border-border/50"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <Clock className="w-4 h-4 mt-1 text-brand-primary" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{entry.title}</span>
                                      {entry.isRecurring && (
                                        <Badge variant="outline" className="text-xs">
                                          Recurring
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="font-mono">
                                        {entry.startTime} - {entry.endTime}
                                      </span>
                                      {entry.category && (
                                        <Badge variant="secondary" className="text-xs">
                                          {entry.category.name}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(entry)}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Streams Sidebar */}
              <div className="space-y-4">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Streams</CardTitle>
                    <CardDescription>
                      Your scheduled streams this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No scheduled streams yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={handleCreateEntry}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Schedule
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3 bg-card/50 rounded-lg border border-border/50"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Clock className="w-4 h-4 mt-0.5 text-brand-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{entry.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.dayName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono text-muted-foreground">
                                {entry.startTime} - {entry.endTime}
                              </span>
                              {entry.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {entry.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border border-brand-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Consistent schedule helps build audience</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Set recurring streams for regular slots</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Choose categories to help discovery</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-brand-primary">→</span>
                      <p>Viewers can see your schedule on your profile</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        )}
      </div>

      {/* Schedule Editor Dialog */}
      <ScheduleEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        schedule={selectedSchedule}
        mode={editorMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{scheduleToDelete?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <SchedulePageContent />
    </ProtectedRoute>
  );
}
