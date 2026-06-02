import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { setUnauthorizedHandler } from '../api/axios';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const persistAuth = useCallback((userData, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await authApi.getMe();
      const userData = data.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  const signup = async (formData) => {
    setError(null);
    const { data } = await authApi.signup(formData);
    persistAuth(data.data.user, data.data.token);
    return data.data.user;
  };

  const login = async (formData) => {
    setError(null);
    const { data } = await authApi.login(formData);
    persistAuth(data.data.user, data.data.token);
    return data.data.user;
  };

  const logout = () => {
    clearAuth();
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      const userData = data.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      setError,
      signup,
      login,
      logout,
      refreshUser,
      isAuthenticated: !!user,
    }),
    [user, loading, error, signup, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
