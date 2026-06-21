'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DollarSign, Heart, Clock } from 'lucide-react';

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamerName: string;
  streamerUsername: string;
}

const TIP_AMOUNTS = [
  { value: 1, label: '$1' },
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
  { value: 25, label: '$25' },
];

export function TipDialog({
  open,
  onOpenChange,
  streamerName,
  streamerUsername,
}: TipDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSelectedAmount(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-primary" />
            Tip {streamerName}
          </DialogTitle>
          <DialogDescription>
            Show your support for @{streamerUsername}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            {TIP_AMOUNTS.map((amount) => (
              <Button
                key={amount.value}
                variant={selectedAmount === amount.value ? 'default' : 'outline'}
                className={
                  selectedAmount === amount.value
                    ? 'bg-brand-primary hover:bg-primary-dark h-14 text-lg font-bold'
                    : 'h-14 text-lg font-bold hover:border-brand-primary'
                }
                onClick={() => setSelectedAmount(amount.value)}
              >
                <DollarSign className="w-5 h-5 mr-1" />
                {amount.label}
              </Button>
            ))}
          </div>

          <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-medium text-sm">Coming Soon</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tipping is currently in development. Soon you will be able to support
              your favorite streamers directly through AINative Studio Live.
            </p>
          </div>

          <Button
            disabled
            className="w-full bg-brand-primary hover:bg-primary-dark opacity-50 cursor-not-allowed"
          >
            <Heart className="w-4 h-4 mr-2" />
            {selectedAmount ? `Send $${selectedAmount} Tip` : 'Select an Amount'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
