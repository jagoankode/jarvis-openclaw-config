// ============================================================
// Dashboard Monitoring Real-Time — App Root
// ============================================================

import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';

/**
 * Root application component.
 * ProtectedRoute checks auth state → shows LoginPage or Dashboard.
 * Layout wraps the dashboard with header/status bar.
 */
export default function App() {
  return (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  );
}
