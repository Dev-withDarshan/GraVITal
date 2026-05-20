import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Award, ChevronDown, ChevronUp, Zap, Edit3, BarChart2, CheckCircle2, Info, TrendingUp, GraduationCap, Hexagon, Star, Sparkles } from 'lucide-react';
import './Calculator.css';
import './OverallCalculator.css';
import AnimatedNumber from './AnimatedNumber';
import { parseVtopText } from './SemesterCalculator';
import { MagneticButton } from './Spotlight';


// Grade mapping constants
const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_MAP);

// Helper: compute GPA from subjects safely
function computeDetailedGPA(subjects = []) {
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) return 0;
  let totalCredits = 0;
  let totalPoints = 0;
  for (const sub of subjects) {
    const c = Number(sub.credits) || 0;
    const g = GRADE_MAP[sub.grade];
    if (c > 0 && g !== undefined) {
      totalCredits += c;
      totalPoints += c * g;
    }
  }
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

// Helper: get effective GPA for a semester
function getSemesterGPA(sem) {
  if (sem.mode === 'detailed') {
    return computeDetailedGPA(sem.subjects);
  }
  return Number(sem.manualGPA) || 0;
}

// Helper: get effective credits for a semester
function getSemesterCredits(sem) {
  if (sem.mode === 'detailed') {
    if (!sem.subjects || !Array.isArray(sem.subjects) || sem.subjects.length === 0) return 0;
    return sem.subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  }
  return Number(sem.totalCredits) || 0;
}

// Helper: create a blank subject
function createSubject(index = '') {
  return { id: crypto.randomUUID(), name: index ? `Subject ${index}` : '', credits: 3, grade: 'S' };
}

// Helper: create a blank semester
function createSemester(number) {
  return {
    id: crypto.randomUUID(),
    name: `Sem ${number}`,
    mode: 'quick',
    totalCredits: 20,
    manualGPA: 9.0,
    subjects: [createSubject(1), createSubject(2), createSubject(3)],
    isIncluded: true
  };
}

// --- Migrate old data format to new (ENFORCES STATE SAFETY) ---
function migrateSemesters(initialData) {
  if (!initialData?.semesters || !Array.isArray(initialData.semesters)) return null;
  return initialData.semesters.map(sem => {
    // If it's already the new format, ensure subjects array exists
    if (sem.mode) {
      return {
        ...sem,
        subjects: (sem.subjects && Array.isArray(sem.subjects) && sem.subjects.length > 0)
          ? sem.subjects
          : [createSubject(1), createSubject(2), createSubject(3)]
      };
    }
    // Migrate from old format
    return {
      id: sem.id || crypto.randomUUID(),
      name: sem.name || 'Semester',
      mode: 'quick',
      totalCredits: Number(sem.credits) || 0,
      manualGPA: Number(sem.gpa) || 0,
      subjects: [createSubject(1), createSubject(2), createSubject(3)],
      isIncluded: sem.isIncluded !== false
    };
  });
}

