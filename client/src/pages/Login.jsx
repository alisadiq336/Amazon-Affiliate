import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, Mail, User, Globe } from 'lucide-react';

const Login = () => {
  const { login, googleLogin, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If URL has ?admin=true, default to admin tab
  const isAdminParam = searchParams.get('admin') === 'true';

  const [roleMode, setRoleMode] = useState(isAdminParam ? 'admin' : 'customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync state if param changes
  useEffect(() => {
    setRoleMode(isAdminParam ? 'admin' : 'customer');
  }, [isAdminParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      const success = await login(email, password, roleMode);
      if (success) {
        if (roleMode === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Password authentication failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Google Sign-In Initializer
  useEffect(() => {
    /* global google */
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-placeholder.apps.googleusercontent.com";
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback
      });
      google.accounts.id.renderButton(
        document.getElementById("googleGsiBtn"),
        { theme: "outline", size: "large", width: 380 }
      );
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setSubmitting(true);
      await googleLogin(response.credential);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock Google Login for development
  const handleMockGoogleLogin = async () => {
    try {
      setSubmitting(true);
      
      // Generate a mock JWT payload
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payload = btoa(JSON.stringify({
        email: "googleuser@gmail.com",
        name: "Google Guest Tester",
        sub: "mockgoogleid123456",
        email_verified: true
      }));
      const signature = "mocksignature123";
      const mockToken = `${header}.${payload}.${signature}`;

      await googleLogin(mockToken);
      showToast('Mock Google Sign-In activated for development!');
      navigate('/');
    } catch (err) {
      console.error('Mock Google Sign-In failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page container animate-fade-in">
      <div className="login-card glass-panel">
        
        {/* Toggle Mode */}
        <div className="login-toggle-bar">
          <button 
            type="button"
            className={`toggle-btn ${roleMode === 'customer' ? 'active' : ''}`}
            onClick={() => setRoleMode('customer')}
          >
            <User size={14} />
            <span>Customer Login</span>
          </button>
          <button 
            type="button"
            className={`toggle-btn ${roleMode === 'admin' ? 'active' : ''}`}
            onClick={() => setRoleMode('admin')}
          >
            <ShieldAlert size={14} />
            <span>Admin Console</span>
          </button>
        </div>

        <div className="login-header">
          {roleMode === 'admin' ? (
            <>
              <ShieldAlert size={36} className="login-icon" />
              <h1>Administrator Portal</h1>
              <p>Sign in to edit catalogs and check clicks analytics.</p>
            </>
          ) : (
            <>
              <User size={36} className="login-icon" style={{ color: '#3b82f6' }} />
              <h1>Welcome Back</h1>
              <p>Sign in to explore reviews and manage recommendations.</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                id="email"
                type="email" 
                className="form-input" 
                placeholder={roleMode === 'admin' ? 'admin@amazonstore.com' : 'buyer@example.com'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row-reset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-icon-wrapper" style={{ marginTop: '0.5rem' }}>
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

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={submitting}
          >
            {submitting ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        {roleMode === 'customer' && (
          <>
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Google Sign-in Buttons */}
            <div className="google-auth-container">
              <div id="googleGsiBtn"></div>
              {/* Fallback button if GSI SDK not loaded or initialized yet */}
              <button 
                type="button" 
                onClick={handleMockGoogleLogin} 
                className="btn btn-secondary w-full google-signin-fallback-btn"
                disabled={submitting}
              >
                <Globe size={16} className="google-icon" />
                <span>Sign In with Google</span>
              </button>
            </div>

            <p className="login-footer-text">
              Don't have an account? <Link to="/signup">Create account</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
