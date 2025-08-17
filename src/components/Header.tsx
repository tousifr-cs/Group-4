import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  onPostJob: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPostJob }) => {
  const { user, loading, signIn, signUp, signInWithGoogle, signOutUser, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', displayName: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(authData.email, authData.password, authData.displayName);
      } else {
        result = await signIn(authData.email, authData.password);
      }

      if (result.success) {
        setShowAuthModal(false);
        setAuthData({ email: '', password: '', displayName: '' });
        setError(null);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        setShowAuthModal(false);
        setError(null);
      } else {
        setError(result.error || 'Google sign in failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openAuthModal = (signUp: boolean = false) => {
    setIsSignUp(signUp);
    setShowAuthModal(true);
    setError(null);
    setShowForgotPassword(false);
    setAuthData({ email: '', password: '', displayName: '' });
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setError(null);
    setShowForgotPassword(false);
    setAuthData({ email: '', password: '', displayName: '' });
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setShowForgotPassword(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <h1>Now Jobs</h1>
          </div>
          <div className="loading-spinner"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <h1>Now Jobs</h1>
          </Link>
        </div>
        
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Browse Jobs</Link>
          <Link to="/career-advice" className="nav-link">Career Advice</Link>
          <Link to="/companies" className="nav-link">Companies</Link>
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="btn btn-primary" onClick={onPostJob}>
                Post a Job
              </button>
              <div className="profile-dropdown-container">
                <button 
                  className="profile-trigger"
                  onClick={toggleProfileDropdown}
                >
                  <div className="profile-avatar">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="profile-name">
                    {user?.displayName || user?.email}
                  </span>
                  <svg className="dropdown-arrow" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                  </svg>
                </button>
                
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                      </svg>
                      My Profile
                    </Link>
                    <Link 
                      to="/applications" 
                      className="dropdown-item"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
                      </svg>
                      My Applications
                    </Link>
                    <Link 
                      to="/saved-jobs" 
                      className="dropdown-item"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                      </svg>
                      Saved Jobs
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item sign-out-item"
                      onClick={handleSignOut}
                    >
                      <svg className="dropdown-icon" viewBox="0 0 24 24">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="btn btn-secondary" 
                onClick={() => openAuthModal(false)}
              >
                Sign In
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => openAuthModal(true)}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {showForgotPassword 
                  ? 'Reset Password' 
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </h2>
              <button 
                className="modal-close" 
                onClick={closeAuthModal}
              >
                ×
              </button>
            </div>
            
            {!showForgotPassword ? (
              <>
                {/* Google Sign In Button */}
                <div className="google-signin-section">
                  <button 
                    type="button"
                    className="btn btn-google"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <div className="divider">
                    <span>or</span>
                  </div>
                </div>

                <form onSubmit={handleAuth} className="auth-form">
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  
                  {isSignUp && (
                    <div className="form-group">
                      <label htmlFor="displayName">Full Name</label>
                      <input
                        type="text"
                        id="displayName"
                        value={authData.displayName}
                        onChange={(e) => setAuthData({ ...authData, displayName: e.target.value })}
                        required={isSignUp}
                        disabled={authLoading}
                        placeholder="Enter your full name"
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      required
                      disabled={authLoading}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={authData.password}
                      onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                      required
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    {isSignUp && (
                      <small className="password-hint">
                        Password must be at least 6 characters long
                      </small>
                    )}
                  </div>
                  
                  {!isSignUp && (
                    <div className="forgot-password">
                      <button 
                        type="button"
                        className="btn-link"
                        onClick={() => setShowForgotPassword(true)}
                        disabled={authLoading}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary auth-submit-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="forgot-password-form">
                <p className="forgot-password-text">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleAuth} className="auth-form">
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="resetEmail">Email</label>
                    <input
                      type="email"
                      id="resetEmail"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      required
                      disabled={authLoading}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary auth-submit-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            )}
            
            {!showForgotPassword && (
              <div className="auth-switch">
                <button 
                  className="btn-link" 
                  onClick={toggleAuthMode}
                  disabled={authLoading}
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            )}
            
            {showForgotPassword && (
              <div className="auth-switch">
                <button 
                  className="btn-link" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
