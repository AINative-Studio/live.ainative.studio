import { getAuthToken } from './auth';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.ainative.studio/v1';

export type WebSocketMessageType =
  | 'chat_message'
  | 'viewer_join'
  | 'viewer_leave'
  | 'viewer_count'
  | 'stream_status'
  | 'system_message'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: string;
}

export interface ChatWebSocketMessage {
  id: string;
  streamId: string;
  userId: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  content: string;
  messageType: string;
  badges: { type: string; label: string }[];
  createdAt: string;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = () => void;

class StreamWebSocket {
  private ws: WebSocket | null = null;
  private streamId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(streamId: string): void {
    // Validate streamId
    if (!streamId || streamId.trim() === '') {
      console.error('[WebSocket] Cannot connect: streamId is required');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.streamId = streamId;
    const token = getAuthToken();
    const wsUrl = token
      ? `${WS_BASE_URL}/streams/${streamId}/chat/ws?token=${token}`
      : `${WS_BASE_URL}/streams/${streamId}/chat/ws`;

    console.log(`[WebSocket] Connecting to: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`[WebSocket] Connected to stream ${streamId}`);
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach((handler) => handler());
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.errorHandlers.forEach((handler) => handler(error));
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed');
      this.disconnectHandlers.forEach((handler) => handler());
      this.attemptReconnect();
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      return;
    }

    if (!this.streamId) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.streamId) {
        this.connect(this.streamId);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.streamId = null;
    this.reconnectAttempts = 0;
  }

  sendMessage(content: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send message: not connected');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'chat_message',
      content,
    }));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.push(handler);
    return () => {
      this.connectHandlers = this.connectHandlers.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter((h) => h !== handler);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const streamWebSocket = new StreamWebSocket();
export default streamWebSocket;

// Export WebSocketClient for performance testing
export { WebSocketClient } from './websocket-client';
