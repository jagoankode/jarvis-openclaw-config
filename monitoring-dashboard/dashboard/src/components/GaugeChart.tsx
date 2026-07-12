// ============================================================
// Dashboard Monitoring — Gauge Chart Component
// ============================================================

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const DEFAULT_WARNING = 75;
const DEFAULT_CRITICAL = 90;

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  size?: number;
}

/**
 * Radial gauge chart for CPU, Memory, Disk usage display.
 * Uses Chart.js Doughnut with custom needle coloring.
 */
export function GaugeChart({
  value,
  max = 100,
  label,
  warningThreshold = DEFAULT_WARNING,
  criticalThreshold = DEFAULT_CRITICAL,
  size = 120,
}: GaugeChartProps) {
  const pct = Math.min((value / max) * 100, 100);

  const color =
    pct >= criticalThreshold
      ? '#ef4444'
      : pct >= warningThreshold
        ? '#f59e0b'
        : '#22c55e';

  const bgColor =
    pct >= criticalThreshold
      ? 'rgba(239,68,68,0.15)'
      : pct >= warningThreshold
        ? 'rgba(245,158,11,0.15)'
        : 'rgba(34,197,94,0.15)';

  const data = {
    datasets: [
      {
        data: [pct, 100 - pct],
        backgroundColor: [color, bgColor],
        borderColor: [color, 'transparent'],
        borderWidth: 1,
        cutout: '75%',
        circumference: 270,
        rotation: 225,
        spacing: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: () => `${pct.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto',
      }}
    >
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -35%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1 }}>
          {pct.toFixed(0)}%
        </div>
        {label && (
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
