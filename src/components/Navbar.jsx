import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Hexagon, LogIn, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { MagneticButton } from './Spotlight';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="global-navbar glass-panel">
      <div className="navbar-container">
        <div className="nav-brand-clickable" onClick={handleLogoClick}>
          <Hexagon size={30} className="text-accent" />
          <span className="brand-text">Score<span className="smooth-gradient-text">Loom</span></span>
        </div>

        <div className="nav-actions-group">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {currentUser ? (
            <div className="auth-actions-logged-in">
              {currentUser !== 'guest' && (
                <MagneticButton
                  className="btn-primary"
                  onClick={() => navigate('/dashboard')}
                  style={{ padding: '8px 16px', marginRight: '10px' }}
                  strength={0.28}
                  maxShift={8}
                >
                  <LayoutDashboard size={16} /> <span className="hide-mobile">Dashboard</span>
                </MagneticButton>
              )}
              
              {currentUser !== 'guest' ? (
                <>
                  <div className="avatar-small" title={currentUser}>
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <MagneticButton
                    className="btn-secondary btn-nav-logout"
                    onClick={handleLogout}
                    strength={0.28}
                    maxShift={8}
                  >
                    <LogOut size={16} /> <span className="hide-mobile">Log out</span>
                  </MagneticButton>
                </>
              ) : (
                <MagneticButton
                  className="btn-secondary btn-nav-logout"
                  onClick={() => { logout(); navigate('/login'); }}
                  strength={0.28}
                  maxShift={8}
                >
                  <LogIn size={16} /> <span className="hide-mobile">Sign In</span>
                </MagneticButton>
              )}
            </div>
          ) : (
            <div className="auth-actions-logged-out">
              {location.pathname !== '/login' && (
                <MagneticButton
                  className="btn-primary"
                  onClick={() => navigate('/login')}
                  strength={0.28}
                  maxShift={8}
                >
                  <LogIn size={18} /> Sign In
                </MagneticButton>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
