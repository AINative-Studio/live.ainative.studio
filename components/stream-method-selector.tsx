'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Radio, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StreamMethod = 'browser' | 'software';

interface StreamMethodSelectorProps {
  onSelect: (method: StreamMethod) => void;
  selectedMethod?: StreamMethod;
}

export function StreamMethodSelector({ onSelect, selectedMethod }: StreamMethodSelectorProps) {
  const [selected, setSelected] = useState<StreamMethod | undefined>(selectedMethod);

  const handleSelect = (method: StreamMethod) => {
    setSelected(method);
    onSelect(method);
  };

  const isBrowserSupported = typeof window !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Streaming Method</h2>
        <p className="text-muted-foreground">
          Select how you want to broadcast your stream
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Streaming Option */}
        <Card
          className={cn(
            "border-2 cursor-pointer transition-all hover:shadow-lg",
            selected === 'browser'
              ? "border-brand-primary shadow-lg"
              : "border-border hover:border-brand-primary/50"
          )}
          onClick={() => isBrowserSupported && handleSelect('browser')}
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-brand-primary/10 rounded-lg">
                <Monitor className="w-8 h-8 text-brand-primary" />
              </div>
              {selected === 'browser' && (
                <div className="p-1 bg-brand-primary rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="flex items-center gap-2">
              Stream from Browser
              {!isBrowserSupported && (
                <Badge variant="destructive" className="text-xs">
                  Not Supported
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Quick and easy streaming directly from your browser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>No additional software required</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Stream with your webcam and microphone</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Perfect for quick streams and interviews</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Multiple quality options available</p>
              </div>
            </div>

            {!isBrowserSupported && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                Your browser doesn't support webcam streaming. Please use a modern browser like Chrome, Firefox, or Edge.
              </div>
            )}

            <Button
              className="w-full"
              variant={selected === 'browser' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                isBrowserSupported && handleSelect('browser');
              }}
              disabled={!isBrowserSupported}
            >
              {selected === 'browser' ? 'Selected' : 'Use Browser Streaming'}
            </Button>
          </CardContent>
        </Card>

        {/* Software Streaming Option */}
        <Card
          className={cn(
            "border-2 cursor-pointer transition-all hover:shadow-lg",
            selected === 'software'
              ? "border-brand-primary shadow-lg"
              : "border-border hover:border-brand-primary/50"
          )}
          onClick={() => handleSelect('software')}
        >
          <CardHeader>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Radio className="w-8 h-8 text-secondary" />
              </div>
              {selected === 'software' && (
                <div className="p-1 bg-brand-primary rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <CardTitle>Stream with Software</CardTitle>
            <CardDescription>
              Professional streaming with OBS, Streamlabs, or other RTMP software
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Professional streaming software (OBS, Streamlabs)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Advanced features like scene switching and overlays</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Screen sharing and multi-source streaming</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Best for gaming, coding, and professional content</p>
              </div>
            </div>

            <Button
              className="w-full"
              variant={selected === 'software' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('software');
              }}
            >
              {selected === 'software' ? 'Selected' : 'Use RTMP Software'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Browser Compatibility Info */}
      <Card className="border-border bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Browser Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Browser streaming is supported on:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Chrome 53+</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Firefox 36+</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Edge 12+</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Safari 11+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
