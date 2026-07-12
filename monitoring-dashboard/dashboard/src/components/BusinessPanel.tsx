// ============================================================
// Dashboard Monitoring — Business Panel Component
// ============================================================

import { useMetrics } from '../hooks/useMetrics';
import { MetricCard } from './MetricCard';
import { LineChart } from './LineChart';
import { formatCurrency, formatNumber, formatPercent, getSeverityClass } from '../utils/formatters';
import { COLORS } from '../utils/constants';

/**
 * Business metrics panel: Orders, Revenue, Active Users, Cart Abandon Rate.
 */
export function BusinessPanel() {
  const { business, getMetricHistory } = useMetrics();

  const ordersHistory = getMetricHistory('business', 'orders_per_min');
  const revenueHistory = getMetricHistory('business', 'revenue_per_min');
  const usersHistory = getMetricHistory('business', 'active_users');

  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.25rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 1rem' }}>
        💰 Business
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
          title="Orders/min"
          value={business.orders_per_min.toFixed(1)}
          icon="🛒"
          color={COLORS.business}
          severity={business.orders_per_min === 0 ? 'critical' : 'normal'}
        />
        <MetricCard
          title="Revenue/min"
          value={formatCurrency(business.revenue_per_min)}
          icon="💵"
          color={COLORS.business}
          severity={getSeverityClass(business.revenue_per_min, {
            warning: 100000,
            critical: 50000,
          })}
        />
        <MetricCard
          title="Active Users"
          value={business.active_users.toString()}
          icon="👥"
          color={COLORS.business}
        />
        <MetricCard
          title="Cart Abandon"
          value={formatPercent(business.cart_abandon_rate * 100)}
          icon="🛍️"
          severity={getSeverityClass(business.cart_abandon_rate * 100, {
            warning: 40,
            critical: 60,
          })}
        />
      </div>

      {/* Orders chart */}
      {ordersHistory.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <LineChart
            title="Orders / min"
            labels={ordersHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'Orders',
                data: ordersHistory.map((p) => p.value),
                color: COLORS.business,
                fill: true,
              },
            ]}
            yLabel="orders/min"
            height={150}
          />
        </div>
      )}

      {/* Revenue chart */}
      {revenueHistory.length > 1 && (
        <div style={{ marginBottom: '1rem' }}>
          <LineChart
            title="Revenue / min"
            labels={revenueHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'Revenue',
                data: revenueHistory.map((p) => p.value),
                color: '#34d399',
                fill: true,
              },
            ]}
            yLabel="Rp"
            height={150}
          />
        </div>
      )}

      {/* Active users chart */}
      {usersHistory.length > 1 && (
        <div>
          <LineChart
            title="Active Users"
            labels={usersHistory.map((p) => {
              const d = new Date(p.time);
              return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })}
            series={[
              {
                label: 'Users',
                data: usersHistory.map((p) => p.value),
                color: '#a78bfa',
                fill: true,
              },
            ]}
            yLabel="users"
            height={150}
          />
        </div>
      )}
    </div>
  );
}
