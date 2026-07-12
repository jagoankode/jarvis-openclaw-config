// ============================================================
// Dashboard Monitoring — Layout Component
// ============================================================

import { ReactNode } from 'react';
import { StatusBar } from './StatusBar';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main application layout: header (StatusBar) + content area.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
      }}
    >
      <StatusBar />

      <main
        style={{
          flex: 1,
          padding: '1.25rem',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
    </div>
  );
}
