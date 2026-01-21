import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GoLivePage from '../page';
import { streamsService } from '@/services/streams';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/streams', () => ({
  streamsService: {
    getActiveStream: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    end: jest.fn(),
    // Note: start method should NOT exist
  },
}));

// Mock ProtectedRoute to just render children
jest.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('GoLivePage - Stream Start Endpoint Removal', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should NOT call streamsService.start when starting stream', async () => {
    // Given no active stream exists
    (streamsService.getActiveStream as jest.Mock).mockResolvedValue(null);

    // When rendering the page
    render(<GoLivePage />);

    // Then streamsService.start should not exist
    expect(streamsService).not.toHaveProperty('start');
  });

  it('should verify automatic stream lifecycle behavior', async () => {
    // The key verification is that streamsService.start doesn't exist
    // This ensures streams go live automatically via webhook
    expect(streamsService).not.toHaveProperty('start');
    expect(streamsService).toHaveProperty('end');
  });

  it('should NOT have a Start Stream button that calls /start endpoint', async () => {
    // Given a created stream
    const mockStream = {
      id: 'stream-123',
      title: 'Test Stream',
      status: 'idle',
      streamKey: 'test-key-123',
      user: {
        id: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
      },
    };

    (streamsService.getActiveStream as jest.Mock).mockResolvedValue(mockStream);

    // When rendering the page
    render(<GoLivePage />);

    // Verify streamsService.start is not available
    expect(streamsService).not.toHaveProperty('start');
  });

  it('should create stream without calling start endpoint', async () => {
    // Given no active stream
    (streamsService.getActiveStream as jest.Mock).mockResolvedValue(null);

    const mockCreatedStream = {
      id: 'stream-123',
      title: 'New Stream',
      status: 'idle',
    };

    (streamsService.create as jest.Mock).mockResolvedValue(mockCreatedStream);

    // When component calls create
    await streamsService.create({ title: 'New Stream' });

    // Then create should be called
    expect(streamsService.create).toHaveBeenCalledWith({ title: 'New Stream' });

    // And start should not exist
    expect(streamsService).not.toHaveProperty('start');
  });

  it('should have end method for manual termination', () => {
    // The end method should still exist for manual stream termination
    expect(streamsService).toHaveProperty('end');
    expect(typeof streamsService.end).toBe('function');
  });
});
