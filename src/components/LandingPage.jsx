import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Cloud, Shield, Calculator, LayoutDashboard, BarChart3, Sparkles, Camera } from 'lucide-react';
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

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Treat guests as logged out for the sake of the landing page UI
  const isRealUser = currentUser && currentUser !== 'guest';

  // Capitalize user's name dynamically (e.g., "darshan" -> "Darshan")
  const formattedName = currentUser
    ? currentUser.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  return (
    <>
      <div className="landing-container animate-fade-in">

        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-badge">Cloud-Powered Academic Engine 🚀</div>
          <InteractiveText className="hero-text-block">
            <h1 className="hero-title">
              {isRealUser ? (
                <>Welcome back, <br /><span className="smooth-gradient-text">{formattedName}</span>👋</>
              ) : (
                <>Weave Your <br /><span className="smooth-gradient-text">Academic Future</span></>
              )}
            </h1>
            <p className="hero-subtitle">
              {isRealUser
                ? "Let’s continue building your academic edge."
                : "Calculate semester GPA, track cumulative CGPA, plan target scores, and simulate grade changes — all in one modern dashboard."
              }
            </p>
          </InteractiveText>

          <div className="hero-actions">
            {isRealUser ? (
              <MagneticButton
                className="btn-primary hero-btn"
                onClick={() => navigate('/dashboard')}
                strength={0.35}
                maxShift={12}
              >
                Go to Dashboard <LayoutDashboard size={18} style={{ marginLeft: '8px' }} />
              </MagneticButton>
            ) : (
              <MagneticButton
                className="btn-primary hero-btn"
                onClick={() => navigate('/login')}
                strength={0.35}
                maxShift={12}
              >
                Get Started Free <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </MagneticButton>
            )}
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
            <h3>ScoreLoom Insights</h3>
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
