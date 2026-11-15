import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { setAuthToken, setUnauthorizedListener } from '../api/http';
import type { Credentials, User } from '../api/types';

const STORAGE_KEY = 'todo.token';

export type AuthState =
  | { readonly status: 'loading' }
  | { readonly status: 'anonymous' }
  | { readonly status: 'authenticated'; readonly user: User };

export interface AuthContextValue {
  readonly state: AuthState;
  login(data: Credentials): Promise<void>;
  register(data: Credentials): Promise<void>;
  logout(): void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  setAuthToken(token);
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* хранилище недоступно — токен живёт только в памяти */
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => (readToken() ? { status: 'loading' } : { status: 'anonymous' }));

  const logout = useCallback(() => {
    writeToken(null);
    setState({ status: 'anonymous' });
  }, []);

  useEffect(() => {
    setUnauthorizedListener(logout);
    const token = readToken();
    if (!token) return () => setUnauthorizedListener(null);

    let cancelled = false;
    setAuthToken(token);
    authApi
      .me()
      .then((user) => {
        if (!cancelled) setState({ status: 'authenticated', user });
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
      setUnauthorizedListener(null);
    };
  }, [logout]);

  const login = useCallback(async (data: Credentials) => {
    const res = await authApi.login(data);
    writeToken(res.token);
    setState({ status: 'authenticated', user: res.user });
  }, []);

  const register = useCallback(async (data: Credentials) => {
    const res = await authApi.register(data);
    writeToken(res.token);
    setState({ status: 'authenticated', user: res.user });
  }, []);

  const value = useMemo(() => ({ state, login, register, logout }), [state, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
