import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Cloud, Shield, Calculator, LayoutDashboard, BarChart3, Sparkles, Camera, GraduationCap, Gift, ChevronsRight, Rocket } from 'lucide-react';
import './LandingPage.css';
import { SpotlightCard, MagneticButton } from './Spotlight';

// Component for sub-pixel localized text brightening
const InteractiveText = ({ children, as: Component = 'div', className = '' }) => {
  const ref = React.useRef(null);

  const onMove = React.useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
    el.style.setProperty('--spot-op', '1');
  }, []);

  const onLeave = React.useCallback(() => {
    ref.current?.style.setProperty('--spot-op', '0');
  }, []);

  return (
    <Component
      className={`interactive-text-container ${className}`}
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="interactive-text-base">
        {children}
      </div>
      <div className="interactive-text-glow" aria-hidden="true" style={{ userSelect: 'none' }}>
        {children}
      </div>
    </Component>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, profileData } = useAuth();

  // Treat guests as logged out for the sake of the landing page UI
  const isRealUser = currentUser && currentUser !== 'guest';

  // Capitalize user's name dynamically (e.g., "darshan" -> "Darshan")
  const displayName = profileData?.name?.trim() || currentUser || '';
  const formattedName = displayName
    ? displayName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  return (
    <>
      <div className="landing-container animate-fade-in">

        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-grid-overlay" />
          <div className="hero-glow-arc" />
          <div className="hero-glow-radial-light" />
          <div className="hero-glow-line" />

          {/* Top Badge */}
          <div className="hero-badge-premium">
            <span>⚡ Grade Intelligence for VIT</span>
          </div>

          {isRealUser ? (
            <InteractiveText className="hero-text-block">
              <h1 className="hero-title-premium">
                <span className="shining-silver-text">{getGreeting()},</span> <br />
                <span className="blue-glow-text">{formattedName}</span> <span className="native-emoji">👋</span>
              </h1>
              <p className="hero-description-premium">
                Let’s continue building your <span className="highlight-edge">academic edge</span>,
                Powered by <span className="highlight-edge">Gravital</span> — Grade VIT For All❗
              </p>
            </InteractiveText>
          ) : (
            <>
              {/* Title */}
              <h1 className="hero-title-premium">
                Gra<span className="smooth-gradient-text">VIT</span>al
              </h1>

              {/* Sub Headline */}
              <h2 className="hero-subheadline">
                Because every <span className="gradient-001">0.01</span> is vital.
              </h2>

              {/* Supporting Text */}
              <p className="hero-description">
                Calculate, simulate, and optimize your GPA — instantly.
              </p>
            </>
          )}

          {/* CTA Actions */}
          <div className="hero-actions">
            {isRealUser ? (
              <button
                className="btn-premium-dashboard"
                onClick={() => navigate('/dashboard')}
              >
                <div className="btn-icon-left">
                  <BarChart3 size={20} />
                </div>
                <div className="btn-content-center">
                  <span className="btn-title">Go to Dashboard</span>
                  <span className="btn-subtitle">TRACK. ANALYZE. EXCEL.</span>
                </div>
                <div className="btn-icon-right">
                  <ChevronsRight size={24} />
                </div>
              </button>
            ) : (
              <div className="neon-cta-wrapper">
                <button
                  className="btn-neon-get-started"
                  onClick={() => navigate('/login')}
                >
                  <div className="neon-btn-icon neon-icon-left">
                    <Rocket size={22} strokeWidth={2.5} />
                  </div>
                  <span className="neon-btn-text">Get Started</span>
                  <div className="neon-btn-icon neon-icon-right">
                    <ArrowRight size={22} strokeWidth={2.5} />
                  </div>
                </button>
                <div className="neon-cta-subtitle">
                  <span className="neon-dot neon-dot-left"></span>
                  Start tracking your academic performance instantly
                  <span className="neon-dot neon-dot-right"></span>
                </div>
                <div className="neon-floor-glow"></div>
              </div>
            )}
          </div>

          {/* Lower Feature Bar */}
          <div className="hero-feature-bar">
            <div className="feature-bar-item">
              <div className="item-icon-wrapper">
                <GraduationCap size={20} />
              </div>
              <div className="item-text">
                <span className="item-title">SGPA</span>
                <span className="item-desc">Per Semester</span>
              </div>
            </div>
            <div className="feature-bar-divider" />
            <div className="feature-bar-item">
              <div className="item-icon-wrapper">
                <BarChart3 size={20} />
              </div>
              <div className="item-text">
                <span className="item-title">CGPA</span>
                <span className="item-desc">Cumulative</span>
              </div>
            </div>
            <div className="feature-bar-divider" />
            <div className="feature-bar-item">
              <div className="item-icon-wrapper">
                <Gift size={20} />
              </div>
              <div className="item-text">
                <span className="item-title">100% Free</span>
                <span className="item-desc">Always</span>
              </div>
            </div>
          </div>
        </header>

        {/* Feature Cards Section */}
        <section className="features-section">
          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><Calculator size={32} /></div>
            <h3>Precision Calculation</h3>
            <p>Splits subjects into Theory and Labs with official S-to-F credit-based grading. Perfect precision, every time.</p>
          </SpotlightCard>

          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><BarChart3 size={32} /></div>
            <h3>GraVITal Insights</h3>
            <p>Track your academic trajectory over time. Our dynamic dashboard visualizes your semester-over-semester progress.</p>
          </SpotlightCard>

          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><Sparkles size={32} /></div>
            <h3>What-If Simulator</h3>
            <p>Toggle individual grades and see real-time GPA impact with delta indicators. Perfect for strategic planning before results.</p>
          </SpotlightCard>

          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><Cloud size={32} /></div>
            <h3>Cloud Synced Securely</h3>
            <p>Your academic data isn't trapped on your device. Save your grade history securely to a global MongoDB database linked to your account.</p>
          </SpotlightCard>

          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><Shield size={32} /></div>
            <h3>Instant Guest Mode</h3>
            <p>Use the full calculation engine completely offline. Process grades in your browser cache — no account creation required.</p>
          </SpotlightCard>

          <SpotlightCard className="glass-panel feature-card">
            <div className="feature-icon"><Camera size={32} /></div>
            <h3>AI Screenshot Import</h3>
            <p>Snap your registration page and let integrated Gemini Vision AI extract every subject and credit — zero manual typing required.</p>
          </SpotlightCard>
        </section>

      </div>
    </>
  );
}
