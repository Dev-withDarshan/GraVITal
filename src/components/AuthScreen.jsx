import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, User, Eye, EyeOff, ShieldCheck, Mail, Lock, Sun, Moon, TrendingUp, Rocket, BarChart2, Sparkles } from 'lucide-react';
import './AuthScreen.css';

export default function AuthScreen() {
  useEffect(() => {
    if (window.location.pathname === "/login") {
      localStorage.removeItem("token");
    }
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, loginAsGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

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
      if (!normalizedEmail || !normalizedEmail.endsWith('@vitstudent.ac.in')) {
        setError('A valid VIT email is required');
        return;
      }
      setLoading(true);
      try {
        const res = await signup(normalizedUsername, normalizedEmail, password);
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
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="auth-split-container">
      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="cosmic-background">
        <div className="bg-overlay-gradient"></div>
      </div>

      {/* ─── LEFT PANEL (Brand & Universe) ─── */}
      <div className="auth-left-panel">
        
        <div className="brand-header">
          <button className="brand-logo-group brand-logo-clickable" onClick={() => navigate('/')} aria-label="Go to home">
            <div className="logo-orb">
              <img src="/Logo.png" alt="GraVITal Logo" className="logo-img-tag" />
            </div>
            <span className="brand-name">Gra<span className="brand-name-highlight">VIT</span>al</span>
          </button>
        </div>

        <div className="brand-content-middle">
          <div className="brand-badge-tag">
            <Sparkles size={12} className="badge-sparkle" />
            <span>SMARTER ACADEMICS. <span className="badge-highlight-text">BETTER FUTURE.</span></span>
          </div>
          <h1 className="brand-headline">
            Your CGPA.<br />
            Your Journey.<br />
            <span className="brand-gradient-text">Our Intelligence.</span>
          </h1>
          <p className="brand-description">
            Track, predict, and improve your
            academic performance with the
            power of AI.
          </p>
        </div>

        <div className="brand-footer-section">
          <div className="trusted-badge-premium">
            <div className="badge-icon-bg-shield">
              <ShieldCheck size={20} className="badge-icon-shield" />
            </div>
            <div className="badge-text-group">
              <span className="badge-title">Trusted by students at VIT</span>
              <span className="badge-desc">Join thousands of VITians improving every day.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 3D GEOMETRIC ORBIT SYSTEM (Intelligent Energy Flow Model) ─── */}
      <div className="universe-container">
        <div className="orbit-plane">
          {/* Orbit Rings (Partial arcs, styled via CSS masks) */}
          <div className="orbit-ring ring-1"></div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-ring ring-3"></div>

        </div>
      </div>

      {/* ─── RIGHT PANEL (Interactive Login/Signup Card) ─── */}
      <div className="auth-right-panel">
        
        <div className="auth-card-neon-border">
          <div className="auth-card-inner">
            
            <div className="auth-card-content">
              <div className="auth-form-title-group">
                <div className="title-profile-icon">
                  <User size={20} />
                </div>
                <h2 className="auth-card-title">{isLogin ? 'Welcome back' : 'Create Account'}</h2>
                <p className="auth-card-subtitle">
                  {isLogin ? 'Log in to continue to your account.' : 'Register to start tracking your VIT academics.'}
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-interactive-form">
                {/* Username */}
                <div className="auth-input-group">
                  <label htmlFor="username" className="auth-input-label">Username</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-leading-icon" />
                    <input
                      type="text"
                      id="username"
                      className="auth-text-field"
                      placeholder="e.g. Darshan"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Email (Signup only) */}
                {!isLogin && (
                  <div className="auth-input-group animate-fade-in">
                    <label htmlFor="email" className="auth-input-label">VIT Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-leading-icon" />
                      <input
                        type="email"
                        id="email"
                        className="auth-text-field"
                        placeholder="e.g. darshan.k2024@vitstudent.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="auth-input-group">
                  <label htmlFor="password" className="auth-input-label">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-leading-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="auth-text-field"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                {isLogin && (
                  <div className="form-secondary-actions">
                    <label className="remember-me-checkbox">
                      <div className="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div className="checkbox-box">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="forgot-password-link">Forgot password?</button>
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-submit-group">
                  <button
                    type="submit"
                    className="auth-submit-btn-premium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner-small" />
                    ) : (
                      <>
                        <LogIn size={18} className="btn-submit-icon" />
                        <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="auth-divider-line">
                <div className="divider-line"></div>
                <span>or continue with</span>
                <div className="divider-line"></div>
              </div>

              {/* Social Logins */}
              <div className="social-buttons-grid">
                <button className="social-login-card" type="button" onClick={handleGuestLogin}>
                  <svg className="social-logo-svg-card" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.55 8.91 5.04 12 5.04z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.52z"/>
                    <path fill="#FBBC05" d="M5.36 14.88c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29l-3.86-3C.5 9.12 0 10.5 0 12s.5 2.88 1.5 4.5l3.86-3z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.09 0-5.73-2.51-6.64-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
                  </svg>
                </button>
                <button className="social-login-card" type="button" onClick={handleGuestLogin}>
                  <svg className="social-logo-svg-card" viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </button>
                <button className="social-login-card" type="button" onClick={handleGuestLogin}>
                  <svg className="social-logo-svg-card" viewBox="0 0 23 23" width="18" height="18">
                    <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
                    <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
                    <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00A1F1" />
                    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
                  </svg>
                </button>
              </div>

              <div className="auth-card-footer">
                <p className="footer-toggle-mode-text">
                  {isLogin ? "New explorer?" : "Already have an account?"}
                  <button
                    type="button"
                    className="toggle-mode-btn-premium"
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  >
                    {isLogin ? 'Apply for clearance (SignUp)' : 'Log in'}
                  </button>
                </p>
                <div className="guest-login-option">
                  <button
                    type="button"
                    className="guest-login-btn-premium"
                    onClick={handleGuestLogin}
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
