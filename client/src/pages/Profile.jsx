import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, KeyRound, Save, Globe } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, updatePassword, loading } = useAuth();

  // Profile fields state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Sync state with loaded user
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email) return;

    setProfileSaving(true);
    try {
      await updateProfile(username, email);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const success = await updatePassword(currentPassword, newPassword);
      if (success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Password update failed:', err);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="container loader">Restoring profile details...</div>;
  }

  if (!user) {
    return (
      <div className="container error-container">
        <div className="glass-panel error-card">
          <h2>Access Denied</h2>
          <p>Please log in to manage your profile details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page container animate-fade-in" style={{ padding: '4rem 0' }}>
      <header className="catalog-header-redesign" style={{ padding: '0 0 2rem 0' }}>
        <h1>Account Profile</h1>
        <p>Manage email credentials, usernames, and authentication keys.</p>
      </header>

      <div className="category-manager-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Left Column: General profile details */}
        <div className="category-form-column glass-panel" style={{ height: 'fit-content' }}>
          <h2>Personal Details</h2>
          
          {user.googleId && (
            <div className="google-user-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600 }}>
              <Globe size={16} />
              <span>Registered via Google Social Sign-In</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="cat-inline-form">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-username">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input 
                  id="profile-username"
                  type="text" 
                  className="form-input" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  id="profile-email"
                  type="email" 
                  className="form-input" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={profileSaving} style={{ marginTop: '1rem' }}>
              <Save size={16} />
              <span>{profileSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Password updates */}
        <div className="categories-list-card glass-panel" style={{ height: 'fit-content' }}>
          <h2>Update Password</h2>
          
          <form onSubmit={handlePasswordSubmit} className="cat-inline-form">
            <div className="form-group">
              <label className="form-label" htmlFor="current-pwd">Current Password</label>
              <div className="input-icon-wrapper">
                <KeyRound size={16} className="input-icon" />
                <input 
                  id="current-pwd"
                  type="password" 
                  className="form-input" 
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pwd">New Password</label>
              <div className="input-icon-wrapper">
                <KeyRound size={16} className="input-icon" />
                <input 
                  id="new-pwd"
                  type="password" 
                  className="form-input" 
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pwd">Confirm New Password</label>
              <div className="input-icon-wrapper">
                <KeyRound size={16} className="input-icon" />
                <input 
                  id="confirm-pwd"
                  type="password" 
                  className="form-input" 
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={passwordSaving} style={{ marginTop: '1.25rem' }}>
              <Save size={16} />
              <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
