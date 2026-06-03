import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('at', accessToken);
    if (refreshToken) localStorage.setItem('rt', refreshToken);
    set({ user, accessToken, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem('at');
    localStorage.removeItem('rt');
    set({ user: null, accessToken: null, isLoading: false });
  },

  initialize: async () => {
    const token = localStorage.getItem('at');
    if (!token) { set({ isLoading: false }); return; }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user: AuthUser = await res.json();
        set({ user, accessToken: token, isLoading: false });
      } else {
        localStorage.removeItem('at');
        set({ user: null, accessToken: null, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
