'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { streamsService } from '@/services/streams';
import type { Schedule, Category } from '@/types';
import categoriesData from '@/data/categories.json';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

interface ScheduleEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => Promise<void>;
  schedule?: Schedule | null;
  mode: 'create' | 'edit';
}

export interface ScheduleFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  categoryId?: string;
  isRecurring?: boolean;
}

export function ScheduleEditor({ open, onClose, onSave, schedule, mode }: ScheduleEditorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    title: '',
    categoryId: '',
    isRecurring: true,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await streamsService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories, using fallback:', error);
        setCategories(categoriesData as any);
      }
    };
    loadCategories();
  }, []);

  // Initialize form with schedule data when editing
  useEffect(() => {
    if (schedule && mode === 'edit') {
      setFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        title: schedule.title,
        categoryId: schedule.category?.id || '',
        isRecurring: schedule.isRecurring,
      });
    } else {
      // Reset form when creating new
      setFormData({
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        title: '',
        categoryId: '',
        isRecurring: true,
      });
    }
  }, [schedule, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Schedule Entry' : 'Edit Schedule Entry'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new scheduled stream time slot'
              : 'Update your scheduled stream time slot'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              placeholder="e.g., Building with Next.js and AI"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, dayOfWeek: parseInt(value) })
              }
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRecurring: checked as boolean })
              }
            />
            <Label
              htmlFor="recurring"
              className="text-sm font-normal cursor-pointer"
            >
              Recurring weekly schedule
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
