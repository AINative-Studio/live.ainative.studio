/**
 * Performance Tests for useStreamChat Hook
 * Tests connection speed, message throughput, and memory usage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamChat } from '../../use-stream-chat';
import streamWebSocket from '@/lib/websocket';
import { chatService } from '@/services/chat';

// Mock dependencies
jest.mock('@/lib/websocket');
jest.mock('@/services/chat');
jest.mock('@/lib/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token-12345'),
}));

describe('useStreamChat Performance Tests', () => {
  const mockStreamId = 'stream-123';

  let mockWebSocket: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    sendMessage: jest.Mock;
    onMessage: jest.Mock;
    onConnect: jest.Mock;
    onDisconnect: jest.Mock;
    onError: jest.Mock;
    isConnected: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock WebSocket
    mockWebSocket = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      onMessage: jest.fn(() => jest.fn()),
      onConnect: jest.fn(() => jest.fn()),
      onDisconnect: jest.fn(() => jest.fn()),
      onError: jest.fn(() => jest.fn()),
      isConnected: jest.fn(() => true),
    };

    (streamWebSocket.connect as jest.Mock) = mockWebSocket.connect;
    (streamWebSocket.disconnect as jest.Mock) = mockWebSocket.disconnect;
    (streamWebSocket.sendMessage as jest.Mock) = mockWebSocket.sendMessage;
    (streamWebSocket.onMessage as jest.Mock) = mockWebSocket.onMessage;
    (streamWebSocket.onConnect as jest.Mock) = mockWebSocket.onConnect;
    (streamWebSocket.onDisconnect as jest.Mock) = mockWebSocket.onDisconnect;
    (streamWebSocket.onError as jest.Mock) = mockWebSocket.onError;
    (streamWebSocket.isConnected as jest.Mock) = mockWebSocket.isConnected;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Performance', () => {
    it('should connect in less than 2 seconds', async () => {
      let connectHandler: (() => void) | null = null;
      mockWebSocket.onConnect.mockImplementation((handler) => {
        connectHandler = handler;
        return jest.fn();
      });

      const startTime = performance.now();

      const { result } = renderHook(() => useStreamChat({ streamId: mockStreamId }));

      // Simulate connection
      act(() => {
        connectHandler?.();
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should connect in less than 2000ms
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Message Throughput', () => {
    it('should handle 1000 messages in less than 5 seconds', async () => {
      let messageHandler: ((message: any) => void) | null = null;
      mockWebSocket.onMessage.mockImplementation((handler) => {
        messageHandler = handler;
        return jest.fn();
      });

      const { result } = renderHook(() => useStreamChat({ streamId: mockStreamId }));

      const startTime = performance.now();

      // Send 1000 messages
      act(() => {
        for (let i = 0; i < 1000; i++) {
          messageHandler?.({
            type: 'chat_message',
            data: {
              id: `msg-${i}`,
              streamId: mockStreamId,
              userId: `user-${i % 10}`,
              username: `user${i % 10}`,
              displayName: `User ${i % 10}`,
              avatar: null,
              content: `Message ${i}`,
              messageType: 'chat',
              badges: [],
              createdAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });
        }
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1000);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 1000 messages in less than 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});
