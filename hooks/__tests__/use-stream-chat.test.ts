import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamChat } from '../use-stream-chat';
import streamWebSocket from '@/lib/websocket';
import { chatService } from '@/services/chat';

// Mock dependencies
jest.mock('@/lib/websocket', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    onMessage: jest.fn(() => jest.fn()),
    onConnect: jest.fn(() => jest.fn()),
    onDisconnect: jest.fn(() => jest.fn()),
    onError: jest.fn(() => jest.fn()),
  },
}));

jest.mock('@/services/chat', () => ({
  chatService: {
    getHistory: jest.fn(),
  },
}));

describe('useStreamChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Edge Cases - Invalid streamId', () => {
    it('should not connect when streamId is empty string', () => {
      renderHook(() => useStreamChat({ streamId: '' }));

      expect(streamWebSocket.connect).not.toHaveBeenCalled();
      expect(streamWebSocket.onMessage).not.toHaveBeenCalled();
      expect(streamWebSocket.onConnect).not.toHaveBeenCalled();
      expect(streamWebSocket.onDisconnect).not.toHaveBeenCalled();
      expect(streamWebSocket.onError).not.toHaveBeenCalled();
    });

    it('should not connect when streamId is whitespace only', () => {
      renderHook(() => useStreamChat({ streamId: '   ' }));

      expect(streamWebSocket.connect).not.toHaveBeenCalled();
      expect(streamWebSocket.onMessage).not.toHaveBeenCalled();
    });

    it('should return initial state when streamId is empty', () => {
      const { result } = renderHook(() => useStreamChat({ streamId: '' }));

      expect(result.current.messages).toEqual([]);
      expect(result.current.viewerCount).toBe(0);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isLoadingHistory).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should not attempt to send message when streamId is empty', () => {
      const { result } = renderHook(() => useStreamChat({ streamId: '' }));

      act(() => {
        result.current.sendMessage('test message');
      });

      expect(streamWebSocket.sendMessage).not.toHaveBeenCalled();
    });

    it('should not load history when streamId is empty', async () => {
      const { result } = renderHook(() => useStreamChat({ streamId: '' }));

      await act(async () => {
        await result.current.loadHistory();
      });

      expect(chatService.getHistory).not.toHaveBeenCalled();
      expect(result.current.isLoadingHistory).toBe(false);
    });

    it('should reset state when streamId changes from valid to empty', () => {
      const { result, rerender } = renderHook(
        ({ streamId }) => useStreamChat({ streamId }),
        { initialProps: { streamId: 'stream-123' } }
      );

      // Rerender with empty streamId
      rerender({ streamId: '' });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.viewerCount).toBe(0);
      expect(result.current.error).toBeNull();
      expect(streamWebSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Valid streamId', () => {
    it('should connect when streamId is valid', () => {
      renderHook(() => useStreamChat({ streamId: 'stream-123' }));

      expect(streamWebSocket.connect).toHaveBeenCalledWith('stream-123');
      expect(streamWebSocket.onMessage).toHaveBeenCalled();
      expect(streamWebSocket.onConnect).toHaveBeenCalled();
      expect(streamWebSocket.onDisconnect).toHaveBeenCalled();
      expect(streamWebSocket.onError).toHaveBeenCalled();
    });

    it('should allow sending messages when streamId is valid', () => {
      const { result } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      act(() => {
        result.current.sendMessage('Hello World');
      });

      expect(streamWebSocket.sendMessage).toHaveBeenCalledWith('Hello World');
    });

    it('should not send empty messages', () => {
      const { result } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      act(() => {
        result.current.sendMessage('   ');
      });

      expect(streamWebSocket.sendMessage).not.toHaveBeenCalled();
    });

    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      unmount();

      expect(streamWebSocket.disconnect).toHaveBeenCalled();
    });

    it('should reconnect when streamId changes', () => {
      const { rerender } = renderHook(
        ({ streamId }) => useStreamChat({ streamId }),
        { initialProps: { streamId: 'stream-123' } }
      );

      expect(streamWebSocket.connect).toHaveBeenCalledWith('stream-123');

      // Change streamId
      rerender({ streamId: 'stream-456' });

      expect(streamWebSocket.disconnect).toHaveBeenCalled();
      expect(streamWebSocket.connect).toHaveBeenCalledWith('stream-456');
    });
  });

  describe('loadHistory', () => {
    it('should load chat history when streamId is valid', async () => {
      const mockHistory = [
        {
          id: 'msg-1',
          streamId: 'stream-123',
          userId: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          avatar: null,
          content: 'Hello',
          messageType: 'chat',
          badges: [],
          isDeleted: false,
          createdAt: new Date().toISOString(),
        },
      ];

      (chatService.getHistory as jest.Mock).mockResolvedValue(mockHistory);

      const { result } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      await act(async () => {
        await result.current.loadHistory();
      });

      expect(chatService.getHistory).toHaveBeenCalledWith(
        'stream-123',
        undefined,
        50
      );

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockHistory);
      });
    });

    it('should handle history load errors gracefully', async () => {
      (chatService.getHistory as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      await act(async () => {
        await result.current.loadHistory();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load chat history');
        expect(result.current.isLoadingHistory).toBe(false);
      });
    });

    it('should not load history if already loading', async () => {
      (chatService.getHistory as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { result } = renderHook(() =>
        useStreamChat({ streamId: 'stream-123' })
      );

      // Trigger first load
      act(() => {
        result.current.loadHistory();
      });

      // Trigger second load immediately
      await act(async () => {
        await result.current.loadHistory();
      });

      // Should only be called once
      expect(chatService.getHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('initialMessages', () => {
    it('should initialize with provided messages', () => {
      const initialMessages = [
        {
          id: 'msg-1',
          streamId: 'stream-123',
          userId: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          avatar: null,
          content: 'Hello',
          messageType: 'chat' as const,
          badges: [],
          isDeleted: false,
          createdAt: new Date().toISOString(),
        },
      ];

      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'stream-123',
          initialMessages
        })
      );

      expect(result.current.messages).toEqual(initialMessages);
    });
  });
});
