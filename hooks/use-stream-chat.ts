'use client';

import { useState, useEffect, useCallback } from 'react';
import streamWebSocket, { WebSocketMessage, ChatWebSocketMessage } from '@/lib/websocket';
import { chatService } from '@/services/chat';
import type { ChatMessage } from '@/types';

interface UseStreamChatOptions {
  streamId: string;
  initialMessages?: ChatMessage[];
}

interface UseStreamChatReturn {
  messages: ChatMessage[];
  viewerCount: number;
  isConnected: boolean;
  sendMessage: (content: string) => void;
  loadHistory: () => Promise<void>;
  isLoadingHistory: boolean;
  error: string | null;
}

export function useStreamChat({ streamId, initialMessages = [] }: UseStreamChatOptions): UseStreamChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    streamWebSocket.connect(streamId);

    const unsubMessage = streamWebSocket.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'chat_message':
          const chatMsg = message.data as ChatWebSocketMessage;
          setMessages((prev) => [...prev, {
            id: chatMsg.id,
            streamId: chatMsg.streamId,
            userId: chatMsg.userId,
            username: chatMsg.username,
            displayName: chatMsg.displayName,
            avatar: chatMsg.avatar,
            content: chatMsg.content,
            messageType: chatMsg.messageType as any,
            badges: chatMsg.badges as any,
            isDeleted: false,
            createdAt: chatMsg.createdAt,
          }]);
          break;

        case 'viewer_count':
          setViewerCount(message.data.count);
          break;

        case 'viewer_join':
          setViewerCount((prev) => prev + 1);
          break;

        case 'viewer_leave':
          setViewerCount((prev) => Math.max(0, prev - 1));
          break;

        case 'system_message':
          setMessages((prev) => [...prev, {
            id: `system-${Date.now()}`,
            streamId,
            userId: null,
            username: 'System',
            displayName: 'System',
            avatar: null,
            content: message.data.content,
            messageType: 'system',
            badges: [],
            isDeleted: false,
            createdAt: message.timestamp,
          }]);
          break;

        case 'error':
          setError(message.data.message);
          break;
      }
    });

    const unsubConnect = streamWebSocket.onConnect(() => {
      setIsConnected(true);
      setError(null);
    });

    const unsubDisconnect = streamWebSocket.onDisconnect(() => {
      setIsConnected(false);
    });

    const unsubError = streamWebSocket.onError(() => {
      setError('Connection error');
    });

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
      unsubError();
      streamWebSocket.disconnect();
    };
  }, [streamId]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    streamWebSocket.sendMessage(content);
  }, []);

  // Load chat history
  const loadHistory = useCallback(async () => {
    if (isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const oldestMessage = messages[0];
      const history = await chatService.getHistory(
        streamId,
        oldestMessage?.createdAt,
        50
      );
      setMessages((prev) => [...history, ...prev]);
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [streamId, messages, isLoadingHistory]);

  return {
    messages,
    viewerCount,
    isConnected,
    sendMessage,
    loadHistory,
    isLoadingHistory,
    error,
  };
}
