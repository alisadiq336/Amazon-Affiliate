import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword, showToast } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const success = await resetPassword(token, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Password reset action failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page container animate-fade-in">
      <div className="login-card glass-panel" style={{ maxWidth: '440px' }}>
        
        <div className="login-header">
          <KeyRound size={36} className="login-icon" style={{ color: '#f59e0b' }} />
          <h1>New Password</h1>
          <p>Please enter and confirm your new secure password statement.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <div className="input-icon-wrapper">
              <KeyRound size={16} className="input-icon" />
              <input 
                id="password"
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-icon-wrapper">
              <KeyRound size={16} className="input-icon" />
              <input 
                id="confirmPassword"
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={submitting}
          >
            {submitting ? 'Updating credentials...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
