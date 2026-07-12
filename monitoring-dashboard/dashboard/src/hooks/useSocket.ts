// ============================================================
// Dashboard Monitoring — Socket.IO Connection Hook
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useMetricsStore } from '../store/metricsStore';
import type { MetricSnapshot, Alert, HistoryResponse } from '../types/metrics';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setConnectionStatus,
    updateMetrics,
    setHistory,
    addAlert,
    updateAlert,
    subscriptions,
  } = useMetricsStore();

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/live`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      // Subscribe to all categories on connect
      socket.emit('subscribe', { categories: ['system', 'app', 'db', 'business'] });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('reconnecting', () => {
      setConnectionStatus('reconnecting');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('metrics:update', (data: MetricSnapshot) => {
      updateMetrics(data);
    });

    socket.on('history:response', (data: HistoryResponse) => {
      setHistory(data);
    });

    socket.on('connection:status', (data: { status: string }) => {
      if (data.status === 'connected') {
        setConnectionStatus('connected');
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe/unsubscribe when subscriptions change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    socket.emit('subscribe', { categories: subscriptions });
  }, [subscriptions]);

  const requestHistory = useCallback(
    (category: string, metric: string, duration = '1h') => {
      socketRef.current?.emit('history:request', { category, metric, duration });
    },
    []
  );

  return {
    socket: socketRef,
    requestHistory,
  };
}

// Alerts namespace hook
export function useAlertsSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { addAlert, updateAlert } = useMetricsStore();

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/alerts`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('alert:new', (data: Alert) => {
      addAlert(data);
    });

    socket.on('alert:updated', (data: { id: string; status: 'acknowledged' | 'resolved' }) => {
      updateAlert(data.id, data.status);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const acknowledgeAlert = useCallback((alertId: string) => {
    socketRef.current?.emit('alert:acknowledge', { alertId });
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    socketRef.current?.emit('alert:resolve', { alertId });
  }, []);

  return { acknowledgeAlert, resolveAlert };
}
