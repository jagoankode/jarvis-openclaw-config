// ============================================================
// Dashboard Monitoring — Application Panel Component
// ============================================================

import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from './MetricCard';
import { LineChart } from './LineChart';
import { formatNumber, formatLatency, formatPercent, getSeverityClass } from '../utils/formatters';
import { COLORS } from '../utils/constants';

const RPS_WARNING = 500;
const RPS_CRITICAL = 1000;
const LATENCY_WARNING = 200;
const LATENCY_CRITICAL = 500;

/**
 * Application metrics panel: RPS, error rate, latency percentiles.
 */
export function ApplicationPanel() {
  const { app, getMetricHistory } = useMetrics();

  const rpsHistory = getMetricHistory('app', 'requests_per_sec');
  const errorHistory = getMetricHistory('app', 'error_rate_percent');
  const latencyP95History = getMetricHistory('app', 'latency_p95_ms');

  const rpsSeverity = getSeverityClass(app.requests_per_sec, {
    warning: RPS_WARNING,
    critical: RPS_CRITICAL,
  });

  const latencySeverity = getSeverityClass(app.latency_p95_ms, {
    warning: LATENCY_WARNING,
    critical: LATENCY_CRITICAL,
  });

  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 1rem' }}>
        🚀 Application
      </h2>

      {/* Metric cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <MetricCard
          title="Requests/sec"
          value={formatNumber(app.requests_per_sec)}
          icon="📨"
          color={COLORS.app}
          severity={rpsSeverity}
        />
        <MetricCard
          title="Error Rate"
          value={formatPercent(app.error_rate_percent)}
          icon="⚠️"
          color={COLORS.app}
          severity={getSeverityClass(app.error_rate_percent, {
            warning: 3,
            critical: 5,
          })}
        />
        <MetricCard
          title="Active Connections"
          value={app.active_connections.toString()}
          icon="🔗"
          color={COLORS.app}
        />
      </div>

      {/* Latency cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <MetricCard
          title="P50 Latency"
          value={formatLatency(app.latency_p50_ms)}
          icon="⚡"
        />
        <MetricCard
          title="P95 Latency"
          value={formatLatency(app.latency_p95_ms)}
          icon="⚡"
          color={COLORS.app}
          severity={latencySeverity}
        />
        <MetricCard
          title="P99 Latency"
          value={formatLatency(app.latency_p99_ms)}
          icon="⚡"
          severity={getSeverityClass(app.latency_p99_ms, {
            warning: 500,
            critical: 2000,
          })}
        />
      </div>

      {/* RPS chart */}
      {rpsHistory.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <LineChart
            title="Requests/sec"
            labels={rpsHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'RPS',
                data: rpsHistory.map((p) => p.value),
                color: COLORS.app,
                fill: true,
              },
            ]}
            yLabel="req/s"
            height={150}
          />
        </div>
      )}

      {/* Latency chart */}
      {latencyP95History.length > 1 && (
        <div>
          <LineChart
            title="Latency P95 (ms)"
            labels={latencyP95History.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'P95',
                data: latencyP95History.map((p) => p.value),
                color: COLORS.chartAccent,
                fill: true,
              },
            ]}
            yLabel="ms"
            thresholdLines={[
              { value: 200, label: 'Warning', color: COLORS.thresholdWarning },
              { value: 500, label: 'Critical', color: COLORS.thresholdCritical },
            ]}
            height={150}
          />
        </div>
      )}
    </div>
  );
}
