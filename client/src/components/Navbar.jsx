import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LogIn, LayoutDashboard, LogOut, User, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-logo">
          <ShoppingBag className="logo-icon" size={26} />
          <span>Amz<span className="logo-highlight">Store</span></span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/catalog" className="navbar-link">Explore Products</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="admin-nav-actions">
              <span className="admin-badge">
                Role: {user.role.toUpperCase()}
              </span>
              
              <Link to="/profile" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={16} />
                <span>Hi, {user.username}</span>
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.45rem 1rem' }}>
                  <LayoutDashboard size={14} />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.45rem' }} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                <UserPlus size={14} />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
