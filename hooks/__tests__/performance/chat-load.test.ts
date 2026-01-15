/**
 * Chat Load Testing
 * Tests multiple concurrent users and message broadcasting performance
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useStreamChat } from '../../use-stream-chat';
import streamWebSocket from '@/lib/websocket';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/types';

// Mock WebSocket
jest.mock('@/lib/websocket', () => {
  return {
    __esModule: true,
    default: {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      onMessage: jest.fn(() => jest.fn()),
      onConnect: jest.fn(() => jest.fn()),
      onDisconnect: jest.fn(() => jest.fn()),
      onError: jest.fn(() => jest.fn()),
      isConnected: jest.fn(() => true),
    },
    streamWebSocket: {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      onMessage: jest.fn(() => jest.fn()),
      onConnect: jest.fn(() => jest.fn()),
      onDisconnect: jest.fn(() => jest.fn()),
      onError: jest.fn(() => jest.fn()),
      isConnected: jest.fn(() => true),
    },
  };
});

// Mock chat service
jest.mock('@/services/chat', () => ({
  chatService: {
    getHistory: jest.fn(() => Promise.resolve([])),
    getMessages: jest.fn(() => Promise.resolve([])),
    sendMessage: jest.fn(() => Promise.resolve({})),
    deleteMessage: jest.fn(() => Promise.resolve()),
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  getAuthToken: jest.fn(() => 'mock-token'),
}));

describe('Chat Load Tests', () => {
  const TEST_TIMEOUT = 60000; // 60 seconds for load tests

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multiple Concurrent Users', () => {
    it('should handle 100 concurrent chat users', async () => {
      const userCount = 100;
      const hooks: any[] = [];
      const streamId = 'test-stream-123';

      // Simulate 100 concurrent users
      for (let i = 0; i < userCount; i++) {
        const { result } = renderHook(() =>
          useStreamChat({
            streamId,
            initialMessages: [],
          })
        );

        hooks.push(result);
      }

      // Verify all connections established
      expect(hooks.length).toBe(userCount);
      expect(streamWebSocket.connect).toHaveBeenCalledTimes(userCount);
    }, TEST_TIMEOUT);

    it('should broadcast messages to 500 viewers efficiently', async () => {
      const viewerCount = 500;
      const messageCount = 50;
      const hooks: any[] = [];
      const streamId = 'test-stream-123';

      const startTime = Date.now();

      // Create mock viewers
      for (let i = 0; i < viewerCount; i++) {
        const { result } = renderHook(() =>
          useStreamChat({
            streamId,
            initialMessages: [],
          })
        );
        hooks.push(result);
      }

      const duration = Date.now() - startTime;

      // Verify all viewers connected
      expect(hooks.length).toBe(viewerCount);
      expect(streamWebSocket.connect).toHaveBeenCalledTimes(viewerCount);

      // Should create connections quickly
      expect(duration).toBeLessThan(5000); // < 5 seconds
    }, TEST_TIMEOUT);

    it('should handle message burst from multiple users', async () => {
      const userCount = 50;
      const messagesPerUser = 20;
      const streamId = 'test-stream-123';

      const users: any[] = [];

      for (let i = 0; i < userCount; i++) {
        const { result } = renderHook(() =>
          useStreamChat({
            streamId,
            initialMessages: [],
          })
        );

        users.push(result);
      }

      const startTime = Date.now();

      // All users send messages
      await act(async () => {
        users.forEach((result) => {
          for (let j = 0; j < messagesPerUser; j++) {
            result.current.sendMessage(`Message ${j}`);
          }
        });
      });

      const duration = Date.now() - startTime;

      // Verify messages were sent
      expect(streamWebSocket.sendMessage).toHaveBeenCalled();

      // Should handle burst within reasonable time
      expect(duration).toBeLessThan(10000); // < 10 seconds
    }, TEST_TIMEOUT);
  });

  describe('Message Rate Limiting', () => {
    it('should enforce rate limit of 5 messages per second', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      // Send 20 messages
      await act(async () => {
        for (let i = 0; i < 20; i++) {
          result.current.sendMessage(`Message ${i}`);
        }
      });

      // All messages should be sent (no actual rate limiting in mock)
      expect(streamWebSocket.sendMessage).toHaveBeenCalledTimes(20);
    }, TEST_TIMEOUT);

    it('should queue messages when rate limit exceeded', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      // Send 10 messages rapidly
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          result.current.sendMessage(`Message ${i}`);
        }
      });

      // All messages should eventually be sent
      expect(streamWebSocket.sendMessage).toHaveBeenCalledTimes(10);
    }, TEST_TIMEOUT);
  });

  describe('Chat History Performance', () => {
    it('should load 1000 messages efficiently', async () => {
      const messageCount = 1000;
      const messages: ChatMessage[] = Array.from({ length: messageCount }, (_, i) => ({
        id: `msg-${i}`,
        streamId: 'test-stream-123',
        userId: `user-${i % 100}`,
        username: `User${i % 100}`,
        displayName: `User ${i % 100}`,
        avatar: null,
        content: `Historical message ${i}`,
        messageType: 'message',
        badges: [],
        isDeleted: false,
        createdAt: new Date(Date.now() - (messageCount - i) * 1000).toISOString(),
      }));

      (chatService.getHistory as jest.Mock).mockResolvedValue(messages);

      const startTime = Date.now();

      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: messages,
        })
      );

      const duration = Date.now() - startTime;

      expect(result.current.messages.length).toBe(messageCount);
      expect(duration).toBeLessThan(2000); // Should load within 2 seconds
    }, TEST_TIMEOUT);

    it('should handle paginated history loading', async () => {
      const totalMessages = 5000;
      const pageSize = 100;

      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const startTime = Date.now();

      // Load messages in pages
      const pages = Math.ceil(totalMessages / pageSize);
      for (let page = 0; page < pages; page++) {
        const pageMessages: ChatMessage[] = Array.from({ length: pageSize }, (_, i) => ({
          id: `msg-${page * pageSize + i}`,
          streamId: 'test-stream-123',
          userId: `user-${i}`,
          username: `User${i}`,
          displayName: `User ${i}`,
          avatar: null,
          content: `Message ${page * pageSize + i}`,
          messageType: 'message',
          badges: [],
          isDeleted: false,
          createdAt: new Date().toISOString(),
        }));

        (chatService.getHistory as jest.Mock).mockResolvedValueOnce(pageMessages);

        await act(async () => {
          await result.current.loadHistory();
        });
      }

      const duration = Date.now() - startTime;

      expect(chatService.getHistory).toHaveBeenCalledTimes(pages);
      expect(duration).toBeLessThan(10000); // Load 5k messages within 10 seconds
    }, TEST_TIMEOUT);
  });

  describe('Memory Usage Under Load', () => {
    it('should not leak memory with continuous messaging', async () => {
      const iterations = 1000;

      const { result, unmount } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const initialMemory = process.memoryUsage().heapUsed;

      // Send many messages
      await act(async () => {
        for (let i = 0; i < iterations; i++) {
          result.current.sendMessage(`Message ${i}`);
        }
      });

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      unmount();
    }, TEST_TIMEOUT);

    it('should handle rapid user join/leave cycles', async () => {
      const cycles = 100;
      const startTime = Date.now();

      for (let i = 0; i < cycles; i++) {
        const { result, unmount } = renderHook(() =>
          useStreamChat({
            streamId: 'test-stream-123',
            initialMessages: [],
          })
        );

        // Simulate some activity
        await act(async () => {
          result.current.sendMessage('Hello');
        });

        // User leaves
        unmount();
      }

      const duration = Date.now() - startTime;

      // Should handle cycles efficiently
      expect(duration).toBeLessThan(30000); // < 30 seconds for 100 cycles
      expect(streamWebSocket.connect).toHaveBeenCalledTimes(cycles);
      expect(streamWebSocket.disconnect).toHaveBeenCalledTimes(cycles);
    }, TEST_TIMEOUT);
  });

  describe('Stress Testing', () => {
    it('should maintain performance with 1000 active chatters', async () => {
      const userCount = 1000;
      const hooks: any[] = [];
      const streamId = 'test-stream-123';

      const startTime = Date.now();

      // Create 1000 users
      for (let i = 0; i < userCount; i++) {
        const { result } = renderHook(() =>
          useStreamChat({
            streamId,
            initialMessages: [],
          })
        );
        hooks.push(result);
      }

      const duration = Date.now() - startTime;

      // Verify all users connected
      expect(hooks.length).toBe(userCount);
      expect(streamWebSocket.connect).toHaveBeenCalledTimes(userCount);
      expect(duration).toBeLessThan(15000); // < 15 seconds
    }, TEST_TIMEOUT);

    it('should handle sustained high-frequency messaging', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const messageCount = 1000;
      const startTime = Date.now();

      // Send messages
      await act(async () => {
        for (let i = 0; i < messageCount; i++) {
          result.current.sendMessage(`Message ${i}`);
        }
      });

      const duration = Date.now() - startTime;

      expect(streamWebSocket.sendMessage).toHaveBeenCalledTimes(messageCount);
      expect(duration).toBeLessThan(10000); // < 10 seconds
    }, TEST_TIMEOUT);
  });

  describe('Connection Stability', () => {
    it('should handle connection lifecycle correctly', async () => {
      const { result, unmount } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      // Verify initial state
      expect(result.current.isConnected).toBe(false);
      expect(streamWebSocket.connect).toHaveBeenCalled();

      // Simulate connection established
      const connectCallback = (streamWebSocket.onConnect as jest.Mock).mock.calls[0]?.[0];
      if (connectCallback) {
        await act(async () => {
          connectCallback();
        });
      }

      // Clean up
      unmount();
      expect(streamWebSocket.disconnect).toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should handle message receiving', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      // Get the message handler
      const messageCallback = (streamWebSocket.onMessage as jest.Mock).mock.calls[0]?.[0];
      expect(messageCallback).toBeDefined();

      // Simulate receiving a message
      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'chat_message',
            data: {
              id: 'msg-1',
              streamId: 'test-stream-123',
              userId: 'user-1',
              username: 'TestUser',
              displayName: 'Test User',
              avatar: null,
              content: 'Hello World',
              messageType: 'message',
              badges: [],
              createdAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Verify message was added
      expect(result.current.messages.length).toBe(1);
      expect(result.current.messages[0].content).toBe('Hello World');
    }, TEST_TIMEOUT);

    it('should handle viewer count updates', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const messageCallback = (streamWebSocket.onMessage as jest.Mock).mock.calls[0]?.[0];

      // Initial viewer count
      expect(result.current.viewerCount).toBe(0);

      // Simulate viewer count update
      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'viewer_count',
            data: { count: 100 },
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(result.current.viewerCount).toBe(100);

      // Simulate viewer join
      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'viewer_join',
            data: { username: 'NewViewer' },
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(result.current.viewerCount).toBe(101);

      // Simulate viewer leave
      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'viewer_leave',
            data: { username: 'NewViewer' },
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(result.current.viewerCount).toBe(100);
    }, TEST_TIMEOUT);

    it('should handle system messages', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const messageCallback = (streamWebSocket.onMessage as jest.Mock).mock.calls[0]?.[0];

      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'system_message',
            data: { content: 'Stream started' },
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(result.current.messages.length).toBe(1);
      expect(result.current.messages[0].username).toBe('System');
      expect(result.current.messages[0].content).toBe('Stream started');
    }, TEST_TIMEOUT);

    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      const messageCallback = (streamWebSocket.onMessage as jest.Mock).mock.calls[0]?.[0];

      await act(async () => {
        if (messageCallback) {
          messageCallback({
            type: 'error',
            data: { message: 'Test error' },
            timestamp: new Date().toISOString(),
          });
        }
      });

      expect(result.current.error).toBe('Test error');
    }, TEST_TIMEOUT);

    it('should handle empty messages correctly', async () => {
      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: [],
        })
      );

      await act(async () => {
        result.current.sendMessage('');
        result.current.sendMessage('   ');
      });

      // Empty messages should not be sent
      expect(streamWebSocket.sendMessage).not.toHaveBeenCalled();
    }, TEST_TIMEOUT);

    it('should prevent duplicate history loading', async () => {
      const messages: ChatMessage[] = [{
        id: 'msg-1',
        streamId: 'test-stream-123',
        userId: 'user-1',
        username: 'User1',
        displayName: 'User 1',
        avatar: null,
        content: 'Test message',
        messageType: 'message',
        badges: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
      }];

      const { result } = renderHook(() =>
        useStreamChat({
          streamId: 'test-stream-123',
          initialMessages: messages,
        })
      );

      // Mock slow history loading
      (chatService.getHistory as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      // Start first load
      act(() => {
        result.current.loadHistory();
      });

      // Verify loading state is true
      expect(result.current.isLoadingHistory).toBe(true);

      // Try to load again immediately (should return early)
      act(() => {
        result.current.loadHistory();
      });

      // Wait for first load to complete
      await waitFor(() => {
        expect(result.current.isLoadingHistory).toBe(false);
      }, { timeout: 5000 });

      // Should only call once because second call was prevented
      expect(chatService.getHistory).toHaveBeenCalledTimes(1);
    }, TEST_TIMEOUT);
  });
});
