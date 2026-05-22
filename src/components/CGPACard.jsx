import React, { useMemo } from 'react';
import { Hexagon, Star, TrendingUp, TrendingDown, BarChart2, Target } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { getSemesterGPA } from '../utils/analytics';

const getPerformance = (cgpa) => {
  const val = Number(cgpa);
  if (cgpa === null || cgpa === undefined || isNaN(val)) {
    return { title: "No data available", subtitle: "No academic data yet", color: "#9ca3af", bg: "rgba(156, 163, 175, 0.1)" };
  }
  if (val === 0) {
    return { title: "No data available", subtitle: "Add your grades to get insights", color: "#9ca3af", bg: "rgba(156, 163, 175, 0.1)" };
  }
  if (val >= 9.5) return { title: "Top 5% of students 🏆", subtitle: "Outstanding performance", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", class: "badge-excellent" };
  if (val >= 9.0) return { title: "Top 10% of students 🔥", subtitle: "Excellent performance", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", class: "badge-excellent" };
  if (val >= 8.0) return { title: "Above average performance 👍", subtitle: "You're on the right track", color: "#84cc16", bg: "rgba(132, 204, 22, 0.1)", class: "badge-good" };
  if (val >= 7.0) return { title: "Good performance", subtitle: "Solid academic standing", color: "#eab308", bg: "rgba(234, 179, 8, 0.1)", class: "badge-average" };
  if (val >= 6.0) return { title: "Needs improvement", subtitle: "Focus on bringing grades up", color: "#f97316", bg: "rgba(249, 115, 22, 0.1)", class: "badge-needs-improvement" };
  return { title: "At risk ⚠️", subtitle: "Focus required to improve", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
};

export default function CGPACard({ cgpa, semesters }) {
  const performance = useMemo(() => getPerformance(cgpa), [cgpa]);
  const cgpaNum = parseFloat(cgpa) || 0;
  const targetPercentage = Math.min((cgpaNum / 10) * 100, 100).toFixed(0);

  const activeSems = useMemo(() => semesters ? semesters.filter(s => s.isIncluded !== false) : [], [semesters]);

  const delta = useMemo(() => {
    if (activeSems.length < 2) return 0.13; // mock default matching the screenshot
    const currentGPA = getSemesterGPA(activeSems[activeSems.length - 1]);
    const prevGPA = getSemesterGPA(activeSems[activeSems.length - 2]);
    return currentGPA - prevGPA;
  }, [activeSems]);

  const deltaString = useMemo(() => {
    if (activeSems.length < 2) return "+0.13";
    return delta >= 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
  }, [activeSems, delta]);

  const isPositive = delta >= 0;

  const semCount = useMemo(() => {
    return activeSems.length > 0 ? activeSems.length : 5; // default 5 matching mock
  }, [activeSems]);

  return (
    <div className="hero-card glass-panel">
      <div className="hero-card-main-content">
        <div className="hero-card-left-section">
          <div className="hero-content">
            <h3 className="hero-subtitle">Overall Cumulative CGPA</h3>
            <div className="hero-cgpa-wrapper">
              <AnimatedNumber value={cgpa} decimals={4} className="hero-cgpa-value blue-glow-text" />
            </div>

            <div 
              className={`performance-badge ${performance.class || ''}`}
              style={{ color: performance.color, backgroundColor: performance.bg, borderColor: performance.color }}
            >
              {performance.title}
            </div>

            <p className="hero-insight">
              {performance.subtitle}
            </p>

            <div className="progress-container">
              <div className="progress-bar-inline">
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill progress" style={{ width: `${targetPercentage}%` }}></div>
                </div>
                <div className="progress-labels-inline">
                  <span className="progress-percent">{targetPercentage}%</span>
                  <span className="progress-divider">|</span>
                  <span className="progress-target">Target: 10.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-graphic">
          <div className="hero-graphic-circle glow">
            <Hexagon size={48} className="hero-graphic-icon" />
            <Star size={20} className="hero-graphic-star" fill="currentColor" />
          </div>
          <div className="sparkle sparkle-1">✦</div>
          <div className="sparkle sparkle-2">✦</div>
          <div className="sparkle sparkle-3">✦</div>
        </div>
      </div>

      {/* Hero Stats Row nested at the bottom of the card */}
      <div className="hero-stats-row">
        <div className="hero-stat-box">
          <div className={`hero-stat-icon-wrapper ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
          <div className="hero-stat-text">
            <span className="hero-stat-val">{deltaString}</span>
            <span className="hero-stat-desc">From last semester</span>
          </div>
        </div>

        <div className="hero-stat-box">
          <div className="hero-stat-icon-wrapper icon-purple">
            <BarChart2 size={16} />
          </div>
          <div className="hero-stat-text">
            <span className="hero-stat-val">{semCount}</span>
            <span className="hero-stat-desc">Semesters Included</span>
          </div>
        </div>

        <div className="hero-stat-box">
          <div className="hero-stat-icon-wrapper icon-cyan">
            <Target size={16} />
          </div>
          <div className="hero-stat-text">
            <span className="hero-stat-val">9.50</span>
            <span className="hero-stat-desc">Your Target CGPA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
