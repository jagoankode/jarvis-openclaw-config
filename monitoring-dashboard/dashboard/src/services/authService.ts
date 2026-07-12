// ============================================================
// Dashboard Monitoring — Authentication Service
// ============================================================

import type { LoginCredentials, AuthResponse, User } from '../types/metrics';

const API_BASE = '/api/monitor';

// Demo credentials untuk development
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@autonomous.studio': {
    password: 'admin123',
    user: {
      id: 'u-001',
      email: 'admin@autonomous.studio',
      name: 'Admin Ops',
      role: 'admin',
    },
  },
  'engineer@autonomous.studio': {
    password: 'engineer123',
    user: {
      id: 'u-002',
      email: 'engineer@autonomous.studio',
      name: 'Engineer Lead',
      role: 'editor',
    },
  },
  'viewer@autonomous.studio': {
    password: 'viewer123',
    user: {
      id: 'u-003',
      email: 'viewer@autonomous.studio',
      name: 'Business Viewer',
      role: 'viewer',
    },
  },
};

/**
 * Generate JWT-like token (simulated untuk development).
 * Di production, token akan digenerate oleh backend.
 */
function _generateToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    })
  );
  const signature = btoa(
    `simulated-signature-${user.id}-${Date.now()}`
  );
  return `${header}.${payload}.${signature}`;
}

/**
 * Login user with email and password.
 * Falls back to demo credentials when backend is unavailable.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Try real API first
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (json.success) {
      return json as AuthResponse;
    }
  } catch {
    // Backend not available, use demo
  }

  // Demo auth fallback
  const demoUser = DEMO_USERS[credentials.email];
  if (!demoUser || demoUser.password !== credentials.password) {
    return {
      success: false,
      data: null as unknown as AuthResponse['data'],
      message: 'Email atau password salah',
    };
  }

  const token = _generateToken(demoUser.user);
  const expiresAt = new Date(Date.now() + 3600000).toISOString();

  return {
    success: true,
    data: {
      user: demoUser.user,
      token,
      expires_at: expiresAt,
    },
  };
}

/**
 * Verify current token validity.
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    // Parse JWT payload to check expiry
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }
}

/**
 * Get user profile from token.
 */
export async function getProfile(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) return json.data as User;
  } catch {
    // Parse from JWT payload
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.email.split('@')[0].replace(/[._]/g, ' '),
        role: payload.role || 'viewer',
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Logout — invalidate token on server.
 */
export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // Silent fail — token will expire anyway
  }
}
