import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Info, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSemesterGPA, getSemesterCredits } from '../utils/analytics';

const getConsistencyDetails = (stdDev) => {
  if (stdDev < 0.3) {
    return { label: "Highly Consistent", score: 90, color: "#10b981", msg: "Exceptional stability across all semesters!" };
  }
  if (stdDev < 0.7) {
    return { label: "Moderate", score: 60, color: "#fbbf24", msg: "Fairly stable, but with some variation." };
  }
  return { label: "Unstable", score: 30, color: "#ef4444", msg: "High fluctuations. Try focusing on consistency." };
};

export default function AnalyzeModal({ semesters, onClose }) {
  const { currentUser, logout } = useAuth();
  const isGuest = currentUser === 'guest';

  // Target inputs
  const [targetCGPA, setTargetCGPA] = useState(9.0);
  const [remainingCredits, setRemainingCredits] = useState(20);

  const handleCGPAChange = (e) => {
    let val = e.target.value;
    if (val.includes('.') && val.split('.')[1].length > 2) return;
    setTargetCGPA(val);
  };

  const targetCGPAError = targetCGPA !== '' && (Number(targetCGPA) < 0 || Number(targetCGPA) > 10) 
    ? 'CGPA must be between 0 and 10' 
    : '';

  // Mapped semesters list matching standard structure
  const activeSems = useMemo(() => semesters.filter(s => s.isIncluded !== false), [semesters]);
  
  const mappedSemesters = useMemo(() => {
    return activeSems.map(s => ({
      gpa: getSemesterGPA(s),
      credits: getSemesterCredits(s)
    }));
  }, [activeSems]);

  // Computational Logic
  const gpas = useMemo(() => mappedSemesters.map(s => s.gpa), [mappedSemesters]);
  
  const avgGPA = useMemo(() => {
    return gpas.length === 0 ? 0 : gpas.reduce((a, b) => a + b, 0) / gpas.length;
  }, [gpas]);

  const highestGPA = useMemo(() => {
    return gpas.length === 0 ? 0 : Math.max(...gpas);
  }, [gpas]);

  const lowestGPA = useMemo(() => {
    return gpas.length === 0 ? 0 : Math.min(...gpas);
  }, [gpas]);

  const totalCredits = useMemo(() => {
    return mappedSemesters.reduce((sum, s) => sum + s.credits, 0);
  }, [mappedSemesters]);

  const stdDev = useMemo(() => {
    if (gpas.length === 0) return 0;
    const mean = avgGPA;
    return Math.sqrt(
      gpas.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / gpas.length
    );
  }, [gpas, avgGPA]);

  const consistency = useMemo(() => getConsistencyDetails(stdDev), [stdDev]);

  // Target CGPA Projection Logic
  const projection = useMemo(() => {
    if (targetCGPAError) {
      return { status: "Invalid Target CGPA", value: null, isError: true };
    }

    const currentCredits = totalCredits;
    const currentCGPA = avgGPA;
    const remainingCreditsNum = Number(remainingCredits) || 0;
    const targetCGPANum = Number(targetCGPA) || 0;

    if (remainingCreditsNum <= 0) {
      return { status: "Invalid Credits", value: null, isError: true };
    }

    const totalFutureCredits = currentCredits + remainingCreditsNum;
    const neededGPA = ((targetCGPANum * totalFutureCredits) - (currentCGPA * currentCredits)) / remainingCreditsNum;

    if (neededGPA > 10.0) {
      return { status: "Not achievable", value: null, isError: true };
    }
    if (neededGPA <= 0.0) {
      return { status: "Achieved (0.00)", value: 0, isError: false };
    }
    return { status: "Achievable", value: neededGPA.toFixed(2), isError: false };
  }, [totalCredits, avgGPA, targetCGPA, remainingCredits]);

  const handleCTA = () => {
    logout();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <TrendingUp size={20} className="modal-header-icon" />
            <h3 className="modal-title">Performance Analytics</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal body flat layout */}
        <div className="modal-body-container">
          <div className="modal-flat-layout">
            
            {/* Section 1: GPA Summary */}
            <div className="modal-flat-section">
              <h4 className="modal-section-title">GPA Summary</h4>
              <div className="modal-flat-stats">
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Average GPA</span>
                  <span className="modal-stat-val">{avgGPA.toFixed(2)}</span>
                </div>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Highest GPA</span>
                  <span className="modal-stat-val text-success">{highestGPA.toFixed(2)}</span>
                </div>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Lowest GPA</span>
                  <span className="modal-stat-val text-error">{lowestGPA.toFixed(2)}</span>
                </div>
                <div className="modal-stat-row">
                  <span className="modal-stat-label">Total Credits</span>
                  <span className="modal-stat-val">{totalCredits}</span>
                </div>
              </div>
            </div>

            <div className="modal-divider"></div>

            {/* Guest overlay wraps Consistency & Projections */}
            <div className="relative-container">
              {isGuest && (
                <div className="lock-overlay">
                  <div className="lock-card">
                    <Lock size={28} className="lock-card-icon" />
                    <span className="lock-card-title">Unlock Full Insights 🔓</span>
                    <p className="lock-card-desc">
                      Create an account to save semesters, track trends, and unlock advanced target projection algorithms.
                    </p>
                    <button className="btn-primary lock-card-btn" onClick={handleCTA}>
                      Login / Register Now
                    </button>
                  </div>
                </div>
              )}

              <div className={isGuest ? "blurred-content" : ""}>
                {/* Section 2: Consistency */}
                <div className="modal-flat-section">
                  <h4 className="modal-section-title">Consistency</h4>
                  <div className="consistency-section">
                    <div className="consistency-ring-wrapper">
                      <svg width="60" height="60" viewBox="0 0 60 60" className="consistency-ring">
                        <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle 
                          cx="30" 
                          cy="30" 
                          r="22" 
                          fill="none" 
                          stroke={isGuest ? "#8b5cf6" : consistency.color} 
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 22}
                          strokeDashoffset={isGuest ? 2 * Math.PI * 22 * 0.6 : 2 * Math.PI * 22 * (1 - consistency.score / 100)}
                          strokeLinecap="round"
                          transform="rotate(-90 30 30)"
                        />
                        <text x="30" y="34" textAnchor="middle" fill="var(--text-main)" fontSize="10" fontWeight="800">
                          {isGuest ? "??" : `${consistency.score}%`}
                        </text>
                      </svg>
                    </div>
                    <div className="consistency-details">
                      <span className="consistency-badge" style={{ color: consistency.color, background: `${consistency.color}20` }}>
                        {consistency.label}
                      </span>
                      <p className="consistency-msg">{consistency.msg}</p>
                    </div>
                  </div>
                </div>

                <div className="modal-divider"></div>

                {/* Section 3: Target Projection */}
                {remainingCredits >= 0 && (
                  <div className="modal-flat-section">
                    <h4 className="modal-section-title">Target Projection</h4>
                    <div className="target-calculator-fields">
                      <div className="target-field">
                        <label>Target CGPA</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="10" 
                          step="0.01" 
                          className={`input-field modal-input ${targetCGPAError ? 'input-error' : ''}`} 
                          value={targetCGPA} 
                          onChange={handleCGPAChange}
                          placeholder="Enter CGPA (0 - 10)"
                          style={targetCGPAError ? { borderColor: '#ef4444' } : {}}
                        />
                        {targetCGPAError ? (
                          <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{targetCGPAError}</span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>Valid range: 0.00 to 10.00</span>
                        )}
                      </div>
                      <div className="target-field">
                        <label>Remaining Credits</label>
                        <input 
                          type="number" 
                          min="1" 
                          step="1" 
                          className="input-field modal-input" 
                          value={remainingCredits} 
                          onChange={(e) => setRemainingCredits(Number(e.target.value))} 
                        />
                      </div>
                    </div>

                    <div className="projection-result">
                      <Info size={14} className="proj-info-icon" />
                      <div className="proj-text-container">
                        <span className="proj-label">Required GPA in remaining credits</span>
                        <div className={`proj-val ${projection.isError ? "proj-error" : "proj-success"}`}>
                          {projection.value !== null ? `${projection.value} GPA` : projection.status}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
