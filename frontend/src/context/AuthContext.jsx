import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as api from '../api/client.js';

const STORAGE_KEY = 'igg-management-auth';

const AuthContext = createContext();

function readPersistedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: null, user: null };
  } catch (error) {
    console.warn('Failed to parse persisted auth payload', error);
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const persisted = typeof window !== 'undefined' ? readPersistedAuth() : { token: null, user: null };
  const [token, setToken] = useState(persisted.token);
  const [user, setUser] = useState(persisted.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (nextToken && nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      persistAuth(receivedToken, receivedUser);
      return receivedUser;
    } catch (err) {
      setError(err.message || 'Gagal login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistAuth(null, null);
  }, [persistAuth]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      error,
      login,
      logout,
    }),
    [error, isLoading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
