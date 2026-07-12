// ============================================================
// Dashboard Monitoring — Type Definitions
// ============================================================

export interface SystemMetrics {
  cpu_percent: number;
  memory_used_percent: number;
  memory_total_gb: number;
  disk_used_percent: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  uptime_seconds: number;
}

export interface AppMetrics {
  requests_per_sec: number;
  error_rate_percent: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  active_connections: number;
}

export interface DatabaseMetrics {
  pool_active: number;
  pool_idle: number;
  pool_waiting: number;
  query_latency_avg_ms: number;
  cache_hit_ratio: number;
  deadlocks_last_min: number;
}

export interface BusinessMetrics {
  orders_per_min: number;
  revenue_per_min: number;
  active_users: number;
  cart_abandon_rate: number;
}

export interface MetricSnapshot {
  timestamp: string;
  system: SystemMetrics;
  app: AppMetrics;
  database: DatabaseMetrics;
  business: BusinessMetrics;
}

export type MetricCategory = 'system' | 'app' | 'db' | 'business';
export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: MetricCategory;
  name: string;
  message: string;
  value: number;
  threshold: number;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface HistoryPoint {
  time: string;
  value: number;
}

export interface HistoryResponse {
  category: MetricCategory;
  metric: string;
  unit: string;
  points: HistoryPoint[];
  stats: {
    avg: number;
    min: number;
    max: number;
  };
}

// ============================================================
// Auth Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expires_at: string;
  };
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
