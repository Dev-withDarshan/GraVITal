import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, User, Eye, EyeOff, ShieldCheck, Mail, Lock, Sun, Moon, TrendingUp, Rocket, BarChart2, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import './AuthScreen.css';

const AstronautIcon = ({ size = 92, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Shoulders / Upper Suit */}
    <path d="M6 19.5c0-2 2-3.5 4-3.5h4c2 0 4 1.5 4 3.5v1.5H6v-1.5z" fill="currentColor" fillOpacity="0.15" />
    {/* Chest control panel */}
    <rect x="9.5" y="17.5" width="5" height="3.5" rx="1" fill="#000" stroke="currentColor" strokeWidth="1.2" />
    <line x1="11" y1="19.5" x2="13" y2="19.5" stroke="currentColor" strokeWidth="1" />
    <line x1="11" y1="20.5" x2="13" y2="20.5" stroke="currentColor" strokeWidth="1" />
    
    {/* Helmet outer shell */}
    <circle cx="12" cy="9.5" r="5.5" fill="#0c0a1c" stroke="currentColor" strokeWidth="1.8" />
    
    {/* Visor (dark inner screen) */}
    <path d="M9 9.5a3 3 0 1 1 6 0a3 3 0 0 1-6 0z" fill="#030208" stroke="currentColor" strokeWidth="1.2" />
    
    {/* Visor crescent reflection (left) */}
    <path d="M10.2 9a1.8 1.8 0 0 0 .4 1.3" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.95" />
    
    {/* Visor small reflection (right) */}
    <path d="M13.4 8.8a1.8 1.8 0 0 1 .4.7" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />

    {/* Helmet Side Knobs */}
    <rect x="5.7" y="8.5" width="0.8" height="2" rx="0.4" fill="currentColor" />
    <rect x="17.5" y="8.5" width="0.8" height="2" rx="0.4" fill="currentColor" />

    {/* Sparkle Stars around the helmet */}
    {/* Sparkle top-right */}
    <path d="M19 4v3M17.5 5.5h3" stroke="currentColor" strokeWidth="0.8" />
    {/* Sparkle mid-left */}
    <path d="M4 11v2.5M2.75 12.25h2.5" stroke="currentColor" strokeWidth="0.8" />
    {/* Sparkle low-right */}
    <path d="M19.5 13v2.5M18.25 14.25h2.5" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

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

      {/* ─── LEFT PANEL (Brand & Universe Description) ─── */}
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
            Track, predict, and improve your academic performance with the power of AI.
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
      {/* ─── RIGHT PANEL (Interactive Login/Signup Card) ─── */}
      <div className="auth-right-panel">
        <div className="auth-card-neon-border">
          <div className="auth-card-inner">
            <div className="auth-card-content">
              
              {/* Top Avatar Icon & Titles */}
              <div className="auth-form-title-group">
                <div className="title-header-inline">
                  <div className="title-profile-icon">
                    <AstronautIcon size={40} strokeWidth={2} />
                  </div>
                  <h2 className="auth-card-title">
                    {isLogin ? (
                      <span className="title-gradient-welcome">Welcome</span>
                    ) : (
                      <>
                        <span className="title-gradient-welcome">Create</span> <span className="title-text-back">Account</span>
                      </>
                    )}
                  </h2>
                </div>
                <p className="auth-card-subtitle">
                  {isLogin ? 'Log in to continue your journey' : 'Register to start your journey'}
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-interactive-form">
                
                {/* Username */}
                <div className="auth-input-group">
                  <div className="input-with-icon">
                    <User size={20} className="input-leading-icon" />
                    <input
                      type="text"
                      id="username"
                      className="auth-text-field"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Email (Signup only) */}
                {!isLogin && (
                  <div className="auth-input-group animate-fade-in">
                    <div className="input-with-icon">
                      <Mail size={20} className="input-leading-icon" />
                      <input
                        type="email"
                        id="email"
                        className="auth-text-field"
                        placeholder="VIT Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="auth-input-group">
                  <div className="input-with-icon">
                    <Lock size={20} className="input-leading-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="auth-text-field"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
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

                {/* Submit Button & Portal Vortex */}
                <div className="form-submit-group text-center">
                  <button
                    type="submit"
                    className="auth-submit-btn-premium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner-small" />
                    ) : (
                      <>
                        <Rocket size={24} className="btn-submit-rocket-icon" />
                        <span>{isLogin ? 'Enter System' : 'Create Account'}</span>
                        <ArrowRight size={24} className="btn-submit-icon" />
                      </>
                    )}
                  </button>
                  
                  {/* Slim glowing line under Enter System */}
                  <div className="submit-glow-line">
                    <div className="glow-line-core"></div>
                  </div>
                </div>
              </form>

              {/* Divider */}
              <div className="auth-divider-line">
                <div className="divider-line"></div>
                <span>or</span>
                <div className="divider-line"></div>
              </div>

              {/* Capsule Continue as Guest & Footer Toggle */}
              <div className="auth-card-footer">
                <div className="guest-login-option">
                  <button
                    type="button"
                    className="guest-login-btn-premium"
                    onClick={handleGuestLogin}
                  >
                    <span className="guest-icon-emoji">👽</span>
                    <span className="guest-text-span">Continue as Guest</span>
                    <ChevronRight size={18} className="chevron-icon" />
                  </button>
                </div>

                <div className="footer-toggle-container">
                  {isLogin ? (
                    <>
                      <span className="toggle-label-text">New Explorer?</span>
                      <button
                        type="button"
                        className="toggle-mode-btn-premium"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                      >
                        <span>Apply for Clearance (SignUp)</span>
                        <ChevronRight size={17} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="toggle-label-text">Returning Astronaut?</span>
                      <button
                        type="button"
                        className="toggle-mode-btn-premium"
                        onClick={() => { setIsLogin(true); setError(''); }}
                      >
                        <span>Initiate Login Sequence</span>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                  
                  {/* Slim glowing line under toggle */}
                  <div className="toggle-glow-line">
                    <div className="toggle-glow-line-core"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
