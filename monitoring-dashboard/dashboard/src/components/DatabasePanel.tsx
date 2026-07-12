// ============================================================
// Dashboard Monitoring — Database Panel Component
// ============================================================

import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from './MetricCard';
import { LineChart } from './LineChart';
import { formatLatency, formatPercent, getSeverityClass } from '../utils/formatters';
import { COLORS } from '../utils/constants';

/**
 * Database metrics panel: Connection pool, Query latency, Cache hit ratio, Deadlocks.
 */
export function DatabasePanel() {
  const { database, getMetricHistory } = useMetrics();

  const latencyHistory = getMetricHistory('db', 'query_latency_avg_ms');
  const cacheHistory = getMetricHistory('db', 'cache_hit_ratio');

  const poolTotal = database.pool_active + database.pool_idle + database.pool_waiting;
  const poolActivePct = poolTotal > 0 ? (database.pool_active / poolTotal) * 100 : 0;

  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 1rem' }}>
        🗄️ Database
      </h2>

      {/* Connection pool cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <MetricCard
          title="Pool Active"
          value={database.pool_active.toString()}
          icon="🔋"
          color={COLORS.database}
          severity={getSeverityClass(database.pool_active, {
            warning: 12,
            critical: 16,
          })}
        />
        <MetricCard
          title="Pool Idle"
          value={database.pool_idle.toString()}
          icon="💤"
          color={COLORS.database}
        />
        <MetricCard
          title="Pool Waiting"
          value={database.pool_waiting.toString()}
          icon="⏳"
          color={COLORS.database}
          severity={database.pool_waiting > 0 ? 'warning' : 'normal'}
        />
        <MetricCard
          title="Deadlocks/min"
          value={database.deadlocks_last_min.toString()}
          icon="💀"
          severity={database.deadlocks_last_min > 0 ? 'critical' : 'normal'}
        />
      </div>

      {/* Query latency + cache cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <MetricCard
          title="Query Latency (avg)"
          value={formatLatency(database.query_latency_avg_ms)}
          icon="📊"
          severity={getSeverityClass(database.query_latency_avg_ms, {
            warning: 10,
            critical: 50,
          })}
        />
        <MetricCard
          title="Cache Hit Ratio"
          value={formatPercent(database.cache_hit_ratio * 100)}
          icon="🎯"
          severity={getSeverityClass(database.cache_hit_ratio * 100, {
            warning: 88,
            critical: 80,
          })}
        />
      </div>

      {/* Query latency chart */}
      {latencyHistory.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <LineChart
            title="Query Latency (ms)"
            labels={latencyHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'Avg Latency',
                data: latencyHistory.map((p) => p.value),
                color: COLORS.database,
                fill: true,
              },
            ]}
            yLabel="ms"
            height={150}
          />
        </div>
      )}

      {/* Cache hit ratio chart */}
      {cacheHistory.length > 1 && (
        <div>
          <LineChart
            title="Cache Hit Ratio"
            labels={cacheHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'Cache Hit',
                data: cacheHistory.map((p) => p.value * 100),
                color: '#f59e0b',
                fill: true,
              },
            ]}
            yLabel="%"
            thresholdLines={[
              { value: 80, label: 'Critical', color: COLORS.thresholdCritical },
            ]}
            height={150}
          />
        </div>
      )}
    </div>
  );
}
