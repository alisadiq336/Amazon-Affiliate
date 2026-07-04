import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

let baseApi = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
baseApi = baseApi.replace(/\/+$/, '');
if (!baseApi.endsWith('/api')) {
  baseApi = `${baseApi}/api`;
}
export const API_URL = baseApi;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data.data.user);
      } catch (err) {
        console.error('Session validation failed. Clearing credentials.', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password, role = '') => {
    try {
      const payload = { email, password };
      if (role) payload.role = role;

      const res = await axios.post(`${API_URL}/auth/login`, payload);
      const { token: receivedToken, data } = res.data;
      
      localStorage.setItem('token', receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setToken(receivedToken);
      setUser(data.user);
      showToast('Logged in successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Incorrect credentials.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      const { token: receivedToken, data } = res.data;

      localStorage.setItem('token', receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setToken(receivedToken);
      setUser(data.user);
      showToast('Account created successfully! Welcome!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const googleLogin = async (googleCredential) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, { token: googleCredential });
      const { token: receivedToken, data } = res.data;

      localStorage.setItem('token', receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setToken(receivedToken);
      setUser(data.user);
      showToast('Google Sign-In successful!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google authentication failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      showToast('Reset link generated! Check backend console output.');
      return res.data.message;
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password/${resetToken}`, { password });
      const { token: receivedToken, data } = res.data;

      localStorage.setItem('token', receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setToken(receivedToken);
      setUser(data.user);
      showToast('Password reset successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateProfile = async (username, email) => {
    try {
      const res = await axios.put(`${API_URL}/auth/update-me`, { username, email });
      setUser(res.data.data.user);
      showToast('Profile updated successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_URL}/auth/update-password`, { currentPassword, newPassword });
      showToast('Password updated successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed.';
      showToast(msg, 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken('');
    setUser(null);
    showToast('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, register, googleLogin, 
      forgotPassword, resetPassword, updateProfile, updatePassword, 
      logout, toasts, showToast 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
