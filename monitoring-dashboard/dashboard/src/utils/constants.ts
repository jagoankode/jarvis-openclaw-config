// ============================================================
// Dashboard Monitoring — Constants & Theme
// ============================================================

export const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const COLORS = {
  // Severity
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  success: '#22c55e',

  // Chart
  chartPrimary: '#38bdf8',
  chartSecondary: '#a78bfa',
  chartTertiary: '#34d399',
  chartAccent: '#fb923c',
  chartGrid: '#334155',
  chartText: '#94a3b8',
  chartBg: '#1e293b',

  // Category
  system: '#38bdf8',
  app: '#a78bfa',
  database: '#34d399',
  business: '#fb923c',

  // Threshold
  thresholdWarning: '#f59e0b',
  thresholdCritical: '#ef4444',
} as const;

export const TIME_RANGES = [
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
] as const;

export const MAX_CHART_POINTS = 500;
export const DEFAULT_POLL_INTERVAL = 2000;

export const ALERT_SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    icon: '🔴',
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    icon: '🟡',
  },
  info: {
    label: 'Info',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    icon: '🔵',
  },
} as const;
