'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';
import categoriesData from '@/data/categories.json';

interface StreamSetupFormProps {
  initialData?: {
    title: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
  };
  onSubmit: (data: {
    title: string;
    description?: string;
    categoryId?: string;
    tags?: string[];
  }) => Promise<void>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function StreamSetupForm({ initialData, onSubmit }: StreamSetupFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = categoriesData as Category[];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (tags.length >= 5) {
      setErrors({ ...errors, tags: 'Maximum 5 tags allowed' });
      return;
    }

    if (tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
      setErrors({ ...errors, tags: 'Tag already added' });
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput('');
    setErrors({ ...errors, tags: '' });
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setErrors({ ...errors, tags: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
    } catch (err) {
      console.error('Failed to update stream:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save stream configuration. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Stream Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Building an AI Native IDE with Cursor & Claude"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({ ...errors, title: '' });
          }}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Tell viewers what you'll be working on..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Add a brief description of your stream
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value);
            setErrors({ ...errors, categoryId: '' });
          }}
        >
          <SelectTrigger
            id="category"
            className={errors.categoryId ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-xs text-destructive">{errors.categoryId}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (optional)</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setErrors({ ...errors, tags: '' });
            }}
            onKeyDown={handleKeyDown}
            disabled={tags.length >= 5}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTag}
            disabled={tags.length >= 5 || !tagInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {errors.tags && (
          <p className="text-xs text-destructive">{errors.tags}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Add up to 5 tags to help viewers find your stream
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pl-3 pr-1 py-1 gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="ml-1 hover:bg-muted rounded-sm p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Error saving stream configuration
            </p>
            <p className="text-sm text-destructive/80 mt-1">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Configuration'
        )}
      </Button>
    </form>
  );
}
