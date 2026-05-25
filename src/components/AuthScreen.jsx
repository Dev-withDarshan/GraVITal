import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, User, Eye, EyeOff } from 'lucide-react';
import './AuthScreen.css';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    const normalizedUsername = username.trim();

    if (isLogin) {
      setLoading(true);
      try {
        const res = await login(normalizedUsername, password);
        if (!res.success) {
          setError(res.error);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      const res = await signup(normalizedUsername, password);
      if (!res.success) setError(res.error);
      else navigate('/dashboard');
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="auth-container animate-fade-scale-in">
      <div className="auth-bg-layer">
        <div className="auth-bg-waves"></div>
        <div className="auth-bg-glows"></div>
      </div>
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="auth-brand-wrapper">
            <div className="auth-brand-glow" />
            <img 
              src="/Logo.png"
              alt="GraVITal Logo"
              className="auth-brand-logo"
            />
            <h1 className="auth-brand-title">
              Gra<span className="smooth-gradient-text">VIT</span>al
            </h1>
          </div>
          <p className="subtitle">{isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to start tracking.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="e.g. darshan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>


          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {!loading && (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
            {isLogin ? (loading ? "Signing you in..." : "Log In") : "Sign Up"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          className="btn-secondary guest-btn"
          onClick={handleGuestLogin}
          type="button"
        >
          <User size={18} />
          Continue as Guest
        </button>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              className="toggle-mode-btn"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
