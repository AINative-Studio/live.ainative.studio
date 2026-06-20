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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Settings, Loader2, Upload, Download, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { usersService } from '@/services/users';
import { setupMFA, verifyMFA } from '@/lib/auth';
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // GDPR
  const [isExportingData, setIsExportingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // MFA
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qrCodeUrl: string; backupCodes: string[] } | null>(null);
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);

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

  const handleExportData = async () => {
    setIsExportingData(true);
    try {
      const blob = await usersService.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Data export failed:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);
    try {
      await usersService.deleteMyAccount();
      toast.success('Account deleted. Redirecting...');
      setShowDeleteDialog(false);
      // Clear auth and redirect
      const { clearAuth } = await import('@/lib/auth');
      clearAuth();
      router.replace('/');
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSetupMfa = async () => {
    setIsSettingUpMfa(true);
    try {
      const data = await setupMFA();
      setMfaSetupData(data);
    } catch (error) {
      console.error('MFA setup failed:', error);
      toast.error('Failed to set up MFA. Please try again.');
    } finally {
      setIsSettingUpMfa(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaCode || mfaCode.length < 6) return;
    setIsVerifyingMfa(true);
    try {
      const result = await verifyMFA(mfaCode);
      if (result.verified) {
        setMfaVerified(true);
        toast.success('MFA enabled successfully!');
      } else {
        toast.error('Invalid code. Please try again.');
      }
    } catch (error) {
      console.error('MFA verification failed:', error);
      toast.error('Invalid code. Please try again.');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

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
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      id="avatar-upload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File must be under 5MB');
                          return;
                        }
                        try {
                          setIsUploadingAvatar(true);
                          const result = await usersService.uploadAvatar(file);
                          setProfile(prev => prev ? { ...prev, avatar: result.avatarUrl } : prev);
                        } catch (err) {
                          console.error('Avatar upload failed:', err);
                          alert('Failed to upload avatar. Please try again.');
                        } finally {
                          setIsUploadingAvatar(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingAvatar}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, WebP up to 5MB
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

            {/* MFA Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mfaVerified ? (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
                    <Shield className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-green-500">MFA is enabled</p>
                  </div>
                ) : !mfaSetupData ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSetupMfa}
                    disabled={isSettingUpMfa}
                  >
                    {isSettingUpMfa ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    {isSettingUpMfa ? 'Setting up...' : 'Enable MFA'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Scan this QR code with your authenticator app:
                      </p>
                      <div className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mfaSetupData.qrCodeUrl}
                          alt="MFA QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Or enter this secret manually:
                      </p>
                      <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                        {mfaSetupData.secret}
                      </code>
                    </div>

                    {mfaSetupData.backupCodes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Backup codes (save these):</p>
                        <div className="grid grid-cols-2 gap-1 p-3 bg-muted rounded">
                          {mfaSetupData.backupCodes.map((code, i) => (
                            <code key={i} className="text-sm font-mono">{code}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="mfa-code">Enter verification code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="mfa-code"
                          type="text"
                          placeholder="123456"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="max-w-[200px] font-mono"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyMfa}
                          disabled={isVerifyingMfa || mfaCode.length < 6}
                          className="bg-brand-primary hover:bg-primary-dark"
                        >
                          {isVerifyingMfa ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Verify'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data & Privacy Section */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Manage your data and account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download My Data */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Download My Data</p>
                    <p className="text-sm text-muted-foreground">
                      Export all your account data as a JSON file
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportData}
                    disabled={isExportingData}
                  >
                    {isExportingData ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isExportingData ? 'Exporting...' : 'Download'}
                  </Button>
                </div>

                {/* Delete Account */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Account
                          </DialogTitle>
                          <DialogDescription>
                            This action is permanent and cannot be undone. All your data,
                            streams, followers, and settings will be permanently deleted.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="delete-confirm">
                              Type <span className="font-mono font-bold">DELETE</span> to confirm
                            </Label>
                            <Input
                              id="delete-confirm"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="DELETE"
                              className="font-mono"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowDeleteDialog(false);
                              setDeleteConfirmText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                          >
                            {isDeletingAccount ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Permanently Delete
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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
