'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  Camera,
  ScreenShare,
} from 'lucide-react';
import {
  ScreenRecorder,
  CameraRecorder,
  createCameraRecorder,
  AudioRecorder,
} from '@ainative/ai-kit-video';

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

interface BrowserStreamPreviewProps {
  onStartStreaming: (stream: MediaStream) => void;
  onStopPreview: () => void;
}

export type StreamQuality = '720p' | '1080p' | '1440p';
type VideoSource = 'camera' | 'screen';

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

  // AI Kit recorder refs for cleanup
  const screenRecorderRef = useRef<ScreenRecorder | null>(null);
  const cameraRecorderRef = useRef<CameraRecorder | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<StreamQuality>('1080p');
  const [videoSource, setVideoSource] = useState<VideoSource>('camera');

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Request camera permission first, then enumerate devices.
  // Without a prior getUserMedia call, enumerateDevices() returns empty
  // deviceId strings on most browsers — which means zero cameras detected
  // and the webcam never starts.
  const loadDevices = useCallback(async () => {
    try {
      // Request minimal camera+mic access to unlock device labels and IDs.
      // This triggers the browser permission prompt on first visit.
      let tempStream: MediaStream | null = null;
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        // If camera denied, try audio-only to at least get mic devices
        try {
          tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          // Both denied — enumerate will return limited info but still works
        }
      }

      const devices = await navigator.mediaDevices.enumerateDevices();

      // Stop the temporary stream — we only needed it to unlock device info
      if (tempStream) {
        tempStream.getTracks().forEach(track => track.stop());
      }

      const videoInputs = devices
        .filter(device => device.kind === 'videoinput' && device.deviceId)
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
        }));
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput' && device.deviceId)
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
        }));

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      // Default to the first (built-in) webcam
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  }, [selectedVideoDevice, selectedAudioDevice]);

  useEffect(() => {
    loadDevices();
  }, []);

  const stopCurrentStream = useCallback(() => {
    // Stop and dispose AI Kit recorders
    if (screenRecorderRef.current) {
      screenRecorderRef.current.dispose();
      screenRecorderRef.current = null;
    }
    if (cameraRecorderRef.current) {
      cameraRecorderRef.current.stop();
      cameraRecorderRef.current = null;
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording().catch(() => {});
      audioRecorderRef.current = null;
    }

    // Stop any remaining tracks on the combined stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Request permissions and start preview using AI Kit recorders
  const startPreview = useCallback(async (source: VideoSource) => {
    setIsLoading(true);
    setError(null);
    stopCurrentStream();

    try {
      let videoStream: MediaStream | null = null;
      let audioStream: MediaStream | null = null;

      // Get video source via AI Kit recorders
      if (isVideoEnabled) {
        if (source === 'screen') {
          try {
            const recorder = new ScreenRecorder({
              quality: selectedQuality === '720p' ? 'medium' : selectedQuality === '1080p' ? 'high' : 'ultra',
              cursor: 'always',
              audio: false,
            });
            await recorder.startRecording();
            videoStream = recorder.getStream();
            screenRecorderRef.current = recorder;
          } catch (err) {
            if (err instanceof Error && err.name === 'NotAllowedError') {
              setError('Screen share cancelled. Select a screen, window, or tab to share.');
              setIsLoading(false);
              return;
            }
            throw err;
          }
        } else {
          try {
            const camera = createCameraRecorder({
              resolution: selectedQuality === '1440p' ? '4K' : selectedQuality === '1080p' ? '1080p' : '720p',
              audio: false,
              deviceId: selectedVideoDevice || undefined,
            });
            videoStream = await camera.getStream();
            cameraRecorderRef.current = camera;
          } catch (err) {
            if (err instanceof Error && err.name === 'NotAllowedError') {
              setError('Camera access denied. You can still stream with screen share.');
              setIsLoading(false);
              return;
            }
            if (err instanceof Error && err.name === 'NotFoundError') {
              setError('No camera found. Try screen share instead.');
              setIsLoading(false);
              return;
            }
            throw err;
          }
        }
      }

      // Get audio via AI Kit AudioRecorder — don't let audio failure block video
      if (isAudioEnabled) {
        try {
          const audioRecorder = new AudioRecorder();
          audioStream = await audioRecorder.startRecording({
            microphone: true,
            noiseCancellation: true,
            echoCancellation: true,
            deviceId: selectedAudioDevice || undefined,
          });
          audioRecorderRef.current = audioRecorder;
        } catch (err) {
          console.warn('Microphone access failed, streaming without audio:', err);
        }
      }

      // Combine video + audio tracks into one stream for the WHIP client
      const combinedStream = new MediaStream();
      if (videoStream) {
        videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        // If screen share ends (user clicks "Stop sharing"), handle it
        if (source === 'screen') {
          videoStream.getVideoTracks()[0]?.addEventListener('ended', () => {
            stopCurrentStream();
            setHasStarted(false);
            setError('Screen share ended.');
          });
        }
      }
      if (audioStream) {
        audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      }

      if (combinedStream.getTracks().length === 0) {
        setError('No video or audio sources available. Please allow at least one.');
        setIsLoading(false);
        return;
      }

      streamRef.current = combinedStream;
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
      }

      // Re-enumerate devices to get labels (permissions now granted)
      await loadDevices();
      setHasStarted(true);
    } catch (err) {
      console.error('Error starting preview:', err);
      if (err instanceof Error) {
        if (err.name === 'NotReadableError') {
          setError('Device is already in use by another application.');
        } else {
          setError(`Failed to start preview: ${err.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isVideoEnabled, isAudioEnabled, selectedVideoDevice, selectedAudioDevice, selectedQuality, stopCurrentStream, loadDevices]);

  // Restart preview when device or quality changes (only if already started)
  useEffect(() => {
    if (hasStarted) {
      startPreview(videoSource);
    }
    return () => {
      if (!hasStarted) return;
      stopCurrentStream();
    };
  }, [selectedVideoDevice, selectedAudioDevice, selectedQuality]);

  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => { track.enabled = !isVideoEnabled; });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => { track.enabled = !isAudioEnabled; });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleStartStreaming = () => {
    if (streamRef.current) {
      onStartStreaming(streamRef.current);
    }
  };

  const handleStopPreview = () => {
    stopCurrentStream();
    setHasStarted(false);
    onStopPreview();
  };

  const handleSourceChange = (source: VideoSource) => {
    setVideoSource(source);
    if (hasStarted) {
      startPreview(source);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Source Selection — shown before starting */}
      {!hasStarted && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Choose Video Source</CardTitle>
            <CardDescription>Select how you want to stream</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant={videoSource === 'screen' ? 'default' : 'outline'}
                className={`h-auto py-6 flex flex-col items-center gap-3 ${videoSource === 'screen' ? 'bg-brand-primary hover:bg-primary-dark text-white' : ''}`}
                onClick={() => setVideoSource('screen')}
              >
                <ScreenShare className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-semibold">Share Screen</p>
                  <p className="text-xs opacity-80 mt-1">Share your IDE, browser, or desktop</p>
                </div>
              </Button>
              <Button
                variant={videoSource === 'camera' ? 'default' : 'outline'}
                className={`h-auto py-6 flex flex-col items-center gap-3 ${videoSource === 'camera' ? 'bg-brand-primary hover:bg-primary-dark text-white' : ''}`}
                onClick={() => setVideoSource('camera')}
              >
                <Camera className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-semibold">Camera</p>
                  <p className="text-xs opacity-80 mt-1">Stream from your webcam</p>
                </div>
              </Button>
            </div>
            <Button
              onClick={() => startPreview(videoSource)}
              disabled={isLoading}
              className="w-full mt-4 bg-brand-primary hover:bg-primary-dark text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting preview...
                </>
              ) : (
                <>
                  {videoSource === 'screen' ? <ScreenShare className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  Start Preview
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Video Preview — shown after starting */}
      {hasStarted && (
        <>
          <Card className="border-border overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stream Preview</CardTitle>
                  <CardDescription>
                    {videoSource === 'screen' ? 'Screen share' : 'Camera'} preview — check before going live
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {videoSource === 'screen' ? <ScreenShare className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {videoSource === 'screen' ? 'Screen' : 'Camera'}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    {selectedQuality}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-black aspect-video">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
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
                  className="w-full h-full object-contain"
                />

                {!isVideoEnabled && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                    <div className="flex flex-col items-center gap-2">
                      <VideoOff className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Video is off</p>
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
                      disabled={isLoading}
                      className="h-12 w-12 rounded-full"
                      title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                    >
                      {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant={isAudioEnabled ? "secondary" : "destructive"}
                      size="icon"
                      onClick={handleToggleAudio}
                      disabled={isLoading}
                      className="h-12 w-12 rounded-full"
                      title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>

                    {/* Switch source while previewing */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleSourceChange(videoSource === 'screen' ? 'camera' : 'screen')}
                      disabled={isLoading}
                      className="h-12 w-12 rounded-full"
                      title={videoSource === 'screen' ? 'Switch to camera' : 'Switch to screen share'}
                    >
                      {videoSource === 'screen' ? <Camera className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
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
              {/* Camera Selection — only show for camera source */}
              {videoSource === 'camera' && (
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
              )}

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
                    <SelectItem value="720p">720p (1280x720, 30fps) — Recommended</SelectItem>
                    <SelectItem value="1080p">1080p (1920x1080, 30fps) — High Quality</SelectItem>
                    <SelectItem value="1440p">1440p (2560x1440, 30fps) — Ultra HD</SelectItem>
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
            <Button variant="outline" onClick={handleStopPreview} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStartStreaming}
              disabled={isLoading || !streamRef.current}
              className="flex-1 bg-brand-primary hover:bg-primary-dark text-white"
            >
              Start Streaming
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
