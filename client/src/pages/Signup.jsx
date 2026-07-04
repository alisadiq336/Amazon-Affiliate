import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Globe, UserPlus } from 'lucide-react';

const Signup = () => {
  const { register, googleLogin, showToast } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    setSubmitting(true);
    try {
      const success = await register(username, email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration failed:', err);
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
        document.getElementById("googleGsiSignupBtn"),
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
      console.error('Google registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    try {
      setSubmitting(true);
      
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
        
        <div className="login-header">
          <UserPlus size={36} className="login-icon" style={{ color: '#10b981' }} />
          <h1>Create Account</h1>
          <p>Join AmzStore to get curated reviews and department picks.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input 
                id="username"
                type="text" 
                className="form-input" 
                placeholder="Jane Doe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input 
                id="email"
                type="email" 
                className="form-input" 
                placeholder="jane@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
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

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4" 
            disabled={submitting}
          >
            {submitting ? 'Creating profile...' : 'Register Account'}
          </button>
        </form>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <div className="google-auth-container">
          <div id="googleGsiSignupBtn"></div>
          <button 
            type="button" 
            onClick={handleMockGoogleLogin} 
            className="btn btn-secondary w-full google-signin-fallback-btn"
            disabled={submitting}
          >
            <Globe size={16} className="google-icon" />
            <span>Sign Up with Google</span>
          </button>
        </div>

        <p className="login-footer-text">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;
