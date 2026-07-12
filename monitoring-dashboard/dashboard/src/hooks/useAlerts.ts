// ============================================================
// Dashboard Monitoring — Alerts Hook
// ============================================================

import { useMetricsStore } from '../store/metricsStore';
import { useAlertsSocket } from './useSocket';
import { useCallback, useMemo } from 'react';

export function useAlerts() {
  const alerts = useMetricsStore((state) => state.alerts);
  const { acknowledgeAlert, resolveAlert } = useAlertsSocket();

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'active'),
    [alerts]
  );

  const acknowledgedAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'acknowledged'),
    [alerts]
  );

  const criticalAlerts = useMemo(
    () => activeAlerts.filter((a) => a.severity === 'critical'),
    [activeAlerts]
  );

  const _handleAcknowledge = useCallback(
    (id: string) => {
      acknowledgeAlert(id);
    },
    [acknowledgeAlert]
  );

  const _handleResolve = useCallback(
    (id: string) => {
      resolveAlert(id);
    },
    [resolveAlert]
  );

  return {
    alerts,
    activeAlerts,
    acknowledgedAlerts,
    criticalAlerts,
    acknowledgeAlert: _handleAcknowledge,
    resolveAlert: _handleResolve,
  };
}
