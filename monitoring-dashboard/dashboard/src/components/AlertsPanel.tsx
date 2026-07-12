// ============================================================
// Dashboard Monitoring — Alerts Panel Component
// ============================================================

import { useAlerts } from '../hooks/useAlerts';
import { AlertBadge } from './AlertBadge';
import { formatTimestamp } from '../utils/formatters';
import { ALERT_SEVERITY_CONFIG } from '../utils/constants';
import type { Alert } from '../types/metrics';

/**
 * Active alerts panel with acknowledge/resolve actions.
 */
export function AlertsPanel() {
  const { activeAlerts, acknowledgedAlerts, acknowledgeAlert, resolveAlert } = useAlerts();

  if (activeAlerts.length === 0 && acknowledgedAlerts.length === 0) {
    return (
      <div
        style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.25rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#f1f5f9',
            margin: '0 0 0.5rem',
          }}
        >
          🔔 Alerts
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: '#64748b',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</span>
          <span>Tidak ada alert aktif</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '1.25rem',
        maxHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#f1f5f9',
            margin: 0,
          }}
        >
          🔔 Alerts
        </h2>
        <span
          style={{
            fontSize: '0.75rem',
            color: activeAlerts.length > 0 ? '#ef4444' : '#22c55e',
            fontWeight: 600,
            background:
              activeAlerts.length > 0
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(34,197,94,0.1)',
            padding: '2px 10px',
            borderRadius: '999px',
          }}
        >
          {activeAlerts.length} active
        </span>
      </div>

      {/* Alert list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {[...activeAlerts, ...acknowledgedAlerts].slice(0, 50).map((alert) => (
          <_AlertItem
            key={alert.id}
            alert={alert}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
          />
        ))}
      </div>
    </div>
  );
}

/** Single alert item */
interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

function _AlertItem({ alert, onAcknowledge, onResolve }: AlertItemProps) {
  const config = ALERT_SEVERITY_CONFIG[alert.severity];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: config.bgColor,
        border: `1px solid ${alert.status === 'active' ? config.borderColor : 'rgba(100,116,139,0.2)'}`,
        opacity: alert.status === 'acknowledged' ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: '1rem', lineHeight: 1.4 }}>{config.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.2rem',
          }}
        >
          <AlertBadge severity={alert.severity} />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#e2e8f0',
            }}
          >
            {alert.name}
          </span>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.25rem' }}>
          {alert.message}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.7rem',
            color: '#64748b',
          }}
        >
          <span>
            Value: <strong style={{ color: config.color }}>{alert.value}</strong>
            {' / '}
            Threshold: {alert.threshold}
          </span>
          <span>•</span>
          <span>{formatTimestamp(alert.created_at)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        {alert.status === 'active' && (
          <>
            <button
              onClick={() => onAcknowledge(alert.id)}
              title="Acknowledge"
              style={{
                padding: '4px 8px',
                fontSize: '0.7rem',
                background: 'rgba(59,130,246,0.15)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '4px',
                color: '#93c5fd',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Ack
            </button>
            <button
              onClick={() => onResolve(alert.id)}
              title="Resolve"
              style={{
                padding: '4px 8px',
                fontSize: '0.7rem',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '4px',
                color: '#86efac',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Resolve
            </button>
          </>
        )}
        {alert.status === 'acknowledged' && (
          <button
            onClick={() => onResolve(alert.id)}
            title="Resolve"
            style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '4px',
              color: '#86efac',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}
