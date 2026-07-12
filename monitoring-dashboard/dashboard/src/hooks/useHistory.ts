// ============================================================
// Dashboard Monitoring — History Fetch Hook
// ============================================================

import { useCallback } from 'react';
import { useMetricsStore } from '../store/metricsStore';
import type { HistoryResponse } from '../types/metrics';

export function useHistory() {
  const setHistory = useMetricsStore((state) => state.setHistory);

  const fetchHistory = useCallback(
    async (
      category: string,
      metric: string,
      from = '1h',
      to = 'now',
      bucket = '1m'
    ) => {
      try {
        const params = new URLSearchParams({
          category,
          metric,
          from,
          to,
          bucket,
        });
        const res = await fetch(`/api/monitor/history?${params}`);
        const json = await res.json();
        if (json.success) {
          setHistory(json.data as HistoryResponse);
          return json.data as HistoryResponse;
        }
      } catch {
        // Silent fail — fallback to WebSocket history request
      }
      return null;
    },
    [setHistory]
  );

  return { fetchHistory };
}
