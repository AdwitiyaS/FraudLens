import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On load, check if a token + user already exist in localStorage
    const storedToken = localStorage.getItem('fraudlens_token');
    const storedUser = localStorage.getItem('fraudlens_user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('fraudlens_token');
        localStorage.removeItem('fraudlens_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('fraudlens_token', data.token);
    localStorage.setItem('fraudlens_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    localStorage.setItem('fraudlens_token', data.token);
    localStorage.setItem('fraudlens_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    // JWT is stateless — no server call needed, just clear local storage
    localStorage.removeItem('fraudlens_token');
    localStorage.removeItem('fraudlens_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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