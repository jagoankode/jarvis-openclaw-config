// ============================================================
// Dashboard Monitoring — Login Page Component
// ============================================================

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  color: '#e2e8f0',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const INPUT_FOCUS_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  borderColor: '#38bdf8',
  boxShadow: '0 0 0 3px rgba(56,189,248,0.15)',
};

const BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const BUTTON_DISABLED_STYLE: React.CSSProperties = {
  ...BUTTON_STYLE,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const DEMO_CREDENTIALS = [
  { email: 'admin@autonomous.studio', password: 'admin123', role: 'Administrator' },
  { email: 'engineer@autonomous.studio', password: 'engineer123', role: 'Engineer' },
  { email: 'viewer@autonomous.studio', password: 'viewer123', role: 'Viewer' },
];

/**
 * Login page with email/password form and demo credentials.
 * Dark theme matching dashboard design system.
 */
export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const _handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    clearError();
    await login({ email: email.trim(), password });
  };

  const _handleDemoClick = (creds: (typeof DEMO_CREDENTIALS)[0]) => {
    setEmail(creds.email);
    setPassword(creds.password);
    clearError();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        padding: '1rem',
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: 'fixed',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle at 30% 40%, rgba(56,189,248,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(129,140,248,0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              margin: '0 auto 1rem',
            }}
          >
            📊
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#f1f5f9',
              margin: '0 0 0.35rem',
            }}
          >
            Monitor Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Sign in untuk mengakses dashboard monitoring
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          {/* Error Alert */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={_handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.4rem',
                }}
              >
                Email
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                placeholder="admin@autonomous.studio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={focusedField === 'email' ? INPUT_FOCUS_STYLE : INPUT_STYLE}
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={focusedField === 'password' ? INPUT_FOCUS_STYLE : INPUT_STYLE}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              style={
                isLoading || !email.trim() || !password.trim()
                  ? BUTTON_DISABLED_STYLE
                  : BUTTON_STYLE
              }
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                      display: 'inline-block',
                    }}
                  />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '1.5rem 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              Demo Accounts
            </span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          </div>

          {/* Demo Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEMO_CREDENTIALS.map((creds) => (
              <button
                key={creds.email}
                type="button"
                onClick={() => _handleDemoClick(creds)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.background = '#1a2236';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.background = '#0f172a';
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(56,189,248,0.1)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {creds.role}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#e2e8f0',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {creds.email}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      fontFamily: 'monospace',
                    }}
                  >
                    {creds.password}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#475569',
            marginTop: '1.5rem',
          }}
        >
          © 2026 Autonomous Studio — Real-Time Monitoring Dashboard
        </p>
      </div>
    </div>
  );
}
