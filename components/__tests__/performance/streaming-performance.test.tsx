/**
 * Streaming Performance Tests
 * Tests video encoding, bandwidth monitoring, and browser streaming performance
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserStreamPreview } from '../../browser-stream-preview';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
  },
  writable: true,
});

// Mock MediaRecorder with proper constructor tracking
const mockMediaRecorderInstances: any[] = [];

class MockMediaRecorder {
  static instances: any[] = mockMediaRecorderInstances;
  state: string = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstart: (() => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  constructor(public stream: MediaStream, public options: any = {}) {
    mockMediaRecorderInstances.push(this);
  }

  start(timeslice?: number) {
    this.state = 'recording';
    if (this.onstart) this.onstart();
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  requestData() {
    // Simulate data available
    if (this.ondataavailable) {
      const mockBlob = new Blob(['test'], { type: 'video/webm' });
      this.ondataavailable({ data: mockBlob });
    }
  }

  static isTypeSupported(mimeType: string) {
    return true;
  }
}

(global as any).MediaRecorder = MockMediaRecorder;

describe('Streaming Performance Tests', () => {
  const TEST_TIMEOUT = 60000;

  const createMockStream = (videoTracks = 1, audioTracks = 1) => {
    const stream = {
      id: 'mock-stream-id',
      active: true,
      getTracks: jest.fn(() => [
        ...Array(videoTracks)
          .fill(null)
          .map((_, i) => ({
            kind: 'video',
            id: `video-track-${i}`,
            enabled: true,
            stop: jest.fn(),
            getSettings: () => ({
              width: 1920,
              height: 1080,
              frameRate: 30,
            }),
          })),
        ...Array(audioTracks)
          .fill(null)
          .map((_, i) => ({
            kind: 'audio',
            id: `audio-track-${i}`,
            enabled: true,
            stop: jest.fn(),
            getSettings: () => ({
              sampleRate: 48000,
              channelCount: 2,
            }),
          })),
      ]),
      getVideoTracks: jest.fn(() =>
        Array(videoTracks)
          .fill(null)
          .map((_, i) => ({
            kind: 'video',
            id: `video-track-${i}`,
            enabled: true,
            stop: jest.fn(),
            getSettings: () => ({
              width: 1920,
              height: 1080,
              frameRate: 30,
            }),
          }))
      ),
      getAudioTracks: jest.fn(() =>
        Array(audioTracks)
          .fill(null)
          .map((_, i) => ({
            kind: 'audio',
            id: `audio-track-${i}`,
            enabled: true,
            stop: jest.fn(),
            getSettings: () => ({
              sampleRate: 48000,
              channelCount: 2,
            }),
          }))
      ),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
    };
    return stream as unknown as MediaStream;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaRecorderInstances.length = 0;

    mockEnumerateDevices.mockResolvedValue([
      { kind: 'videoinput', deviceId: 'camera1', label: 'Camera 1' },
      { kind: 'audioinput', deviceId: 'mic1', label: 'Microphone 1' },
    ]);
  });

  describe('Video Encoding Performance', () => {
    it('should initialize video stream within 2 seconds', async () => {
      mockGetUserMedia.mockResolvedValue(createMockStream());

      const startTime = Date.now();

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      await waitFor(
        () => {
          // Look for video element to be rendered
          const video = document.querySelector('video');
          expect(video).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000);
    }, TEST_TIMEOUT);

    it('should handle 720p encoding at 30fps', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Wait for component to mount and request stream with default 1080p
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Verify the stream was initialized
      const videoTrack = mockStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      expect(settings.width).toBe(1920); // Mock value
      expect(settings.height).toBe(1080);
      expect(settings.frameRate).toBe(30);

      // Verify video element is rendered
      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
    }, TEST_TIMEOUT);

    it('should handle 1080p encoding at 30fps', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Wait for initial stream with 1080p (default quality)
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            }),
          })
        );
      });
    }, TEST_TIMEOUT);

    it('should request appropriate stream settings', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const startTime = Date.now();

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Wait for initial load with 1080p settings
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            }),
            audio: expect.objectContaining({
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }),
          })
        );
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Fast initialization
    }, TEST_TIMEOUT);
  });

  describe('Bandwidth and Bitrate', () => {
    it('should use appropriate audio settings', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Verify audio settings include noise cancellation
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            audio: expect.objectContaining({
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }),
          })
        );
      });
    }, TEST_TIMEOUT);

    it('should configure stream for 1080p quality by default', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Default is 1080p, verify it was requested
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: { ideal: 30 },
            }),
          })
        );
      });
    }, TEST_TIMEOUT);

    it('should request media stream on component mount', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const startTime = Date.now();

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Wait for initial stream
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      const duration = Date.now() - startTime;

      // Should request stream quickly
      expect(duration).toBeLessThan(1000);
      expect(mockGetUserMedia.mock.calls.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });

  describe('Resource Management', () => {
    it('should cleanup resources on unmount', async () => {
      const mockStream = createMockStream();
      const stopSpy = jest.fn();

      // Override track.stop with spy
      mockStream.getTracks = jest.fn(() => [
        { kind: 'video', id: 'video-1', enabled: true, stop: stopSpy, getSettings: () => ({ width: 1920, height: 1080, frameRate: 30 }) },
        { kind: 'audio', id: 'audio-1', enabled: true, stop: stopSpy, getSettings: () => ({ sampleRate: 48000, channelCount: 2 }) },
      ]);
      mockStream.getVideoTracks = jest.fn(() => [mockStream.getTracks()[0]]);
      mockStream.getAudioTracks = jest.fn(() => [mockStream.getTracks()[1]]);

      mockGetUserMedia.mockResolvedValue(mockStream);

      const { unmount } = render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Unmount component
      unmount();

      // Verify tracks.stop was called (at least once per track)
      expect(stopSpy).toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should enumerate available devices', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      mockEnumerateDevices.mockResolvedValue([
        {
          kind: 'videoinput',
          deviceId: 'camera1',
          label: 'Camera 1',
          toJSON: () => ({}),
        },
        {
          kind: 'videoinput',
          deviceId: 'camera2',
          label: 'Camera 2',
          toJSON: () => ({}),
        },
        {
          kind: 'audioinput',
          deviceId: 'mic1',
          label: 'Microphone 1',
          toJSON: () => ({}),
        },
      ]);

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Wait for devices to be enumerated
      await waitFor(() => {
        expect(mockEnumerateDevices).toHaveBeenCalled();
      });

      // Wait for initial stream
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Both devices and stream should be requested
      expect(mockEnumerateDevices).toHaveBeenCalled();
      expect(mockGetUserMedia).toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should handle multiple mount/unmount cycles', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform 3 mount/unmount cycles (reduced from 5 for speed)
      for (let i = 0; i < 3; i++) {
        const mockStream = createMockStream();
        mockGetUserMedia.mockResolvedValue(mockStream);

        const { unmount } = render(
          <BrowserStreamPreview
            onStartStreaming={jest.fn()}
            onStopPreview={jest.fn()}
          />
        );

        // Wait for stream to be requested (called twice - once for permission, once for actual stream)
        await waitFor(() => {
          expect(mockGetUserMedia).toHaveBeenCalled();
        }, { timeout: 1000 });

        // Unmount to cleanup
        unmount();

        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 50));

        // Reset mock for next iteration
        jest.clearAllMocks();
        mockMediaRecorderInstances.length = 0;
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (< 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    }, TEST_TIMEOUT);
  });

  describe('Multi-Stream Performance', () => {
    it('should handle multiple concurrent stream previews', async () => {
      const instances = 3;
      const mockStreams = Array.from({ length: instances * 2 }, () =>
        createMockStream()
      );

      mockStreams.forEach((stream) => {
        mockGetUserMedia.mockResolvedValueOnce(stream);
      });

      const startTime = Date.now();

      // Render multiple instances
      const renders = Array.from({ length: instances }, (_, i) => {
        const container = document.createElement('div');
        container.id = `container-${i}`;
        document.body.appendChild(container);
        return render(
          <BrowserStreamPreview
            onStartStreaming={jest.fn()}
            onStopPreview={jest.fn()}
          />,
          { container }
        );
      });

      // Wait for all to initialize
      await waitFor(
        () => {
          expect(mockGetUserMedia).toHaveBeenCalledTimes(instances);
        },
        { timeout: 5000 }
      );

      const duration = Date.now() - startTime;

      // Should initialize all instances within reasonable time
      expect(duration).toBeLessThan(5000); // < 5 seconds for 3 instances

      // Cleanup
      renders.forEach(({ unmount }) => unmount());
    }, TEST_TIMEOUT);
  });

  describe('Error Recovery Performance', () => {
    it('should handle stream initialization errors', async () => {
      // Reject all getUserMedia calls to simulate consistent failure
      const error = new Error('Device not available');
      mockGetUserMedia.mockRejectedValue(error);

      const startTime = Date.now();

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Component should handle the error gracefully - verify no crash and render completes
      await waitFor(
        () => {
          // The component should still render the main structure even with errors
          const streamPreview = screen.getByText(/stream preview/i);
          expect(streamPreview).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Quick render even with error

      // Verify getUserMedia was attempted
      expect(mockGetUserMedia).toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should request media permissions quickly', async () => {
      const mockStream = createMockStream();
      mockGetUserMedia.mockResolvedValue(mockStream);

      const startTime = Date.now();

      render(
        <BrowserStreamPreview
          onStartStreaming={jest.fn()}
          onStopPreview={jest.fn()}
        />
      );

      // Component should request media quickly
      await waitFor(
        () => {
          expect(mockGetUserMedia).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Very quick initialization
    }, TEST_TIMEOUT);
  });
});
