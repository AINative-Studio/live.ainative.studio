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
import { X, Plus, Loader2, AlertCircle, Check, ChevronsUpDown, Github, Sparkles, ImageIcon } from 'lucide-react';
import categoriesData from '@/data/categories.json';
import { streamsService } from '@/services/streams';
import { LANGUAGES, FRAMEWORKS, TechItem } from '@/lib/tech-stack';

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
  // Filter out repo: and tech tags from display — managed by dedicated fields
  const [tags, setTags] = useState<string[]>(
    (initialData?.tags || []).filter(
      (t) => !t.startsWith('repo:') && !t.startsWith('lang:') && !t.startsWith('fw:')
    )
  );
  // Tech stack selection (lang:* and fw:* tags)
  const initialTechTags = (initialData?.tags || []).filter(
    (t) => t.startsWith('lang:') || t.startsWith('fw:')
  );
  const [selectedTech, setSelectedTech] = useState<string[]>(initialTechTags);
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  // Extract initial GitHub repo from tags (stored as repo:owner/name)
  const initialRepo = (initialData?.tags || []).find((t) => t.startsWith('repo:'));
  const [githubRepo, setGithubRepo] = useState(
    initialRepo ? initialRepo.slice(5) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(categoriesData as Category[]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Fetch real categories from API
  useEffect(() => {
    streamsService.getCategories().then((cats: any) => {
      const apiCats = Array.isArray(cats) ? cats : [];
      if (apiCats.length > 0) {
        setCategories(apiCats);
      }
    }).catch(() => {
      // Keep mock data as fallback
    });
  }, []);

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

    if (githubRepo.trim()) {
      const repoPattern = /^(https?:\/\/github\.com\/)?[\w.-]+\/[\w.-]+\/?$/;
      if (!repoPattern.test(githubRepo.trim())) {
        newErrors.githubRepo = 'Enter a valid GitHub URL or owner/repo format';
      }
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

      // Build final tags list: regular tags + tech stack tags + repo tag
      const finalTags = [...tags, ...selectedTech];
      if (githubRepo.trim()) {
        // Normalize: strip https://github.com/ prefix if provided
        const repo = githubRepo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
        finalTags.push(`repo:${repo}`);
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId: categoryId || undefined,
        tags: finalTags.length > 0 ? finalTags : undefined,
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

  const handleGenerateThumbnail = async () => {
    if (!title.trim()) {
      setErrors({ ...errors, title: 'Enter a title first to generate a thumbnail' });
      return;
    }

    setIsGeneratingThumbnail(true);
    setThumbnailError(null);

    try {
      // Derive language from selected tech tags
      const langTag = selectedTech.find((t) => t.startsWith('lang:'));
      const language = langTag ? langTag.slice(5) : undefined;

      const res = await fetch('/api/ai/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setThumbnailError(data.error || 'Failed to generate thumbnail');
        return;
      }

      if (data.imageUrl) {
        setThumbnailUrl(data.imageUrl);
      } else if (data.base64) {
        setThumbnailUrl(`data:image/png;base64,${data.base64}`);
      } else {
        setThumbnailError('No image returned from service');
      }
    } catch (err) {
      setThumbnailError('Failed to connect to thumbnail service');
    } finally {
      setIsGeneratingThumbnail(false);
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

        {/* Generate Thumbnail */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateThumbnail}
            disabled={isGeneratingThumbnail || !title.trim()}
            className="gap-1.5"
          >
            {isGeneratingThumbnail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Thumbnail
              </>
            )}
          </Button>
          {thumbnailUrl && (
            <button
              type="button"
              onClick={() => { setThumbnailUrl(null); setThumbnailError(null); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          )}
        </div>
        {thumbnailError && (
          <p className="text-xs text-destructive mt-1">{thumbnailError}</p>
        )}
        {thumbnailUrl && (
          <div className="mt-3 relative rounded-lg overflow-hidden border border-border bg-dark-2">
            <img
              src={thumbnailUrl}
              alt="Generated stream thumbnail"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute top-2 right-2 bg-dark-1/70 rounded px-2 py-0.5 text-xs text-muted-foreground flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              1280 x 720
            </div>
          </div>
        )}
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

      {/* GitHub Repository */}
      <div className="space-y-2">
        <Label htmlFor="githubRepo">
          <span className="flex items-center gap-1.5">
            <Github className="h-4 w-4" />
            GitHub Repository (optional)
          </span>
        </Label>
        <Input
          id="githubRepo"
          placeholder="https://github.com/user/repo or user/repo"
          value={githubRepo}
          onChange={(e) => {
            setGithubRepo(e.target.value);
            setErrors({ ...errors, githubRepo: '' });
          }}
          className={errors.githubRepo ? 'border-destructive' : ''}
        />
        {errors.githubRepo && (
          <p className="text-xs text-destructive">{errors.githubRepo}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Link a GitHub repo to show code context on your stream page
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

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Tech Stack (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Select the languages and frameworks you are using
        </p>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
            onClick={() => setTechDropdownOpen(!techDropdownOpen)}
          >
            {selectedTech.length > 0
              ? `${selectedTech.length} selected`
              : 'Select languages & frameworks...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          {techDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">Languages</p>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedTech.includes(lang.tag);
                  return (
                    <button
                      key={lang.tag}
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors text-left"
                      onClick={() => {
                        setSelectedTech(
                          isSelected
                            ? selectedTech.filter((t) => t !== lang.tag)
                            : [...selectedTech, lang.tag]
                        );
                      }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-muted-foreground/30'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {lang.name}
                    </button>
                  );
                })}
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mt-2 uppercase tracking-wider">Frameworks</p>
                {FRAMEWORKS.map((fw) => {
                  const isSelected = selectedTech.includes(fw.tag);
                  return (
                    <button
                      key={fw.tag}
                      type="button"
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors text-left"
                      onClick={() => {
                        setSelectedTech(
                          isSelected
                            ? selectedTech.filter((t) => t !== fw.tag)
                            : [...selectedTech, fw.tag]
                        );
                      }}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-secondary border-secondary' : 'border-muted-foreground/30'}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {fw.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {selectedTech.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTech.map((techTag) => {
              const item = [...LANGUAGES, ...FRAMEWORKS].find((t) => t.tag === techTag);
              const isLang = techTag.startsWith('lang:');
              return (
                <Badge
                  key={techTag}
                  variant="secondary"
                  className={`pl-3 pr-1 py-1 gap-1 ${isLang ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}
                >
                  {item?.name || techTag}
                  <button
                    type="button"
                    onClick={() => setSelectedTech(selectedTech.filter((t) => t !== techTag))}
                    className="ml-1 hover:bg-muted rounded-sm p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
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
