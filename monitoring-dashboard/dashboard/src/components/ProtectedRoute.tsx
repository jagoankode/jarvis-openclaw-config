// ============================================================
// Dashboard Monitoring — Protected Route Component
// ============================================================

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Route guard — renders children only when authenticated.
 * Shows login page when not authenticated, loading spinner while
 * checking stored token validity.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, init } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      init().then(() => setInitialized(true));
    }
  }, [initialized, init]);

  // Loading state — checking stored token
  if (isLoading || !initialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(56,189,248,0.15)',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
          Verifying session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
