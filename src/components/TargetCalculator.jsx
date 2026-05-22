import React, { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, BookOpen, GraduationCap, Crosshair, Layers, Lightbulb, Sparkles } from 'lucide-react';
import './Calculator.css';

/* ── SVG Progress Ring ── */
const ProgressRing = ({ value, max = 10, size = 200, strokeWidth = 10, isImpossible }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(value, max);
  const progress = clampedValue / max;
  const dashOffset = circumference * (1 - progress);

  const color = isImpossible ? '#EF4444' : '#6366F1';
  const glowColor = isImpossible ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="target-ring">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease', filter: `drop-shadow(0 0 8px ${glowColor})` }}
      />
    </svg>
  );
};

export default function TargetCalculator({ initialData, onChange }) {
  const [currentCredits, setCurrentCredits] = useState(initialData?.currentCredits || '');
  const [currentCGPA, setCurrentCGPA] = useState(initialData?.currentCGPA || '');
  const [targetCGPA, setTargetCGPA] = useState(initialData?.targetCGPA || '');
  const [nextSemCredits, setNextSemCredits] = useState(initialData?.nextSemCredits || '');

  const handleCGPAChange = (e, setter) => {
    let val = e.target.value;
    if (val.includes('.') && val.split('.')[1].length > 2) return;
    setter(val);
  };

  const getCGPAError = (val) => {
    if (!val) return '';
    const num = Number(val);
    if (num < 0 || num > 10) return 'CGPA must be between 0 and 10';
    return '';
  };

  const currentCGPAError = getCGPAError(currentCGPA);
  const targetCGPAError = getCGPAError(targetCGPA);
  const hasErrors = !!currentCGPAError || !!targetCGPAError;

  React.useEffect(() => {
    if (onChange) {
      onChange({
        currentCredits,
        currentCGPA,
        targetCGPA,
        nextSemCredits
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCredits, currentCGPA, targetCGPA, nextSemCredits]);

  const calculateRequiredGPA = () => {
    if (hasErrors || !currentCredits || !currentCGPA || !targetCGPA || !nextSemCredits) return null;

    const currCred = Number(currentCredits);
    const currCGPA = Number(currentCGPA);
    const tarCGPA = Number(targetCGPA);
    const nextCred = Number(nextSemCredits);

    if (currCred < 0 || currCGPA < 0 || tarCGPA < 0 || nextCred <= 0) return null;

    const currentTotalPoints = currCGPA * currCred;
    const requiredTotalPoints = tarCGPA * (currCred + nextCred);
    const requiredForNextSem = requiredTotalPoints - currentTotalPoints;
    let requiredGPA = requiredForNextSem / nextCred;

    if (requiredGPA < 0) requiredGPA = 0;

    return requiredGPA.toFixed(2);
  };

  const requiredGPA = calculateRequiredGPA();
  const isImpossible = requiredGPA !== null && Number(requiredGPA) > 10;
  const hasResult = requiredGPA !== null;
  const gpaNum = requiredGPA ? Number(requiredGPA) : 0;

  // Generate insight message
  const getInsight = () => {
    if (!hasResult) return { icon: Lightbulb, text: 'Enter your details above to see what GPA you need next semester.', sub: '' };
    if (isImpossible) return { icon: TrendingDown, text: 'You need a higher GPA next semester.', sub: 'Focus on improving your performance!' };
    if (gpaNum >= 9) return { icon: TrendingUp, text: 'This is a stretch goal — you\'ll need top grades.', sub: 'Aim for S and A grades in every subject.' };
    if (gpaNum >= 7) return { icon: TrendingUp, text: 'Very achievable with consistent effort.', sub: 'Maintain good study habits and stay focused.' };
    return { icon: CheckCircle2, text: 'You\'re in great shape!', sub: 'Even a moderate performance will get you there.' };
  };

  const insight = getInsight();

  return (
    <div className="tc animate-fade-in">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — HERO RESULT CARD (Primary Focus)
          ═══════════════════════════════════════════════════════════ */}
      <div className="tc-hero">
        {/* Header */}
        <div className="tc-hero-header">
          <div className="tc-hero-icon-wrap">
            <Target size={28} />
          </div>
          <div>
            <h2 className="tc-hero-title">Your Target CGPA</h2>
            <p className="tc-hero-subtitle">Here's what you need to achieve</p>
          </div>
        </div>

        {/* Body — Ring + Stats */}
        <div className="tc-hero-body">
          {/* Left — Progress Ring & GPA */}
          <div className="tc-ring-section">
            <div className="tc-ring-wrapper">
              <ProgressRing
                value={hasResult ? gpaNum : 0}
                max={10}
                size={190}
                strokeWidth={12}
                isImpossible={isImpossible}
              />
              <div className="tc-ring-center">
                <span className="tc-ring-label">TARGET NEXT SEM</span>
                <span className={`tc-ring-value ${isImpossible ? 'tc-impossible' : hasResult ? 'blue-glow-text' : 'tc-empty'}`}>
                  {hasResult ? requiredGPA : '--'}
                </span>
                <span className="tc-ring-sub">CGPA Required</span>
              </div>
            </div>

            {/* Status Badge */}
            {hasResult && (
              <div className={`tc-status-badge ${isImpossible ? 'tc-status-impossible' : 'tc-status-achievable'}`}>
                {isImpossible ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                {isImpossible ? 'Impossible' : 'Achievable'}
              </div>
            )}
            {isImpossible && <span className="tc-status-note">Max achievable is 10.0</span>}
          </div>

          {/* Right — Summary Stats */}
          <div className="tc-stats-grid">
            <div className="tc-stat-card">
              <div className="tc-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818CF8' }}>
                <Layers size={18} />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">Current Completed Credits</span>
                <span className="tc-stat-value">{currentCredits || '—'}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon" style={{ background: 'rgba(34, 211, 238, 0.12)', color: '#22D3EE' }}>
                <TrendingUp size={18} />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">Current CGPA</span>
                <span className="tc-stat-value">{currentCGPA ? Number(currentCGPA).toFixed(2) : '—'}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                <Crosshair size={18} />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">Target Desired CGPA</span>
                <span className="tc-stat-value">{targetCGPA ? Number(targetCGPA).toFixed(2) : '—'}</span>
              </div>
            </div>

            <div className="tc-stat-card">
              <div className="tc-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7' }}>
                <BookOpen size={18} />
              </div>
              <div className="tc-stat-info">
                <span className="tc-stat-label">Credits in Next Sem</span>
                <span className="tc-stat-value">{nextSemCredits || '—'}</span>
              </div>
            </div>
            {/* Insight Strip moved to grid */}
            <div className={`tc-insight ${isImpossible ? 'tc-insight-warn' : ''}`}>
              <insight.icon size={20} className="tc-insight-icon" />
              <div>
                <span className="tc-insight-text">{insight.text}</span>
                {insight.sub && <span className="tc-insight-sub">{insight.sub}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — INPUT FORM (Secondary)
          ═══════════════════════════════════════════════════════════ */}
      <div className="tc-form glass-panel">
        <h2 className="tc-form-title">
          <GraduationCap size={22} style={{ color: 'var(--primary)' }} />
          Calculate Your Target
        </h2>

        <div className="tc-form-grid">
          <div className="tc-field">
            <label>Current Completed Credits</label>
            <div className="tc-input-wrap">
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 60"
                min="0"
                value={currentCredits}
                onChange={(e) => setCurrentCredits(e.target.value)}
              />
              <span className="tc-input-suffix">Credits</span>
            </div>
          </div>

          <div className="tc-field">
            <label>Current CGPA</label>
            <div className="tc-input-wrap">
              <input
                type="number"
                className={`input-field ${currentCGPAError ? 'input-error' : ''}`}
                placeholder="Enter CGPA (0 - 10)"
                step="0.01"
                min="0"
                max="10"
                value={currentCGPA}
                onChange={(e) => handleCGPAChange(e, setCurrentCGPA)}
                style={currentCGPAError ? { borderColor: '#ef4444' } : {}}
              />
              <span className="tc-input-suffix">CGPA</span>
            </div>
            {currentCGPAError ? (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{currentCGPAError}</span>
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>Valid range: 0.00 to 10.00</span>
            )}
          </div>

          <div className="tc-field">
            <label>Target Desired CGPA</label>
            <div className="tc-input-wrap">
              <input
                type="number"
                className={`input-field ${targetCGPAError ? 'input-error' : ''}`}
                placeholder="Enter CGPA (0 - 10)"
                step="0.01"
                min="0"
                max="10"
                value={targetCGPA}
                onChange={(e) => handleCGPAChange(e, setTargetCGPA)}
                style={targetCGPAError ? { borderColor: '#ef4444' } : {}}
              />
              <span className="tc-input-suffix">CGPA</span>
            </div>
            {targetCGPAError ? (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{targetCGPAError}</span>
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>Valid range: 0.00 to 10.00</span>
            )}
          </div>

          <div className="tc-field">
            <label>Credits in Next Sem</label>
            <div className="tc-input-wrap">
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 20"
                min="1"
                value={nextSemCredits}
                onChange={(e) => setNextSemCredits(e.target.value)}
              />
              <span className="tc-input-suffix">Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tip Footer ── */}
      <div className="tc-tip">
        <Sparkles size={18} className="tc-tip-icon" />
        <span>Tip: Keep your current CGPA strong and try to score higher in the next semester!</span>
      </div>
    </div>
  );
}
