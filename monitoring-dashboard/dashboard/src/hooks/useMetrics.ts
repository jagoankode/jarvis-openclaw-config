// ============================================================
// Dashboard Monitoring — Metrics Hook
// ============================================================

import { useMetricsStore } from '../store/metricsStore';
import { useCallback } from 'react';

export function useMetrics() {
  const {
    system,
    app,
    database,
    business,
    lastUpdate,
    connectionStatus,
    history,
    subscriptions,
    subscribe,
    unsubscribe,
    requestHistory: storeRequest,
  } = useMetricsStore();

  const getMetricHistory = useCallback(
    (category: string, metric: string) => {
      return history[`${category}:${metric}`] || [];
    },
    [history]
  );

  return {
    system,
    app,
    database,
    business,
    lastUpdate,
    connectionStatus,
    history,
    subscriptions,
    subscribe,
    unsubscribe,
    getMetricHistory,
  };
}
