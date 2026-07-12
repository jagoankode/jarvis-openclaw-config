// ============================================================
// Dashboard Monitoring — Metric Card Component
// ============================================================

import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  delta?: string;
  icon?: ReactNode;
  color?: string;
  severity?: 'normal' | 'warning' | 'critical';
  onClick?: () => void;
}

/**
 * Single metric display card with value, delta, and severity coloring.
 */
export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  icon,
  color = '#38bdf8',
  severity = 'normal',
  onClick,
}: MetricCardProps) {
  const severityColor =
    severity === 'critical'
      ? '#ef4444'
      : severity === 'warning'
        ? '#f59e0b'
        : color;

  const containerStyle: React.CSSProperties = {
    background: '#1e293b',
    border: `1px solid ${severity === 'critical' ? 'rgba(239,68,68,0.3)' : severity === 'warning' ? 'rgba(245,158,11,0.3)' : '#334155'}`,
    borderRadius: '12px',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  };

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: severityColor,
          borderRadius: '12px 12px 0 0',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.5rem' }}>
          {title}
        </div>
        {icon && (
          <div style={{ fontSize: '1.2rem', opacity: 0.6 }}>{icon}</div>
        )}
      </div>

      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: severityColor, lineHeight: 1.1 }}>
        {value}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem' }}>
        {delta && (
          <span
            style={{
              color: delta.startsWith('+') ? '#22c55e' : delta.startsWith('-') ? '#ef4444' : '#94a3b8',
              fontWeight: 600,
            }}
          >
            {delta}
          </span>
        )}
        {subtitle && (
          <span style={{ color: '#64748b' }}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