// ============================================================
// SEMESTER CARD COMPONENT
// ============================================================
function SemesterCard({ sem, index, semesters, onUpdate, onRemove, expanded, onToggle }) {
  const effectiveGPA = getSemesterGPA(sem);
  const effectiveCredits = getSemesterCredits(sem);
  const safeSubjects = sem.subjects || []; // Guaranteed safe access

  // --- Mode switching logic ---
  const handleModeSwitch = useCallback((newMode) => {
    if (newMode === sem.mode) return;
    onUpdate(sem.id, { mode: newMode }); // ONLY toggles mode, ZERO data destruction
  }, [sem, onUpdate]);

  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [vtopText, setVtopText] = useState("");
  const [replaceSubjects, setReplaceSubjects] = useState(true);

  // --- AutoFill ---
  const handleAutoFill = () => {
    if (!vtopText.trim()) return;

    try {
      const parsed = parseVtopText(vtopText);

      if (!parsed.length) return;

      const newSubjects = parsed.map(s => ({
        id: s.id || crypto.randomUUID(),
        name: s.name,
        credits: s.credits,
        grade: s.grade
      }));

      onUpdate(sem.id, {
        subjects: replaceSubjects
          ? newSubjects
          : [...(sem.subjects || []), ...newSubjects]
      });

      setIsAutofillModalOpen(false);
      setVtopText("");

    } catch (err) {
      console.error("Autofill failed:", err);
    }
  };


  // --- Subject CRUD ---
  const addSubject = useCallback(() => {
    onUpdate(sem.id, { subjects: [...safeSubjects, createSubject()] });
  }, [sem.id, safeSubjects, onUpdate]);

  const removeSubject = useCallback((subId) => {
    onUpdate(sem.id, { subjects: safeSubjects.filter(s => s.id !== subId) });
  }, [sem.id, safeSubjects, onUpdate]);

  const updateSubject = useCallback((subId, field, value) => {
    onUpdate(sem.id, {
      subjects: safeSubjects.map(s => s.id === subId ? { ...s, [field]: value } : s)
    });
  }, [sem.id, safeSubjects, onUpdate]);

  // --- Predictive Mini Simulator Logic ---
  const { basePoints, baseCredits } = useMemo(() => {
    let p = 0; let c = 0;
    if (semesters && Array.isArray(semesters)) {
      semesters.forEach(s => {
        if (s.id !== sem.id && s.isIncluded !== false) {
          const sc = getSemesterCredits(s);
          const sg = getSemesterGPA(s);
          c += sc;
          p += sc * sg;
        }
      });
    }
    return { basePoints: p, baseCredits: c };
  }, [semesters, sem.id]);

  const renderPrediction = (hypotheticalGPA, isBest = false) => {
    const creds = Number(sem.totalCredits) || 0;
    const newTotalCredits = baseCredits + creds;
    const predictedCGPA = newTotalCredits > 0 ? (basePoints + (hypotheticalGPA * creds)) / newTotalCredits : 0;

    const currentTotalCredits = baseCredits + effectiveCredits;
    const currentCGPA = currentTotalCredits > 0 ? (basePoints + (effectiveGPA * effectiveCredits)) / currentTotalCredits : 0;

    const delta = predictedCGPA - currentCGPA;
    const isPositive = delta > 0;
    const isNegative = delta < 0;

    return (
      <div className={`prediction-card w-full h-full flex flex-col justify-between ${isBest ? 'prediction-card-best' : ''}`}>
        {isBest && <span className="best-badge">Best</span>}
        <div className="prediction-gpa">{hypotheticalGPA.toFixed(2)} GPA</div>
        <div className="prediction-cgpa-row">
          <span className="prediction-cgpa-label">CGPA</span>
          <span className="prediction-cgpa-val">{predictedCGPA.toFixed(2)}</span>
          {Math.abs(delta) > 0.005 && (
            <span className={`prediction-delta ${isPositive ? 'delta-pos' : 'delta-neg'}`}>
              {isPositive ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`sem-card glass-panel w-full animate-fade-in ${!sem.isIncluded ? 'sem-excluded' : ''} ${expanded ? 'expanded' : ''}`}>

      {/* ── ALWAYS VISIBLE HEADER ── */}
      <div className="sem-card-header hover:bg-white/5 transition-colors duration-200" onClick={onToggle}>
        <div className="sem-header-left">
          <input
            type="text"
            className="sem-name-input"
            value={sem.name || ''}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate(sem.id, { name: e.target.value })}
            placeholder={`Sem ${index + 1}`}
          />
          <div className="sem-status-badge">
            <CheckCircle2 size={12} />
            Completed
          </div>
        </div>

        <div className="sem-header-right">
          <div className="sem-stat-compact">
            <span className="sem-stat-compact-label">GPA</span>
            <span className="sem-stat-compact-val smooth-gradient-text">{effectiveGPA.toFixed(2)}</span>
          </div>
          <div className="sem-stat-compact">
            <span className="sem-stat-compact-label">CREDITS</span>
            <span className="sem-stat-compact-val">{effectiveCredits}</span>
          </div>
          <div className="sem-card-actions" onClick={(e) => e.stopPropagation()}>
            <label className="include-toggle">
              <input
                type="checkbox"
                checked={sem.isIncluded !== false}
                onChange={(e) => onUpdate(sem.id, { isIncluded: e.target.checked })}
              />
            </label>
            <button className="delete-btn sem-delete" onClick={() => onRemove(sem.id)} title="Delete semester">
              <Trash2 size={16} />
            </button>
            <div className="expand-icon" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              <ChevronDown size={20} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── COLLAPSIBLE CONTENT WRAPPER ── */}
      {expanded && (
        <div className="sem-card-body w-full col-span-full flex flex-col gap-4">

          {/* Mode Toggle (Segmented Control) */}
          <div className="mode-toggle-group">
            <button
              className={`mode-toggle-btn ${sem.mode === 'quick' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('quick')}
            >
              <Zap size={14} /> Quick Entry
            </button>
            <button
              className={`mode-toggle-btn ${sem.mode === 'detailed' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('detailed')}
            >
              <BarChart2 size={14} /> Detailed Entry
            </button>
          </div>

          {/* QUICK ENTRY MODE */}
          {sem.mode === 'quick' && (
            <div className="quick-entry-fields animate-fade-in">
              <div className="quick-entry-row">
                <div className="quick-field">
                  <label>Total Credits</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    step="0.5"
                    value={sem.totalCredits}
                    onChange={(e) => onUpdate(sem.id, { totalCredits: e.target.value })}
                  />
                </div>
                <div className="quick-field">
                  <label>GPA Achieved</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="10"
                    step="0.01"
                    value={sem.manualGPA}
                    onChange={(e) => onUpdate(sem.id, { manualGPA: e.target.value })}
                  />
                </div>
              </div>

              <div className="simulator-section w-full">
                <p className="simulator-title">What happens if you score different GPA this semester?</p>
                <div className="prediction-cards-grid w-full">
                  {renderPrediction(8.00)}
                  {renderPrediction(9.50)}
                  {renderPrediction(10.00, true)}
                  <div className="prediction-card custom-prediction w-full h-full flex flex-col justify-between">
                    <Edit3 size={16} className="custom-icon" />
                    <div className="custom-prediction-text">
                      <span className="custom-prediction-title">Custom GPA</span>
                      <span className="custom-prediction-desc">Enter any value</span>
                    </div>
                  </div>
                </div>
                <div className="simulator-insight">
                  <Info size={14} />
                  <span>Scoring 10.00 this semester can increase your CGPA by +{((baseCredits + Number(sem.totalCredits) > 0 ? (basePoints + (10 * Number(sem.totalCredits))) / (baseCredits + Number(sem.totalCredits)) : 0) - (baseCredits + effectiveCredits > 0 ? (basePoints + (effectiveGPA * effectiveCredits)) / (baseCredits + effectiveCredits) : 0)).toFixed(2)} points.</span>
                </div>
              </div>
            </div>
          )}

          {/* DETAILED ENTRY MODE */}
          {sem.mode === 'detailed' && (
            <div className="detailed-entry-section animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <MagneticButton
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)' }}
                  onClick={() => setIsAutofillModalOpen(true)}
                >
                  <Sparkles size={14} style={{ marginRight: '6px' }} /> Auto Fill
                </MagneticButton>
              </div>
              <div className="detailed-table-wrapper">
                <table className="detailed-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeSubjects.length > 0 ? (
                      safeSubjects.map((sub) => (
                        <tr key={sub.id} className="animate-fade-in">
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="e.g. Web Technologies"
                              value={sub.name || ''}
                              onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input-field"
                              min="0"
                              step="0.5"
                              value={sub.credits || ''}
                              onChange={(e) => updateSubject(sub.id, 'credits', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="input-field grade-select"
                              value={sub.grade || 'S'}
                              onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                            >
                              {GRADE_OPTIONS.map(g => (
                                <option key={g} value={g}>{g} ({GRADE_MAP[g]})</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button className="delete-btn" onClick={() => removeSubject(sub.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-state" style={{ textAlign: 'center', padding: '24px' }}>No subjects added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="btn-secondary add-subject-btn" onClick={addSubject}>
                <Plus size={16} /> Add Subject
              </button>

              {/* ─── AUTOFILL MODAL (reuses parseVtopText from SemesterCalculator) ─── */}
              {isAutofillModalOpen && (
                <div className="autofill-modal-overlay" onClick={(e) => {
                  if (e.target.className === 'autofill-modal-overlay') setIsAutofillModalOpen(false);
                }}>
                  <div className="autofill-modal-card animate-scale-in">
                    <div className="autofill-modal-header">
                      <div className="autofill-modal-title-group">
                        <Sparkles size={20} className="autofill-modal-icon" />
                        <h3 className="autofill-modal-title">Auto-Fill Semester Subjects</h3>
                      </div>
                      <button className="autofill-modal-close" onClick={() => setIsAutofillModalOpen(false)}>×</button>
                    </div>

                    <div className="autofill-modal-body">
                      <div className="vtop-autofill-pane">
                        <p className="autofill-pane-desc">
                          Log in to VTOP, copy your entire grade table (including the headers or row numbers), and paste it below.
                        </p>
                        <label className="vtop-textarea-label">Paste your VTOP Grade Table here</label>
                        <textarea
                          className="vtop-textarea"
                          placeholder={"Example:\n1\tBCHY102N\tEnvironmental Sciences\tOnline Course\t0.0\t0.0\t0.0\t2.0\tAG\t71\tP\n2\tBCSE103E\tComputer Programming: Java\tEmbedded Theory and Lab\t1.0\t2.0\t0.0\t3.0\tAG\t92\tS"}
                          value={vtopText}
                          onChange={(e) => setVtopText(e.target.value)}
                        />
                        <div className="autofill-options">
                          <label className="autofill-checkbox-label">
                            <input
                              type="checkbox"
                              checked={replaceSubjects}
                              onChange={(e) => setReplaceSubjects(e.target.checked)}
                            />
                            <span>Replace existing subjects (otherwise append)</span>
                          </label>
                        </div>
                        <button className="btn-primary vtop-submit-btn" onClick={handleAutoFill}>
                          Auto Fill Subjects
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================================
// MAIN OVERALL CALCULATOR
// ============================================================
export default function OverallCalculator({ initialData, onChange }) {
  const [semesters, setSemesters] = useState(() => {
    const migrated = migrateSemesters(initialData);
    return migrated || [createSemester(1)];
  });

  const [isCompact, setIsCompact] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(prev => {
        if (window.scrollY > 120) return true;
        if (window.scrollY < 40) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Compute overall CGPA ---
  const { cgpa: currentOverallCgpa, totalCredits: overallCredits } = useMemo(() => {
    let totalCredits = 0;
    let totalWeightedPoints = 0;

    if (Array.isArray(semesters)) {
      semesters.forEach(sem => {
        if (sem.isIncluded === false) return;
        const credits = getSemesterCredits(sem);
        const gpa = getSemesterGPA(sem);
        if (credits > 0 && gpa >= 0) {
          totalCredits += credits;
          totalWeightedPoints += credits * gpa;
        }
      });
    }

    const cgpa = totalCredits === 0 ? "0.0000" : (totalWeightedPoints / totalCredits).toFixed(4);
    return { cgpa, totalCredits };
  }, [semesters]);

  // --- Propagate changes to parent ---
  useEffect(() => {
    onChange({
      semesters: semesters,
      computedOverallCgpa: currentOverallCgpa
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesters, currentOverallCgpa]);

  // --- Semester CRUD ---
  const addSemester = useCallback(() => {
    const newSem = createSemester(semesters.length + 1);
    setSemesters(prev => [...prev, newSem]);
    setExpandedCardId(newSem.id); // Auto-expand new semester
  }, [semesters.length]);

  const removeSemester = useCallback((id) => {
    setSemesters(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSemester = useCallback((id, updates) => {
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const performanceBadge = useMemo(() => {
    const cgpa = parseFloat(currentOverallCgpa);
    if (cgpa >= 9.0) return { text: "Excellent Performance! 🔥", class: "badge-excellent" };
    if (cgpa >= 8.0) return { text: "Good Performance! ✨", class: "badge-good" };
    if (cgpa >= 7.0) return { text: "Average Performance 👍", class: "badge-average" };
    return { text: "Needs Improvement 🚀", class: "badge-needs-improvement" };
  }, [currentOverallCgpa]);

  const targetPercentage = useMemo(() => {
    const cgpa = parseFloat(currentOverallCgpa);
    return Math.min((cgpa / 10) * 100, 100).toFixed(0);
  }, [currentOverallCgpa]);

  return (
    <div className="calculator-container saas-dashboard">
      {/* ── TOP SECTION (GRID) ── */}
      <div className="dashboard-top-grid animate-fade-in stagger-1">

        {/* 1. HERO CARD */}
        <div className="hero-card glass-panel">
          <div className="hero-content">
            <h3 className="hero-subtitle">Overall Cumulative CGPA</h3>
            <AnimatedNumber value={currentOverallCgpa} decimals={4} className="hero-cgpa-value smooth-gradient-text" />

            <div className={`performance-badge ${performanceBadge.class}`}>
              {performanceBadge.text}
            </div>

            <p className="hero-insight">
              You're in the <span className="highlight-text">top 10%</span> of students
            </p>

            <div className="progress-container">
              <div className="progress-bar-wrapper">
                <div className="progress-bar-fill" style={{ width: `${targetPercentage}%` }}></div>
              </div>
              <div className="progress-labels">
                <span>{targetPercentage}% towards perfect CGPA</span>
                <span>Target: 10.0000</span>
              </div>
            </div>
          </div>
          <div className="hero-graphic">
            <div className="hero-graphic-circle">
              <Hexagon size={48} className="hero-graphic-icon" />
              <Star size={20} className="hero-graphic-star" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* 2 & 3. STATS CARDS */}
        <div className="stats-cards-col">
          {/* CREDITS CARD */}
          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper"><GraduationCap size={20} /></div>
              <span className="stat-card-title">TOTAL CREDITS</span>
            </div>
            <div className="stat-card-value">{overallCredits}</div>
            <div className="stat-card-desc">Credits Completed</div>
          </div>

          {/* TREND CARD */}
          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper trend-icon"><TrendingUp size={20} /></div>
              <span className="stat-card-title">CGPA TREND</span>
            </div>
            <div className="trend-graphic">
              <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                <path d="M0,20 L30,25 L60,15 L90,20 L120,5 L150,15 L200,0" fill="none" stroke="url(#trendGradient)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <circle cx="0" cy="20" r="4" fill="#8b5cf6" />
                <circle cx="30" cy="25" r="4" fill="#8b5cf6" />
                <circle cx="60" cy="15" r="4" fill="#8b5cf6" />
                <circle cx="90" cy="20" r="4" fill="#8b5cf6" />
                <circle cx="120" cy="5" r="4" fill="#8b5cf6" />
                <circle cx="150" cy="15" r="4" fill="#06b6d4" />
                <circle cx="200" cy="0" r="4" fill="#06b6d4" />
                <defs>
                  <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="trend-footer">
              <span className="trend-badge">Stable</span>
              <span className="stat-card-desc">Consistent Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div className="dashboard-action-bar animate-fade-in stagger-2">
        <span className="action-bar-label">What would you like to do?</span>
        <div className="action-buttons">
          <button className="btn-primary action-btn" onClick={addSemester}>
            <Plus size={16} /> Add Semester
          </button>
          <button className="btn-secondary glass-btn action-btn">
            <Zap size={16} /> Auto-Fill Typical
          </button>
          <button className="btn-secondary glass-btn action-btn">
            <BarChart2 size={16} /> Analyze Performance
          </button>
        </div>
      </div>

      {/* ── SEMESTER CARDS ── */}
      <div className="semester-cards-grid animate-fade-in stagger-3">
        {semesters.map((sem, index) => (
          <div key={sem.id}>
            <SemesterCard
              sem={sem}
              index={index}
              semesters={semesters}
              expanded={expandedCardId === sem.id}
              onToggle={() => setExpandedCardId(prev => prev === sem.id ? null : sem.id)}
              onUpdate={updateSemester}
              onRemove={removeSemester}
            />
          </div>
        ))}
        {semesters.length === 0 && (
          <div className="empty-state-card glass-panel">
            <p>No semesters added. Click "Add Semester" to begin tracking your CGPA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
