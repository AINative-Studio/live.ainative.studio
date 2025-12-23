'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Minimize2
} from 'lucide-react';
import { ViewerCountBadge } from './viewer-count-badge';

interface StreamPlayerProps {
  title: string;
  viewers: number;
  username: string;
  thumbnail: string;
}

export function StreamPlayer({ title, viewers, username, thumbnail }: StreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [showControls, setShowControls] = useState(false);

  return (
    <Card className="overflow-hidden border-border bg-black">
      <div
        className="relative aspect-video bg-black group cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div
          className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center">
            <p className="text-brand-primary font-mono text-xl mb-4">MOCK STREAM PLAYER</p>
            <p className="text-white/80 text-sm">Live streaming would be integrated here</p>
          </div>
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <div className="bg-success text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
          <ViewerCountBadge count={viewers} live />
        </div>

        <div className="absolute top-4 right-4 z-20">
          <p className="text-white font-semibold text-sm bg-black/80 px-3 py-1 rounded">
            {title}
          </p>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:text-brand-primary"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-2 flex-1">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-brand-primary"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-brand-primary"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-brand-primary"
              >
                <Minimize2 className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-brand-primary"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
