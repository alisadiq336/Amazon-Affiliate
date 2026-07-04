import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page container animate-fade-in">
      <div className="login-card glass-panel" style={{ maxWidth: '480px' }}>
        
        <Link to="/login" className="back-link" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>

        <div className="login-header">
          {success ? (
            <CheckCircle size={36} className="login-icon" style={{ color: '#10b981' }} />
          ) : (
            <HelpCircle size={36} className="login-icon" />
          )}
          <h1>Reset Password</h1>
          <p>
            {success 
              ? 'Password reset instructions have been triggered!' 
              : 'Enter your email address to receive password recovery details.'}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  id="email"
                  type="email" 
                  className="form-input" 
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mt-4" 
              disabled={submitting}
            >
              {submitting ? 'Generating link...' : 'Generate Reset Link'}
            </button>
          </form>
        ) : (
          <div className="reset-success-box" style={{ marginTop: '1rem', textAlign: 'center' }}>
            <div className="alert-success-text" style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Reset link successfully generated!
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.6, backgroundColor: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Because SMTP/email settings depend on SMTP server configurations, 
              <strong> the password reset link has been logged directly inside your backend terminal console!</strong> 
              Check your running server terminal logs to grab the link and paste it into your browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
