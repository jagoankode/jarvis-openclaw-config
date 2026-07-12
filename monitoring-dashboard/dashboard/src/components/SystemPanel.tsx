// ============================================================
// Dashboard Monitoring — System Panel Component
// ============================================================

import { useMetrics } from '../hooks/useMetrics';
import { GaugeChart } from './GaugeChart';
import { MetricCard } from './MetricCard';
import { LineChart } from './LineChart';
import {
  formatPercent,
  formatBytes,
  formatUptime,
  formatTimestamp,
} from '../utils/formatters';
import { COLORS } from '../utils/constants';

/**
 * System metrics panel: CPU, Memory, Disk gauges + Network chart.
 */
export function SystemPanel() {
  const { system, lastUpdate, getMetricHistory } = useMetrics();

  const cpuHistory = getMetricHistory('system', 'cpu_percent');
  const memHistory = getMetricHistory('system', 'memory_used_percent');

  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            🖥️ System
          </h2>
          {lastUpdate && (
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Last update: {formatTimestamp(lastUpdate)}
            </span>
          )}
        </div>
      </div>

      {/* Gauges row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <GaugeChart
          value={system.cpu_percent}
          label="CPU"
          size={130}
        />
        <GaugeChart
          value={system.memory_used_percent}
          label="Memory"
          size={130}
        />
        <GaugeChart
          value={system.disk_used_percent}
          label="Disk"
          size={130}
        />
      </div>

      {/* Metric cards row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <MetricCard
          title="Uptime"
          value={formatUptime(system.uptime_seconds)}
          icon="⏱️"
        />
        <MetricCard
          title="Network RX"
          value={formatBytes(system.network_rx_bytes)}
          subtitle="/s"
          icon="📥"
        />
        <MetricCard
          title="Network TX"
          value={formatBytes(system.network_tx_bytes)}
          subtitle="/s"
          icon="📤"
        />
      </div>

      {/* CPU history chart */}
      {cpuHistory.length > 1 && (
        <div style={{ marginTop: '0.5rem' }}>
          <LineChart
            title="CPU — Last 5 min"
            labels={cpuHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'CPU %',
                data: cpuHistory.map((p) => p.value),
                color: COLORS.system,
                fill: true,
              },
            ]}
            yLabel="%"
            thresholdLines={[
              { value: 90, label: 'Critical', color: COLORS.thresholdCritical },
              { value: 75, label: 'Warning', color: COLORS.thresholdWarning },
            ]}
            height={160}
          />
        </div>
      )}
    </div>
  );
}
