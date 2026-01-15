/**
 * WebSocketClient - Performance-testable WebSocket implementation
 * This class provides a WebSocket client with event emitter pattern
 * for comprehensive performance testing.
 */

import { EventEmitter } from 'events';

export interface WebSocketClientOptions {
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  autoReconnect?: boolean;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManualClose = false;
  public eventEmitter: EventEmitter;

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super();
    this.url = url;
    this.options = {
      reconnectInterval: 1000,
      maxReconnectAttempts: 5,
      autoReconnect: true,
      ...options,
    };
    this.eventEmitter = new EventEmitter();
    // Increase max listeners to avoid warnings during tests
    this.eventEmitter.setMaxListeners(200);
    this.setMaxListeners(200);
    this.connect();
  }

  private connect(): void {
    try {
      const wsUrl = this.options.token
        ? `${this.url}?token=${this.options.token}`
        : this.url;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('open');
        this.eventEmitter.emit('open');
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
          this.eventEmitter.emit('message', data);

          // Emit specific event types if available
          if (data.type) {
            this.emit(data.type, data.data || data);
            this.eventEmitter.emit(data.type, data.data || data);
          }
        } catch (error) {
          console.error('[WebSocketClient] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error: Event) => {
        this.emit('error', error);
        this.eventEmitter.emit('error', error);
      };

      this.ws.onclose = () => {
        this.emit('close');
        this.eventEmitter.emit('close');

        if (!this.isManualClose && this.options.autoReconnect) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('[WebSocketClient] Connection error:', error);
      this.emit('error', error);
    }
  }

  private attemptReconnect(): void {
    if (
      this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)
    ) {
      console.log('[WebSocketClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay =
      (this.options.reconnectInterval || 1000) *
      Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[WebSocketClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public send(type: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocketClient] Cannot send message: not connected');
      return;
    }

    const message = JSON.stringify({ type, data });
    this.ws.send(message);
  }

  public close(): void {
    this.isManualClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Clean up all event listeners
    this.removeAllListeners();
    this.eventEmitter.removeAllListeners();
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public getReadyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}
