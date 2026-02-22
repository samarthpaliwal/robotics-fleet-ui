/**
 * Pure service layer — zero React dependencies.
 * Handles: connection lifecycle, reconnect backoff,
 * heartbeat, message validation, cleanup.
 *
 * Design: This is intentionally framework-agnostic so it can be
 * unit tested independently and swapped for a different transport.
 */

import type { InboundMessage } from "../types/robot";

type MessageHandler = (msg: InboundMessage) => void;
type StatusHandler = (status: "connected" | "disconnected" | "error") => void;

interface WebSocketServiceOptions {
  url: string;
  onMessage: MessageHandler;
  onStatusChange: StatusHandler;
  reconnectBaseDelayMs?: number;
  maxReconnectDelayMs?: number;
  heartbeatIntervalMs?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  constructor(private readonly options: WebSocketServiceOptions) {}

  connect(): void {
    if (this.destroyed) return;

    const {
      url,
      onMessage,
      onStatusChange,
      reconnectBaseDelayMs = 1000,
      maxReconnectDelayMs = 30000,
      heartbeatIntervalMs = 15000,
    } = this.options;

    console.log(`[WS] Connecting to ${url} (attempt ${this.reconnectAttempt + 1})`);

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error("[WS] Failed to instantiate WebSocket:", err);
      onStatusChange("error");
      this.scheduleReconnect(reconnectBaseDelayMs, maxReconnectDelayMs);
      return;
    }

    this.ws.onopen = () => {
      console.log("[WS] Connected");
      this.reconnectAttempt = 0;
      onStatusChange("connected");
      this.startHeartbeat(heartbeatIntervalMs);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const parsed = this.parseMessage(event.data);
      if (parsed) onMessage(parsed);
    };

    this.ws.onclose = (event) => {
      console.warn(`[WS] Closed. Code: ${event.code}, Clean: ${event.wasClean}`);
      this.stopHeartbeat();
      onStatusChange("disconnected");
      if (!this.destroyed) {
        this.scheduleReconnect(reconnectBaseDelayMs, maxReconnectDelayMs);
      }
    };

    this.ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      onStatusChange("error");
    };
  }

  sendCommand(payload: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn("[WS] Cannot send — socket not open");
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.ws?.close(1000, "Component unmounted");
    this.ws = null;
    console.log("[WS] Service destroyed");
  }

  private parseMessage(raw: string): InboundMessage | null {
    try {
      const data = JSON.parse(raw) as InboundMessage;
      if (!data || typeof data !== "object" || !("type" in data)) {
        console.warn("[WS] Received malformed message:", raw);
        return null;
      }
      return data;
    } catch {
      console.warn("[WS] Failed to parse message:", raw);
      return null;
    }
  }

  private startHeartbeat(intervalMs: number): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
        console.debug("[WS] Ping sent");
      }
    }, intervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(baseDelay: number, maxDelay: number): void {
    this.clearReconnectTimer();
    const delay = Math.min(baseDelay * 2 ** this.reconnectAttempt, maxDelay);
    const jitter = Math.random() * 500;
    this.reconnectAttempt++;
    console.log(`[WS] Reconnecting in ${(delay + jitter).toFixed(0)}ms`);
    this.reconnectTimer = setTimeout(() => this.connect(), delay + jitter);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
