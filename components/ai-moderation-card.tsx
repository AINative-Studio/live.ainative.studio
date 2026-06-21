'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, AlertTriangle, Ban, Activity } from 'lucide-react';

interface ModerationStats {
  scanned: number;
  warnings: number;
  blocked: number;
}

export function AiModerationCard() {
  const [enabled, setEnabled] = useState(false);
  // Placeholder stats — in production these would come from the backend
  const [stats] = useState<ModerationStats>({ scanned: 0, warnings: 0, blocked: 0 });

  return (
    <Card className="border-brand-primary/20 bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
              <Shield className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Moderation</CardTitle>
              <CardDescription>
                Automatically flag inappropriate messages using AI
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {enabled && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                <ShieldCheck className="h-3 w-3" />
                Active
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-moderation-toggle" className="sr-only">
                Enable AI Moderation
              </Label>
              <Switch
                id="ai-moderation-toggle"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border bg-dark-3/30 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scanned</p>
                  <p className="text-lg font-semibold">{stats.scanned}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                  <p className="text-lg font-semibold">{stats.warnings}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10">
                  <Ban className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                  <p className="text-lg font-semibold">{stats.blocked}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              AI moderator scans incoming chat messages and flags hate speech, spam, and explicit
              content. Developer jargon and technical discussion are always allowed.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
