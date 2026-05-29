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
  const { isGuest, logout } = useAuth();
  // isGuest is a localStorage-backed flag — no backend calls triggered for guests

  // Target inputs
  const [targetCGPA, setTargetCGPA] = useState(9.0);
  const [remainingCredits, setRemainingCredits] = useState(20);
  const [selectedGrade, setSelectedGrade] = useState(null);

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

  // Compute Grade Counts from active, detailed entry semesters
  const gradeCounts = useMemo(() => {
    const counts = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    let hasDetailedSems = false;

    semesters.forEach(sem => {
      if (sem.isIncluded !== false && sem.mode === 'detailed') {
        hasDetailedSems = true;
        if (sem.subjects && Array.isArray(sem.subjects)) {
          sem.subjects.forEach(sub => {
            const grade = sub.grade?.toUpperCase();
            if (counts[grade] !== undefined) {
              counts[grade] += 1;
            }
          });
        }
      }
    });

    return { counts, hasDetailedSems };
  }, [semesters]);

  // Compute detailed subjects for selected grade
  const subjectsWithSelectedGrade = useMemo(() => {
    if (!selectedGrade) return [];
    const list = [];
    semesters.forEach(sem => {
      if (sem.isIncluded !== false && sem.mode === 'detailed') {
        if (sem.subjects && Array.isArray(sem.subjects)) {
          sem.subjects.forEach(sub => {
            if (sub.grade?.toUpperCase() === selectedGrade) {
              list.push({
                semesterName: sem.name,
                subjectName: sub.name || 'Untitled Subject',
                credits: sub.credits || 0
              });
            }
          });
        }
      }
    });
    return list;
  }, [semesters, selectedGrade]);

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
              <table className="analysis-summary-table">
                <thead>
                  <tr>
                    <th>Average GPA</th>
                    <th>Highest GPA</th>
                    <th>Lowest GPA</th>
                    <th>Total Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{avgGPA.toFixed(2)}</td>
                    <td className="text-success">{highestGPA.toFixed(2)}</td>
                    <td className="text-error">{lowestGPA.toFixed(2)}</td>
                    <td>{totalCredits}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-divider"></div>

            {/* Section: Grade Distribution */}
            <div className="modal-flat-section">
              <h4 className="modal-section-title">Grade Distribution</h4>
              {gradeCounts.hasDetailedSems ? (
                <>
                  <div className="grade-distribution-grid">
                    {Object.entries(gradeCounts.counts).map(([grade, count]) => {
                      const isSelectable = count > 0;
                      const isActive = selectedGrade === grade;
                      const cardClass = `grade-badge-card${isSelectable ? ' selectable' : ' disabled-selection'}${isActive ? ' active-selection' : ''}`;
                      
                      return (
                        <div 
                          key={grade} 
                          className={cardClass}
                          onClick={() => {
                            if (!isSelectable) return;
                            setSelectedGrade(isActive ? null : grade);
                          }}
                          title={isSelectable ? `Click to see subjects with grade ${grade}` : `No subjects with grade ${grade}`}
                        >
                          <span className={`grade-badge-label grade-${grade.toLowerCase()}`}>{grade}</span>
                          <span className="grade-badge-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedGrade && (
                    <div className="grade-details-panel">
                      <div className="grade-details-header">
                        <span className="grade-details-title">
                          Subjects with Grade <strong className={`grade-details-badge grade-${selectedGrade.toLowerCase()}`}>{selectedGrade}</strong>
                        </span>
                        <button 
                          className="grade-details-close" 
                          onClick={() => setSelectedGrade(null)}
                        >
                          Clear selection
                        </button>
                      </div>
                      {subjectsWithSelectedGrade.length > 0 ? (
                        <div className="grade-details-list">
                          {subjectsWithSelectedGrade.map((item, idx) => (
                            <div key={idx} className="grade-details-item">
                              <span className="grade-details-sem">{item.semesterName}</span>
                              <span className="grade-details-sub">{item.subjectName}</span>
                              <span className="grade-details-credits">{item.credits} Credits</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="grade-details-empty">No subjects found with this grade.</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="grade-distribution-empty">
                  No detailed semesters found. Switch a semester to "Detailed Entry" to view grade distribution.
                </p>
              )}
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
