// ============================================================
// Dashboard Monitoring — Authentication Store
// ============================================================

import { create } from 'zustand';
import type { User, LoginCredentials, AuthState } from '../types/metrics';
import { login as apiLogin, logout as apiLogout, getProfile, verifyToken } from '../services/authService';

const TOKEN_KEY = 'monitor_auth_token';
const USER_KEY = 'monitor_auth_user';

interface AuthStore extends AuthState {
  /** Initialize auth state from localStorage */
  init: () => Promise<void>;
  /** Login with credentials */
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Clear auth error */
  clearError: () => void;
}

/**
 * Persist token to localStorage.
 */
function _persistToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function _persistUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function _clearPersisted(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  init: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isLoading: false });
      return;
    }

    // Verify token is still valid
    const valid = await verifyToken(token);
    if (!valid) {
      _clearPersisted();
      set({ isLoading: false });
      return;
    }

    // Get user profile
    const userStr = localStorage.getItem(USER_KEY);
    let user: User | null = null;

    if (userStr) {
      try {
        user = JSON.parse(userStr) as User;
      } catch {
        user = await getProfile(token);
      }
    } else {
      user = await getProfile(token);
    }

    if (user) {
      _persistUser(user);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
    } else {
      _clearPersisted();
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiLogin(credentials);

      if (!response.success) {
        set({
          isLoading: false,
          error: response.message || 'Login failed',
        });
        return { success: false, message: response.message };
      }

      const { user, token } = response.data;
      _persistToken(token);
      _persistUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    const { token } = get();
    if (token) {
      await apiLogout(token).catch(() => {});
    }
    _clearPersisted();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
