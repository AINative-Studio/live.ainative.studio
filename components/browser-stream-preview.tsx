'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Mic,
  VideoOff,
  MicOff,
  AlertCircle,
  Loader2,
  Monitor,
  Camera
} from 'lucide-react';

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

interface BrowserStreamPreviewProps {
  onStartStreaming: (stream: MediaStream) => void;
  onStopPreview: () => void;
}

export type StreamQuality = '720p' | '1080p' | '1440p';

interface QualitySettings {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

const QUALITY_PRESETS: Record<StreamQuality, QualitySettings> = {
  '720p': { width: 1280, height: 720, frameRate: 30, bitrate: 2500 },
  '1080p': { width: 1920, height: 1080, frameRate: 30, bitrate: 4500 },
  '1440p': { width: 2560, height: 1440, frameRate: 30, bitrate: 8000 },
};

export function BrowserStreamPreview({ onStartStreaming, onStopPreview }: BrowserStreamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<StreamQuality>('1080p');

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Enumerate media devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          }));

        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          }));

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);

        // Select first device by default
        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }
        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
        if (err instanceof Error && err.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError('Camera and microphone access denied. Please allow access to continue.');
        } else {
          setError('Failed to access media devices. Please check your browser permissions.');
        }
      }
    };

    loadDevices();
  }, []);

  // Start preview stream when devices are selected
  useEffect(() => {
    if (!selectedVideoDevice || !selectedAudioDevice) {
      setIsLoading(false);
      return;
    }

    const startPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Stop existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const quality = QUALITY_PRESETS[selectedQuality];
        const constraints: MediaStreamConstraints = {
          video: isVideoEnabled ? {
            deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
            width: { ideal: quality.width },
            height: { ideal: quality.height },
            frameRate: { ideal: quality.frameRate },
          } : false,
          audio: isAudioEnabled ? {
            deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error starting preview:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setPermissionDenied(true);
            setError('Permission denied. Please allow camera and microphone access.');
          } else if (err.name === 'NotFoundError') {
            setError('No camera or microphone found. Please connect a device.');
          } else if (err.name === 'NotReadableError') {
            setError('Device is already in use by another application.');
          } else {
            setError(`Failed to start preview: ${err.message}`);
          }
        }
        setIsLoading(false);
      }
    };

    startPreview();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedVideoDevice, selectedAudioDevice, selectedQuality, isVideoEnabled, isAudioEnabled]);

  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleStartStreaming = () => {
    if (streamRef.current) {
      onStartStreaming(streamRef.current);
    }
  };

  const handleStopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    onStopPreview();
  };

  const hasPermission = videoDevices.length > 0 || audioDevices.length > 0;

  return (
    <div className="space-y-6">
      {/* Permission Error */}
      {permissionDenied && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Camera and Microphone Access Required</p>
            <p className="text-sm mb-3">
              To stream from your browser, you need to grant permission to access your camera and microphone.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-background"
            >
              Retry Permission Request
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* General Error */}
      {error && !permissionDenied && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Preview */}
      <Card className="border-border overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stream Preview</CardTitle>
              <CardDescription>Preview your stream before going live</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Monitor className="w-3 h-3" />
              {selectedQuality}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-black aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  <p className="text-sm text-white">Starting preview...</p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!isVideoEnabled && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="flex flex-col items-center gap-2">
                  <VideoOff className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera is off</p>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  size="icon"
                  onClick={handleToggleVideo}
                  disabled={isLoading || !hasPermission}
                  className="h-12 w-12 rounded-full"
                >
                  {isVideoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  size="icon"
                  onClick={handleToggleAudio}
                  disabled={isLoading || !hasPermission}
                  className="h-12 w-12 rounded-full"
                >
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device and Quality Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Stream Settings</CardTitle>
          <CardDescription>Select your devices and stream quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Device */}
          <div className="space-y-2">
            <Label htmlFor="video-device">
              <Camera className="w-4 h-4 inline mr-2" />
              Camera
            </Label>
            <Select
              value={selectedVideoDevice}
              onValueChange={setSelectedVideoDevice}
              disabled={isLoading || videoDevices.length === 0}
            >
              <SelectTrigger id="video-device">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audio Device */}
          <div className="space-y-2">
            <Label htmlFor="audio-device">
              <Mic className="w-4 h-4 inline mr-2" />
              Microphone
            </Label>
            <Select
              value={selectedAudioDevice}
              onValueChange={setSelectedAudioDevice}
              disabled={isLoading || audioDevices.length === 0}
            >
              <SelectTrigger id="audio-device">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <Label htmlFor="quality">
              <Monitor className="w-4 h-4 inline mr-2" />
              Stream Quality
            </Label>
            <Select
              value={selectedQuality}
              onValueChange={(value) => setSelectedQuality(value as StreamQuality)}
              disabled={isLoading}
            >
              <SelectTrigger id="quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">
                  720p (1280x720, 30fps) - Recommended
                </SelectItem>
                <SelectItem value="1080p">
                  1080p (1920x1080, 30fps) - High Quality
                </SelectItem>
                <SelectItem value="1440p">
                  1440p (2560x1440, 30fps) - Ultra HD
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher quality requires more bandwidth. Choose based on your internet speed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleStopPreview}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleStartStreaming}
          disabled={isLoading || !streamRef.current || (!isVideoEnabled && !isAudioEnabled)}
          className="flex-1"
        >
          Start Streaming
        </Button>
      </div>
    </div>
  );
}
