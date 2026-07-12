// ============================================================
// Dashboard Monitoring — Main Dashboard Page
// ============================================================

import { useSocket } from '../hooks/useSocket';
import { SystemPanel } from '../components/SystemPanel';
import { ApplicationPanel } from '../components/ApplicationPanel';
import { BusinessPanel } from '../components/BusinessPanel';
import { DatabasePanel } from '../components/DatabasePanel';
import { AlertsPanel } from '../components/AlertsPanel';

/**
 * Main dashboard page combining all metric panels.
 * Establishes WebSocket connection on mount.
 */
export function Dashboard() {
  // Initialize WebSocket connections
  useSocket();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Alerts panel - full width, collapsible */}
      <div>
        <AlertsPanel />
      </div>

      {/* System + Application panels row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '1rem',
        }}
      >
        <SystemPanel />
        <ApplicationPanel />
      </div>

      {/* Business + Database panels row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '1rem',
        }}
      >
        <BusinessPanel />
        <DatabasePanel />
      </div>
    </div>
  );
}
