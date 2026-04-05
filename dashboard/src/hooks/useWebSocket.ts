'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  agentId?: string;
}

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://194.195.215.135:3001',
    autoConnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setError(null);
        onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        setIsConnected(false);
        onDisconnect?.();
      });

      socket.on('connect_error', (err) => {
        console.error('[WebSocket] Connection error:', err);
        setError(err);
        onError?.(err);
      });

      socket.on('message', (data: WebSocketMessage) => {
        setLastMessage(data);
        onMessage?.(data);
      });

      socket.on('agent:update', (data) => {
        const message: WebSocketMessage = {
          type: 'agent:update',
          payload: data,
          timestamp: Date.now(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('activity:log', (data) => {
        const message: WebSocketMessage = {
          type: 'activity:log',
          payload: data,
          timestamp: Date.now(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('system:metrics', (data) => {
        const message: WebSocketMessage = {
          type: 'system:metrics',
          payload: data,
          timestamp: Date.now(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socketRef.current = socket;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      onError?.(error);
    }
  }, [url, onConnect, onDisconnect, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    send,
  };
}
