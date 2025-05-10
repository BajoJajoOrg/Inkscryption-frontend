import { create } from 'zustand';
import { queryClient } from '../constants';

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
  setAuth: (data: { access_token: string; id: string; email: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('access_token') || null,
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  setAuth: (data) => {
    const currentEmail = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).email
      : null;

    // Если email изменился, очищаем кэш
    if (currentEmail && currentEmail !== data.email) {
      queryClient.clear();
    }

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify({ id: data.id, email: data.email }));
    set({
      accessToken: data.access_token,
      user: { id: data.id, email: data.email },
    });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    queryClient.clear();
    set({ accessToken: null, user: null });
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp ? payload.exp * 1000 < Date.now() : true;
      return !isExpired;
    } catch {
      return false;
    }
  },
}));
