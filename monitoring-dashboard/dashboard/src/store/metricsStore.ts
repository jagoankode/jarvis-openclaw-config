// ============================================================
// Dashboard Monitoring — Zustand Store
// ============================================================

import { create } from 'zustand';
import type {
  SystemMetrics,
  AppMetrics,
  DatabaseMetrics,
  BusinessMetrics,
  Alert,
  MetricCategory,
  ConnectionStatus,
  MetricSnapshot,
  HistoryPoint,
  HistoryResponse,
} from '../types/metrics';

const EMPTY_SYSTEM: SystemMetrics = {
  cpu_percent: 0,
  memory_used_percent: 0,
  memory_total_gb: 16,
  disk_used_percent: 0,
  network_rx_bytes: 0,
  network_tx_bytes: 0,
  uptime_seconds: 0,
};

const EMPTY_APP: AppMetrics = {
  requests_per_sec: 0,
  error_rate_percent: 0,
  latency_p50_ms: 0,
  latency_p95_ms: 0,
  latency_p99_ms: 0,
  active_connections: 0,
};

const EMPTY_DB: DatabaseMetrics = {
  pool_active: 0,
  pool_idle: 0,
  pool_waiting: 0,
  query_latency_avg_ms: 0,
  cache_hit_ratio: 0,
  deadlocks_last_min: 0,
};

const EMPTY_BUSINESS: BusinessMetrics = {
  orders_per_min: 0,
  revenue_per_min: 0,
  active_users: 0,
  cart_abandon_rate: 0,
};

// Ring buffer for chart history per metric
type MetricHistory = Record<string, HistoryPoint[]>;
const MAX_HISTORY = 500;

interface MetricsState {
  // Connection
  connectionStatus: ConnectionStatus;
  lastUpdate: string | null;

  // Current snapshot
  system: SystemMetrics;
  app: AppMetrics;
  database: DatabaseMetrics;
  business: BusinessMetrics;

  // History for charts
  history: MetricHistory;

  // Subscriptions
  subscriptions: MetricCategory[];

  // Alerts
  alerts: Alert[];

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateMetrics: (snapshot: MetricSnapshot) => void;
  setHistory: (response: HistoryResponse) => void;
  appendHistoryPoint: (category: string, metric: string, point: HistoryPoint) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, status: 'acknowledged' | 'resolved') => void;
  subscribe: (categories: MetricCategory[]) => void;
  unsubscribe: (categories: MetricCategory[]) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  connectionStatus: 'disconnected',
  lastUpdate: null,
  system: EMPTY_SYSTEM,
  app: EMPTY_APP,
  database: EMPTY_DB,
  business: EMPTY_BUSINESS,
  history: {},
  subscriptions: ['system', 'app', 'db', 'business'],
  alerts: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  updateMetrics: (snapshot) =>
    set({
      lastUpdate: snapshot.timestamp,
      system: snapshot.system,
      app: snapshot.app,
      database: snapshot.database,
      business: snapshot.business,
    }),

  setHistory: (response) =>
    set((state) => ({
      history: {
        ...state.history,
        [`${response.category}:${response.metric}`]: response.points,
      },
    })),

  appendHistoryPoint: (category, metric, point) =>
    set((state) => {
      const key = `${category}:${metric}`;
      const current = state.history[key] || [];
      const updated = [...current, point].slice(-MAX_HISTORY);
      return {
        history: { ...state.history, [key]: updated },
      };
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100),
    })),

  updateAlert: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  subscribe: (categories) =>
    set((state) => ({
      subscriptions: [...new Set([...state.subscriptions, ...categories])],
    })),

  unsubscribe: (categories) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter(
        (c) => !categories.includes(c)
      ),
    })),
}));
