import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0e1a' }}>
        <div style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 600 }}>Verifying console access credentials...</div>
      </div>
    );
  }

  // Restrict access specifically to users with the 'admin' role
  return user && user.role === 'admin' ? children : <Navigate to="/login?admin=true" replace />;
};

export default AdminRoute;
