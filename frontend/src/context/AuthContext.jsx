import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    if (token) {
      setUser({ token, role, email, name });
      api.get('/me')
        .then(res => {
          if (res.data) {
            setUser(prev => ({
              ...prev,
              name: res.data.name || prev?.name,
              email: res.data.email || prev?.email,
              role: res.data.role || prev?.role
            }));
            if (res.data.name) localStorage.setItem('name', res.data.name);
            if (res.data.email) localStorage.setItem('email', res.data.email);
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('role', res.data.role);
    if (res.data.email) localStorage.setItem('email', res.data.email);
    if (res.data.name) localStorage.setItem('name', res.data.name);
    setUser({ 
      token: res.data.access_token, 
      role: res.data.role, 
      email: res.data.email || email, 
      name: res.data.name 
    });
    return res.data.role;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
