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
    const id = localStorage.getItem('userId');
    if (token) {
      setUser({ token, role, email, name, id: id ? parseInt(id) : null });
      api.get('/me')
        .then(res => {
          if (res.data) {
            setUser(prev => ({
              ...prev,
              id: res.data.id || prev?.id,
              name: res.data.name || prev?.name,
              email: res.data.email || prev?.email,
              role: res.data.role || prev?.role
            }));
            if (res.data.id) localStorage.setItem('userId', res.data.id);
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
    if (res.data.id) localStorage.setItem('userId', res.data.id);
    if (res.data.email) localStorage.setItem('email', res.data.email);
    if (res.data.name) localStorage.setItem('name', res.data.name);
    setUser({ 
      id: res.data.id,
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
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
