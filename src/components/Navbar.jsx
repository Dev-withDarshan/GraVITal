import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDashboardTab } from '../context/DashboardTabContext';
import { LogIn, LogOut, LayoutDashboard, Sun, Moon, ChevronDown, Menu, X, Save, User, TrendingUp } from 'lucide-react';
import { MagneticButton } from './Spotlight';
import { capitalizeName } from '../utils/helpers';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, isGuest, logout, profileData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeTab, setActiveTab, onSave, saveStatus } = useDashboardTab();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAuthenticated = !!currentUser;
  // isGuest comes from AuthContext (localStorage-backed flag)

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const navTabs = [
    { key: 'semester', label: 'Semester GPA' },
    { key: 'overall', label: 'CGPA' },
    { key: 'target', label: 'Target CGPA' },
    { key: 'simulator', label: 'What-If' },
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.key);
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
    setMobileMenuOpen(false);
  };

  const isOnDashboard = location.pathname === '/dashboard';
  const isAuthScreen = location.pathname === '/login';

  return (
    <nav className={`navbar-premium ${isAuthScreen ? 'navbar-hidden-until-hover' : ''}`}>
      <div className="navbar-inner">
        {/* ── LEFT: Logo ── */}
        <div className="navbar-left">
          {(isAuthenticated || isGuest) && (
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <div className="nav-brand-clickable" onClick={handleLogoClick}>
            <img src="/Logo.png" alt="GraVITal Logo" className="navbar-logo" />
            <span className="brand-text">Gra<span className="smooth-gradient-text">VIT</span>al</span>
          </div>
        </div>

        {/* ── CENTER: Navigation Tabs ── */}
        <div className="navbar-center">
          {(isAuthenticated || isGuest) && (
            <div className="nav-tabs-container">
              {navTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`nav-tab ${isOnDashboard && activeTab === tab.key ? 'nav-tab-active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Actions ── */}
        <div className="navbar-right">
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {(isAuthenticated || isGuest) ? (
            <div className="auth-actions-logged-in">
              {isAuthenticated && onSave && (
                <MagneticButton
                  className="btn-primary navbar-save-btn"
                  onClick={onSave}
                  strength={0.28}
                  maxShift={8}
                >
                  <Save size={16} /> <span className="hide-mobile">{saveStatus || 'Save to Cloud'}</span>
                </MagneticButton>
              )}

              {isAuthenticated ? (
                <div className="avatar-dropdown-wrapper" ref={dropdownRef}>
                  <button
                    className="avatar-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Profile menu"
                  >
                    <div className="avatar-small" title={profileData.name || currentUser}>
                      {profileData.profilePhoto ? (
                        <img src={profileData.profilePhoto} alt={profileData.name || currentUser} className="avatar-img-small" />
                      ) : (
                        <div className="avatar-fallback-gradient">
                          {(profileData.name || currentUser).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={14} className={`avatar-chevron ${dropdownOpen ? 'avatar-chevron-open' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="avatar-dropdown animate-scale-in">
                      <div className="dropdown-user-info">
                        <div className="dropdown-avatar">
                          {profileData.profilePhoto ? (
                            <img src={profileData.profilePhoto} alt={profileData.name || currentUser} className="dropdown-avatar-img" />
                          ) : (
                            <div className="avatar-fallback-gradient w-full h-full flex items-center justify-center">
                              {(profileData.name || currentUser).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="dropdown-user-details">
                          <span className="dropdown-user-name">{capitalizeName(profileData.name || currentUser)}</span>
                          <span className="dropdown-user-email">{profileData.email || `${currentUser}@vitstudent.ac.in`}</span>
                        </div>
                      </div>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                        <User size={16} />
                        <span>Profile</span>
                      </button>
                      <button className="dropdown-item" onClick={() => { navigate('/score-flow'); setDropdownOpen(false); }}>
                        <TrendingUp size={16} />
                        <span>Score Flow</span>
                      </button>
                      <button className="dropdown-item dropdown-item-danger" onClick={() => { handleLogout(); setDropdownOpen(false); }}>
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Guest user: show Sign In button to prompt real login
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

      {/* ── Mobile Slide-Down Nav ── */}
      {(isAuthenticated || isGuest) && mobileMenuOpen && (
        <div className="mobile-nav-drawer animate-fade-in">
          {navTabs.map((tab) => (
            <button
              key={tab.key}
              className={`mobile-nav-tab ${isOnDashboard && activeTab === tab.key ? 'mobile-nav-tab-active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
