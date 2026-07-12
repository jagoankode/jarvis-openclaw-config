// ============================================================
// Dashboard Monitoring — Status Bar Component
// ============================================================

import { useMetrics } from '../hooks/useMetrics';
import { useAuthStore } from '../store/authStore';
import { formatTimestamp } from '../utils/formatters';

const STATUS_CONFIG = {
  connected: { color: '#22c55e', label: 'Connected', dot: '🟢' },
  reconnecting: { color: '#f59e0b', label: 'Reconnecting...', dot: '🟡' },
  disconnected: { color: '#ef4444', label: 'Disconnected', dot: '🔴' },
} as const;

/**
 * Top status bar: connection status, last update time, user info, logout button.
 */
export function StatusBar() {
  const { connectionStatus, lastUpdate } = useMetrics();
  const { user, logout } = useAuthStore();

  const status = STATUS_CONFIG[connectionStatus];

  const _handleLogout = async () => {
    await logout();
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      {/* Left: Brand + Connection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#f1f5f9',
            }}
          >
            Monitor Dashboard
          </span>
        </div>

        {/* Connection status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            color: status.color,
            fontWeight: 600,
          }}
        >
          <span>{status.dot}</span>
          <span>{status.label}</span>
        </div>

        {/* Last update */}
        {lastUpdate && connectionStatus === 'connected' && (
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            Updated {formatTimestamp(lastUpdate)}
          </span>
        )}
      </div>

      {/* Right: User + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    lineHeight: 1.2,
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748b',
                    textTransform: 'capitalize',
                  }}
                >
                  {user.role}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={_handleLogout}
              title="Logout"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '6px',
                color: '#fca5a5',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
