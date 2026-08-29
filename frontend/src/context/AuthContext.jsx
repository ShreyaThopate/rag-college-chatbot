import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('collegegpt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('collegegpt_token');
      if (storedToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          console.warn('[Auth] Token invalid or expired, resetting auth state.');
          localStorage.removeItem('collegegpt_token');
          localStorage.removeItem('collegegpt_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = response.data;
    localStorage.setItem('collegegpt_token', jwtToken);
    localStorage.setItem('collegegpt_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'student') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { user: userData, token: jwtToken } = response.data;
    localStorage.setItem('collegegpt_token', jwtToken);
    localStorage.setItem('collegegpt_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('collegegpt_token');
      localStorage.removeItem('collegegpt_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
