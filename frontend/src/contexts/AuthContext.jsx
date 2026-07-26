import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('tv_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('tv_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const userData = await apiClient.get('/auth/me');
          setUser(userData);
          localStorage.setItem('tv_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('tv_auth_unauthorized', handleUnauthorized);

    verifySession();

    return () => {
      window.removeEventListener('tv_auth_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user: userProfile } = response;

      setToken(access_token);
      setUser(userProfile);

      localStorage.setItem('tv_token', access_token);
      localStorage.setItem('tv_user', JSON.stringify(userProfile));

      return userProfile;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tv_token');
    localStorage.removeItem('tv_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
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
