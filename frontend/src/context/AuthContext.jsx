import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('blockcert_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.warn("Session check failed:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const payload = typeof credentials === 'object' ? credentials : { email: arguments[0], password: arguments[1] };
    const res = await authApi.login(payload);
    if (res.success) {
      localStorage.setItem('blockcert_token', res.data.token);
      setUser(res.data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('blockcert_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
