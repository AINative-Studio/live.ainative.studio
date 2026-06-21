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
import { Check, Copy } from 'lucide-react';

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

const SIZE_OPTIONS = [
  { label: 'Small', width: 480, height: 270 },
  { label: 'Medium', width: 640, height: 360 },
  { label: 'Large', width: 854, height: 480 },
] as const;

export function EmbedDialog({ open, onOpenChange, username }: EmbedDialogProps) {
  const [selectedSize, setSelectedSize] = useState(1); // default Medium
  const [copied, setCopied] = useState(false);

  const { width, height } = SIZE_OPTIONS[selectedSize];

  const embedCode = `<iframe src="https://live.ainative.studio/embed/${username}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Embed Stream</DialogTitle>
          <DialogDescription>
            Copy this code to embed the stream player on your website or blog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Size selector */}
          <div className="flex gap-2">
            {SIZE_OPTIONS.map((opt, i) => (
              <Button
                key={opt.label}
                variant={selectedSize === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSize(i)}
                className="font-mono text-xs"
              >
                {opt.label} ({opt.width}x{opt.height})
              </Button>
            ))}
          </div>

          {/* Embed code */}
          <div className="relative">
            <pre className="bg-muted p-3 rounded-lg text-xs font-mono break-all whitespace-pre-wrap select-all border border-border">
              {embedCode}
            </pre>
          </div>

          {/* Preview */}
          <div className="text-xs text-muted-foreground">
            Preview ({SIZE_OPTIONS[selectedSize].label}):
          </div>
          <div
            className="bg-black rounded-lg border border-border overflow-hidden mx-auto"
            style={{
              width: Math.min(width, 480),
              height: Math.min(height, 270),
              maxWidth: '100%',
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
              Stream embed preview
            </div>
          </div>

          {/* Copy button */}
          <Button onClick={handleCopy} className="w-full font-mono">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Embed Code
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
