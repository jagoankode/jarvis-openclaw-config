// ============================================================
// Dashboard Monitoring — Time Range Selector Component
// ============================================================

import { TIME_RANGES } from '../utils/constants';

interface TimeRangeSelectorProps {
  value: string;
  onChange: (range: string) => void;
}

/**
 * Time range selector for chart windows.
 */
export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {TIME_RANGES.map((range) => {
        const isActive = range.value === value;
        return (
          <button
            key={range.value}
            onClick={() => onChange(range.value)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: `1px solid ${isActive ? '#38bdf8' : '#334155'}`,
              background: isActive ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: isActive ? '#38bdf8' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
