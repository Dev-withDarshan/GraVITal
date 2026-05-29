import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle2,
  Brain,
  BarChart3,
  Flag,
  Lightbulb,
  Shield,
  Cloud
} from 'lucide-react';
import { SpotlightCard } from './Spotlight';
import './WhyGraVITal.css';

export function WhyGraVITalGrid() {
  return (
    <section className="prof-why-section">
      {/* Sub-badge tagline */}
      <div className="prof-why-sub-badge">
        🚀 Built for VIT students aiming for 9+ CGPA
      </div>

      {/* Badge */}
      <div className="prof-why-badge">
        <Sparkles size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> WHY GRAVITAL?
      </div>

      {/* Main Title */}
      <h2 className="prof-why-title">
        Everything you need to <span className="prof-why-title-highlight">plan</span>, <span className="prof-why-title-highlight">predict</span>, and <span className="prof-why-title-highlight">excel</span>
      </h2>
      
      {/* Subtitle */}
      <p className="prof-why-subtitle">Powerful tools designed specifically for VIT students</p>
      
      {/* Trusted badge */}
      <div className="prof-why-trusted-badge">
        <div className="trusted-icon-circle">
          <Check size={10} strokeWidth={3} />
        </div>
        <span>Trusted by students who take their CGPA seriously.</span>
      </div>

      {/* 3 Horizontal Feature Highlights */}
      <div className="prof-why-highlights-bar">
        <div className="highlight-item">
          <div className="highlight-icon-wrap">
            <Target size={18} />
          </div>
          <div className="highlight-text">
            <h4>Built for VIT</h4>
            <p>Tailored to VIT's grading system for accurate results.</p>
          </div>
        </div>
        
        <div className="highlight-divider" />

        <div className="highlight-item">
          <div className="highlight-icon-wrap">
            <Brain size={18} />
          </div>
          <div className="highlight-text">
            <h4>Predict Your Future</h4>
            <p>AI-powered insights to predict your CGPA and plan ahead.</p>
          </div>
        </div>

        <div className="highlight-divider" />

        <div className="highlight-item">
          <div className="highlight-icon-wrap">
            <BarChart3 size={18} />
          </div>
          <div className="highlight-text">
            <h4>Make Smarter Decisions</h4>
            <p>Data-driven strategies to help you achieve your academic goals.</p>
          </div>
        </div>
      </div>

      {/* Capsule Comparison Tagline */}
      <div className="prof-comparison-capsule">
        <span>
          Unlike generic CGPA calculators, <strong className="brand-accent">GraVITal</strong> helps you <strong className="action-accent">plan</strong>, <strong className="action-accent">predict</strong>, and <strong className="action-accent">optimize</strong> your academic future.
        </span>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="prof-why-grid">
        <SpotlightCard className="prof-why-card">
          <div className="prof-why-card-glow-bar" />
          <div className="prof-why-card-header-row">
            <div className="prof-why-card-icon-wrap">
              <Calculator size={20} className="prof-why-card-icon" />
            </div>
            <h3 className="prof-why-card-title">Accurate Calculators</h3>
          </div>
          <p className="prof-why-card-desc">SGPA, CGPA, and weighted calculations — aligned 100% with VIT grading system.</p>
          <div className="prof-why-card-badge">
            <CheckCircle2 size={12} /> <span>100% Accurate</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="prof-why-card">
          <div className="prof-why-card-glow-bar" />
          <div className="prof-why-card-header-row">
            <div className="prof-why-card-icon-wrap">
              <TrendingUp size={20} className="prof-why-card-icon" />
            </div>
            <h3 className="prof-why-card-title">GPA Simulator</h3>
          </div>
          <p className="prof-why-card-desc">Simulate grades and see exactly how each subject impacts your CGPA.</p>
          <div className="prof-why-card-badge">
            <Zap size={12} /> <span>Instant Impact</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="prof-why-card">
          <div className="prof-why-card-glow-bar" />
          <div className="prof-why-card-header-row">
            <div className="prof-why-card-icon-wrap">
              <Target size={20} className="prof-why-card-icon" />
            </div>
            <h3 className="prof-why-card-title">Target Planner</h3>
          </div>
          <p className="prof-why-card-desc">Don't guess — get a clear, personalized roadmap to reach your target CGPA.</p>
          <div className="prof-why-card-badge">
            <Flag size={12} /> <span>Personalized Roadmap</span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="prof-why-card">
          <div className="prof-why-card-glow-bar" />
          <div className="prof-why-card-header-row">
            <div className="prof-why-card-icon-wrap">
              <Zap size={20} className="prof-why-card-icon" />
            </div>
            <h3 className="prof-why-card-title">What-If Analysis</h3>
          </div>
          <p className="prof-why-card-desc">Test scenarios before exams and avoid costly grade mistakes.</p>
          <div className="prof-why-card-badge">
            <Lightbulb size={12} /> <span>Plan Smarter</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

export function CTABanner() {
  const navigate = useNavigate();

  return (
    <section className="prof-cta-banner">
      <div className="prof-cta-content">
        <span className="prof-cta-subtitle">Stop guessing your CGPA. Start controlling it.</span>
        <h2 className="prof-cta-title">
          Every mark matters.
          <span className="prof-cta-title-sub">Plan it. Predict it. Own it.</span>
        </h2>
        
        <div className="prof-cta-actions-row">
          <button className="prof-cta-btn" onClick={() => navigate('/dashboard')}>
            Start Optimizing Now <ArrowRight size={16} />
          </button>

          {/* Bullet features highlights at bottom */}
          <div className="prof-cta-bullets">
            <div className="bullet-item">
              <div className="bullet-icon-wrap">
                <Shield size={14} />
              </div>
              <div className="bullet-text">
                <strong>Secure & Private</strong>
                <span>Your data is safe and encrypted.</span>
              </div>
            </div>
            <div className="bullet-item">
              <div className="bullet-icon-wrap">
                <Cloud size={14} />
              </div>
              <div className="bullet-text">
                <strong>Access Anywhere</strong>
                <span>Seamless sync across all devices.</span>
              </div>
            </div>
            <div className="bullet-item">
              <div className="bullet-icon-wrap">
                <Sparkles size={14} />
              </div>
              <div className="bullet-text">
                <strong>Made for Toppers</strong>
                <span>Tools to help you stay 1 step ahead.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="prof-cta-visual">
        <div className="prof-cta-glow-circle" />
        
        {/* Orbit Tracks & Orbiting Icons inside Visual */}
        <svg className="prof-cta-orbits-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orbit paths */}
          <ellipse cx="100" cy="100" rx="90" ry="30" stroke="rgba(124, 58, 237, 0.15)" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-15 100 100)" />
          <ellipse cx="100" cy="100" rx="75" ry="20" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.8" strokeDasharray="4 4" transform="rotate(10 100 100)" />
          
          {/* Sparkles / Particles */}
          <circle cx="25" cy="90" r="1.5" fill="#a78bfa" opacity="0.6" />
          <circle cx="170" cy="110" r="1" fill="#22d3ee" opacity="0.5" />
          <path d="M165 40 L167 43 L170 44 L167 45 L165 48 L163 45 L160 44 L163 43 Z" fill="#a78bfa" opacity="0.4" />
          <path d="M35 150 L36 152 L38 153 L36 154 L35 156 L34 154 L32 153 L34 152 Z" fill="#22d3ee" opacity="0.5" />
        </svg>

        {/* Floating Mini Widgets on Orbits */}
        <div className="orbiting-widget widget-left">
          <BarChart3 size={12} />
        </div>
        <div className="orbiting-widget widget-right">
          <Target size={12} />
        </div>

        {/* 3D Mortarboard Cap SVG (Enhanced version) */}
        <svg className="prof-cta-cap-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="capBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="glassFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.03" />
            </linearGradient>
            <filter id="capNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Under shadow */}
          <ellipse cx="80" cy="98" rx="42" ry="7" fill="#000" fillOpacity="0.4" />

          {/* Pedestal base - back part */}
          <path d="M 52 74 C 52 66, 108 66, 108 74 L 108 86 C 108 94, 52 94, 52 86 Z" 
                fill="rgba(124, 58, 237, 0.08)" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.4" />
          
          {/* Pedestal base - front part */}
          <path d="M 52 74 C 52 82, 108 82, 108 74" fill="none" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M 52 86 C 52 94, 108 94, 108 86" fill="none" stroke="url(#capBorderGrad)" strokeWidth="2.5" filter="url(#capNeonGlow)" />

          {/* Rhombus - Bottom Plate Face */}
          <path d="M 30 46 Q 25 48 30 50 L 77 68 Q 82 70 87 68 L 133 50 Q 138 48 133 46 L 87 24 Q 82 22 77 24 Z" 
                fill="rgba(255, 255, 255, 0.02)" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Vertical Link Corners (for 3D thickness) */}
          <line x1="25" y1="43" x2="25" y2="48" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="82" y1="65" x2="82" y2="70" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="138" y1="37" x2="138" y2="42" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="82" y1="17" x2="82" y2="22" stroke="url(#capBorderGrad)" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Rhombus - Top Plate Face */}
          <path d="M 30 41 Q 25 43 30 45 L 77 63 Q 82 65 87 63 L 133 45 Q 138 43 133 41 L 87 19 Q 82 17 77 19 Z" 
                fill="url(#glassFace)" stroke="url(#capBorderGrad)" strokeWidth="2.2" filter="url(#capNeonGlow)" />

          {/* Center Button */}
          <circle cx="82" cy="40" r="3.5" fill="#ffffff" filter="url(#capNeonGlow)" />
          <circle cx="82" cy="40" r="1.5" fill="#818cf8" />

          {/* Tassel String */}
          <path d="M 82 40 Q 62 41 49 49 Q 46 52 46 78" stroke="url(#capBorderGrad)" strokeWidth="2" strokeLinecap="round" fill="none" filter="url(#capNeonGlow)" />
          
          {/* Tassel Bulb */}
          <path d="M 46 78 C 43 81 43 91 46 91 C 49 91 49 81 46 78 Z" fill="url(#capBorderGrad)" filter="url(#capNeonGlow)" />
          <rect x="44" y="77" width="4.5" height="2" rx="0.5" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="prof-footer">
      <div className="prof-footer-left">
        <span>© 2026 GraVITal. All rights reserved.</span>
      </div>
      <div className="prof-footer-right">
        <div className="prof-footer-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Protocol</a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>GraVITal Terms</a>
          <a href="mailto:darshanedu2256@gmail.com">System Support</a>
        </div>
        <div className="prof-footer-socials">
          <a href="https://www.instagram.com/_darshan2256?igsh=bjhpemsyNDh6emgz" target="_blank" rel="noopener noreferrer" className="prof-social-link" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/kdarshan2256/" target="_blank" rel="noopener noreferrer" className="prof-social-link" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href="https://github.com/Dev-withDarshan" target="_blank" rel="noopener noreferrer" className="prof-social-link" aria-label="GitHub">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function WhyGraVITalSection() {
  return (
    <div className="why-gravital-section-container">
      <WhyGraVITalGrid />
      <CTABanner />
      <Footer />
    </div>
  );
}
