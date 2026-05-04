import { create } from 'zustand';
import { apiGet, apiPost, ApiError, setApiToken } from '@/lib/api';

export type UserRole = 'student' | 'author' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  archetype: string | null;
  classLevel: number | null;
  avatarUrl: string | null;
  bio: string | null;
  initial: string;
}

interface DummyUserApi {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  archetype: string | null;
  classLevel: number | null;
  avatarUrl: string | null;
  bio: string | null;
}

function toAuthUser(u: DummyUserApi): AuthUser {
  const initial = u.name.trim().charAt(0).toUpperCase() || 'U';
  return { ...u, initial };
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  /** Available dummy users from the backend, for the SignIn picker. */
  dummyUsers: AuthUser[];
  dummyUsersLoading: boolean;
  dummyUsersError: string | null;

  hydrate: () => Promise<void>;
  loadDummyUsers: () => Promise<void>;
  signInAs: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  dummyUsers: [],
  dummyUsersLoading: false,
  dummyUsersError: null,

  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiGet<{ user: DummyUserApi }>('/api/auth/me');
      set({ user: toAuthUser(data.user), loading: false });
    } catch (err) {
      // Not authenticated → that's fine, just no user
      if (err instanceof ApiError && err.status === 401) {
        setApiToken(null);
        set({ user: null, loading: false });
        return;
      }
      set({
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Auth check failed',
      });
    }
  },

  loadDummyUsers: async () => {
    set({ dummyUsersLoading: true, dummyUsersError: null });
    try {
      const data = await apiGet<{ users: DummyUserApi[] }>('/api/auth/dummy-users');
      set({ dummyUsers: data.users.map(toAuthUser), dummyUsersLoading: false });
    } catch (err) {
      set({
        dummyUsersLoading: false,
        dummyUsersError:
          err instanceof Error
            ? `${err.message} — is the backend running on :4000?`
            : 'Failed to load dummy users',
      });
    }
  },

  signInAs: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await apiPost<{ user: DummyUserApi; token: string }>('/api/auth/login', {
        userId,
      });
      setApiToken(data.token);
      set({ user: toAuthUser(data.user), loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Sign-in failed',
      });
    }
  },

  signOut: async () => {
    try {
      await apiPost('/api/auth/logout');
    } catch {
      // best-effort
    }
    setApiToken(null);
    set({ user: null });
  },
}));

export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthLoading = () => useAuthStore((s) => s.loading);
