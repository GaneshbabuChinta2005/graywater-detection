import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('greywater_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        // Set guest operator default
        setUser({ name: 'Operator (Session)', role: 'OPERATOR' });
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        if (res.success) {
          setUser(res.user);
        }
      } catch (e) {
        setUser({ name: 'Operator (Session)', role: 'OPERATOR' });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const loginUser = async (credentials) => {
    const res = await apiLogin(credentials);
    if (res.success) {
      localStorage.setItem('greywater_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logoutUser = () => {
    localStorage.removeItem('greywater_token');
    setToken(null);
    setUser({ name: 'Operator (Session)', role: 'OPERATOR' });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
