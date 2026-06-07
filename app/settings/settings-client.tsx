'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Settings, Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { usersService } from '@/services/users';
import type { User as UserType } from '@/types';

const profileSchema = z.object({
  displayName: z.string().max(50, 'Display name must be 50 characters or less').optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  socials: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await usersService.getMyProfile();
        setProfile(data);
        reset({
          displayName: data.displayName || '',
          bio: data.bio || '',
          socials: {
            twitter: data.socials?.twitter || '',
            github: data.socials?.github || '',
            youtube: data.socials?.youtube || '',
            website: data.socials?.website || '',
          },
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Fall back to auth context user data
        if (authUser) {
          const fallback: UserType = {
            id: authUser.id,
            email: authUser.email,
            username: authUser.username,
            displayName: authUser.displayName,
            avatar: authUser.avatar,
            bio: null,
            role: authUser.role,
            followerCount: 0,
            followingCount: 0,
            isLive: false,
            createdAt: new Date().toISOString(),
          };
          setProfile(fallback);
          reset({ displayName: fallback.displayName || '', bio: '', socials: {} });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      const updatedProfile = await usersService.updateMyProfile({
        displayName: data.displayName,
        bio: data.bio,
        socials: data.socials,
      });
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your profile and account settings</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your display name"
                    {...register('displayName')}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-destructive">{errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...register('bio')}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Avatar Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile?.avatar || undefined} alt={profile?.displayName || 'User'} />
                    <AvatarFallback className="text-2xl">
                      {profile?.displayName?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button type="button" variant="outline" disabled>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG up to 5MB (Upload coming soon)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="twitter"
                      placeholder="your_handle"
                      className="rounded-l-none"
                      {...register('socials.twitter')}
                    />
                  </div>
                  {errors.socials?.twitter && (
                    <p className="text-sm text-destructive">{errors.socials.twitter.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Username</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground">
                      github.com/
                    </span>
                    <Input
                      id="github"
                      placeholder="username"
                      className="rounded-l-none"
                      {...register('socials.github')}
                    />
                  </div>
                  {errors.socials?.github && (
                    <p className="text-sm text-destructive">{errors.socials.github.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground">
                      youtube.com/
                    </span>
                    <Input
                      id="youtube"
                      placeholder="@channel"
                      className="rounded-l-none"
                      {...register('socials.youtube')}
                    />
                  </div>
                  {errors.socials?.youtube && (
                    <p className="text-sm text-destructive">{errors.socials.youtube.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    {...register('socials.website')}
                  />
                  {errors.socials?.website && (
                    <p className="text-sm text-destructive">{errors.socials.website.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-primary-dark"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
