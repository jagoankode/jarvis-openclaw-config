// ============================================================
// Dashboard Monitoring — Alert Badge Component
// ============================================================

import { ALERT_SEVERITY_CONFIG } from '../utils/constants';
import type { Alert } from '../types/metrics';

interface AlertBadgeProps {
  severity: Alert['severity'];
  size?: 'sm' | 'md';
}

/**
 * Severity badge indicator for alerts.
 * @param severity - Alert severity level (critical | warning | info)
 * @param size - Badge size: sm for inline, md for label
 */
export function AlertBadge({ severity, size = 'sm' }: AlertBadgeProps) {
  const config = ALERT_SEVERITY_CONFIG[severity];

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: size === 'sm' ? '0.7rem' : '0.8rem',
    fontWeight: 600,
    color: config.color,
    padding: size === 'sm' ? '2px 6px' : '4px 10px',
    borderRadius: '999px',
    background: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <span style={style}>
      <span>{config.icon}</span>
      {size === 'md' && <span>{config.label}</span>}
    </span>
  );
}
