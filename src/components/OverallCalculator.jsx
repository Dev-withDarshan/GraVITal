import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Award, ChevronDown, ChevronUp, Zap, Edit3 } from 'lucide-react';
import './Calculator.css';
import './OverallCalculator.css';
import AnimatedNumber from './AnimatedNumber';

// Grade mapping constants
const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_MAP);

// Helper: compute GPA from subjects array
function computeDetailedGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  let totalCredits = 0;
  let totalPoints = 0;
  for (const sub of subjects) {
    const c = Number(sub.credits);
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
    if (!sem.subjects || sem.subjects.length === 0) return 0;
    return sem.subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  }
  return Number(sem.totalCredits) || 0;
}

// Helper: create a blank semester
function createSemester(number) {
  return {
    id: crypto.randomUUID(),
    name: `Sem ${number}`,
    mode: 'quick',
    totalCredits: 20,
    manualGPA: 9.0,
    subjects: [],
    isIncluded: true
  };
}

// Helper: create a blank subject
function createSubject() {
  return { id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' };
}

// --- Migrate old data format to new ---
function migrateSemesters(initialData) {
  if (!initialData?.semesters) return null;
  return initialData.semesters.map(sem => {
    // Already new format
    if (sem.mode) return sem;
    // Old format: { id, name, credits, gpa, isIncluded }
    return {
      id: sem.id || crypto.randomUUID(),
      name: sem.name || 'Semester',
      mode: 'quick',
      totalCredits: Number(sem.credits) || 0,
      manualGPA: Number(sem.gpa) || 0,
      subjects: [],
      isIncluded: sem.isIncluded !== false
    };
  });
}


// ============================================================
// SEMESTER CARD COMPONENT
// ============================================================
function SemesterCard({ sem, index, onUpdate, onRemove, expanded, onToggle }) {
  const effectiveGPA = getSemesterGPA(sem);
  const effectiveCredits = getSemesterCredits(sem);

  // --- Mode switching logic ---
  const handleModeSwitch = useCallback((newMode) => {
    if (newMode === sem.mode) return;

    if (newMode === 'quick' && sem.mode === 'detailed') {
      // Carry over the calculated GPA
      const calcGPA = computeDetailedGPA(sem.subjects);
      const calcCredits = sem.subjects.reduce((s, sub) => s + (Number(sub.credits) || 0), 0);
      onUpdate(sem.id, {
        mode: 'quick',
        manualGPA: Math.round(calcGPA * 100) / 100,
        totalCredits: calcCredits
      });
    } else {
      // Quick → Detailed: start fresh
      onUpdate(sem.id, {
        mode: 'detailed',
        subjects: sem.subjects?.length > 0 ? sem.subjects : [createSubject()]
      });
    }
  }, [sem, onUpdate]);

  // --- Subject CRUD ---
  const addSubject = useCallback(() => {
    onUpdate(sem.id, { subjects: [...(sem.subjects || []), createSubject()] });
  }, [sem, onUpdate]);

  const removeSubject = useCallback((subId) => {
    onUpdate(sem.id, { subjects: sem.subjects.filter(s => s.id !== subId) });
  }, [sem, onUpdate]);

  const updateSubject = useCallback((subId, field, value) => {
    onUpdate(sem.id, {
      subjects: sem.subjects.map(s => s.id === subId ? { ...s, [field]: value } : s)
    });
  }, [sem, onUpdate]);

  return (
    <div className={`sem-card glass-panel animate-fade-in ${!sem.isIncluded ? 'sem-excluded' : ''} ${expanded ? 'expanded' : ''}`}>
      {/* Card Header */}
      <div className="sem-card-header" onClick={onToggle}>
        <div className="sem-card-title-row">
          <input
            type="text"
            className="sem-name-input"
            value={sem.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate(sem.id, { name: e.target.value })}
            placeholder={`Sem ${index + 1}`}
          />
          <span className={`mode-badge ${sem.mode}`}>
            {sem.mode === 'detailed' ? <><Zap size={12} /> Auto Calculated</> : <><Edit3 size={12} /> Manual Entry</>}
          </span>
        </div>

        <div className="sem-card-stats">
          <div className="sem-stat">
            <span className="sem-stat-label">GPA</span>
            <AnimatedNumber value={effectiveGPA} decimals={2} className="sem-stat-value smooth-gradient-text" />
          </div>
          <div className="sem-stat">
            <span className="sem-stat-label">Credits</span>
            <span className="sem-stat-value">{effectiveCredits}</span>
          </div>
          <div className="sem-card-actions-header">
            <label className="include-toggle" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={sem.isIncluded !== false}
                onChange={(e) => onUpdate(sem.id, { isIncluded: e.target.checked })}
              />
              <span className="include-label">Include</span>
            </label>
            <button className="delete-btn sem-delete" onClick={(e) => { e.stopPropagation(); onRemove(sem.id); }} title="Delete semester">
              <Trash2 size={16} />
            </button>
            <div className="expand-icon" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Body */}
      <div className="sem-card-body">
            {/* Mode Toggle */}
          <div className="mode-toggle-group">
            <button
              className={`mode-toggle-btn ${sem.mode === 'quick' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('quick')}
            >
              <Edit3 size={14} /> Quick Entry
            </button>
            <button
              className={`mode-toggle-btn ${sem.mode === 'detailed' ? 'active' : ''}`}
              onClick={() => handleModeSwitch('detailed')}
            >
              <Zap size={14} /> Detailed Entry
            </button>
          </div>

          {/* QUICK ENTRY MODE */}
          {sem.mode === 'quick' && (
            <div className="quick-entry-fields">
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
          )}

          {/* DETAILED ENTRY MODE */}
          {sem.mode === 'detailed' && (
            <div className="detailed-entry-section">
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
                    {(sem.subjects || []).map((sub) => (
                      <tr key={sub.id} className="animate-fade-in">
                        <td>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Web Technologies"
                            value={sub.name}
                            onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="input-field"
                            min="0"
                            step="0.5"
                            value={sub.credits}
                            onChange={(e) => updateSubject(sub.id, 'credits', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="input-field grade-select"
                            value={sub.grade}
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
                    ))}
                    {(!sem.subjects || sem.subjects.length === 0) && (
                      <tr>
                        <td colSpan="4" className="empty-state">No subjects added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="btn-secondary add-subject-btn" onClick={addSubject}>
                <Plus size={16} /> Add Subject
              </button>

              {/* Read-only computed GPA display */}
              <div className="computed-gpa-display">
                <span className="computed-label">Computed Semester GPA</span>
                <AnimatedNumber value={effectiveGPA} decimals={4} className="computed-value smooth-gradient-text" />
              </div>
            </div>
          )}
        </div>
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

    semesters.forEach(sem => {
      if (sem.isIncluded === false) return;
      const credits = getSemesterCredits(sem);
      const gpa = getSemesterGPA(sem);
      if (credits > 0 && gpa >= 0) {
        totalCredits += credits;
        totalWeightedPoints += credits * gpa;
      }
    });

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

  return (
    <div className="calculator-container">
      {/* Sticky CGPA Header */}
      <div className={`cgpa-display glass-panel animate-fade-in stagger-1 ${isCompact ? 'is-compact' : ''}`}>
        <div className="display-content" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Overall Cumulative CGPA</h3>
          <AnimatedNumber value={currentOverallCgpa} decimals={4} className="cgpa-value smooth-gradient-text" style={{ fontSize: '56px', fontWeight: '800', lineHeight: 1 }} />
        </div>

        <div className="divider" style={{ width: '1px', height: '80px', background: 'var(--border-color)', margin: '0 40px' }}></div>

        <div className="display-content" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Credits</h3>
          <div className="cgpa-value" style={{ fontSize: '56px', fontWeight: '800', lineHeight: 1, color: 'var(--text-main)' }}>{overallCredits}</div>
        </div>

        <Award size={64} className="display-icon" style={{ opacity: 0.1, marginLeft: 'auto' }} />
      </div>

      {/* Semester Cards */}
      <div className="semester-cards-section animate-fade-in stagger-2">
        <div className="section-header">
          <h2>Past Semesters</h2>
          <button className="btn-secondary add-btn" onClick={addSemester}>
            <Plus size={16} /> Add Semester
          </button>
        </div>

        <div className="semester-cards-grid">
          {semesters.map((sem, index) => (
            <div key={sem.id} className={`animate-fade-in stagger-${(index % 4) + 1}`}>
              <SemesterCard
                sem={sem}
                index={index}
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
    </div>
  );
}
