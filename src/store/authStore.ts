import { create } from 'zustand';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string } | null;
  setAuth: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  user: null,
  setAuth: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

    const decoded = jwtDecode<{ id: string; email: string }>(accessToken);
    set({ accessToken, refreshToken, user: { id: decoded.id, email: decoded.email } });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ accessToken: null, refreshToken: null, user: null });
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : true;
      return !isExpired;
    } catch {
      return false;
    }
  },
}));
