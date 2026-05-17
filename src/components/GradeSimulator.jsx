import React, { useState, useMemo } from 'react';
import { FlaskConical, Plus, Trash2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import './GradeSimulator.css';

const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_MAP);

function createSubject(name = '', credits = 3, grade = 'B') {
  return { id: crypto.randomUUID(), name, credits, grade, simGrade: grade };
}

export default function GradeSimulator() {
  const [subjects, setSubjects] = useState([
    createSubject('Subject 1', 4, 'B'),
    createSubject('Subject 2', 3, 'C'),
    createSubject('Subject 3', 3, 'A'),
    createSubject('Subject 4', 1, 'B'),
  ]);

  const addSubject = () => {
    setSubjects(prev => [...prev, createSubject(`Subject ${prev.length + 1}`)]);
  };

  const removeSubject = (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const updateSubject = (id, field, value) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      // When changing actual grade, reset sim grade to match
      if (field === 'grade') updated.simGrade = value;
      return updated;
    }));
  };

  const updateSimGrade = (id, newGrade) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, simGrade: newGrade } : s));
  };

  // Bump simGrade up or down
  const bumpSimGrade = (id, direction) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const idx = GRADE_OPTIONS.indexOf(s.simGrade);
      const newIdx = idx + direction; // -1 = up (S is 0), +1 = down
      if (newIdx < 0 || newIdx >= GRADE_OPTIONS.length) return s;
      return { ...s, simGrade: GRADE_OPTIONS[newIdx] };
    }));
  };

  // Compute GPA from a grade field
  const computeGPA = (gradeField) => {
    let totalCredits = 0;
    let totalPoints = 0;
    subjects.forEach(s => {
      const c = Number(s.credits);
      const g = GRADE_MAP[s[gradeField]];
      if (c > 0 && g !== undefined) {
        totalCredits += c;
        totalPoints += c * g;
      }
    });
    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
  };

  const originalGPA = useMemo(() => computeGPA('grade'), [subjects]);
  const simulatedGPA = useMemo(() => computeGPA('simGrade'), [subjects]);
  const delta = simulatedGPA - originalGPA;

  const hasChanges = subjects.some(s => s.grade !== s.simGrade);

  return (
    <div className="simulator-container animate-fade-in">
      {/* Header Display */}
      <div className="simulator-header glass-panel">
        <div className="sim-stat-group">
          <div className="sim-stat">
            <span className="sim-stat-label">Original GPA</span>
            <span className="sim-stat-value">{originalGPA.toFixed(4)}</span>
          </div>
          
          <div className="sim-arrow-divider">
            <ArrowUp size={20} style={{ opacity: 0.3 }} />
          </div>
          
          <div className="sim-stat">
            <span className="sim-stat-label">Simulated GPA</span>
            <span className="sim-stat-value smooth-gradient-text">{simulatedGPA.toFixed(4)}</span>
          </div>
        </div>

        {hasChanges && (
          <div className={`sim-delta ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : ''}`}>
            {delta > 0 ? <ArrowUp size={16} /> : delta < 0 ? <ArrowDown size={16} /> : <Minus size={16} />}
            {delta > 0 ? '+' : ''}{delta.toFixed(4)}
          </div>
        )}

        <FlaskConical size={64} className="sim-watermark" />
      </div>

      {/* Instructions */}
      <div className="sim-instructions">
        <p>Set your <strong>actual grades</strong> in the table, then use the <strong>simulator arrows</strong> to adjust grades and see the GPA impact.</p>
      </div>

      {/* Subjects Table */}
      <div className="simulator-table-section glass-panel">
        <div className="section-header">
          <h2>Grade Simulation</h2>
          <button className="btn-secondary add-btn" onClick={addSubject}>
            <Plus size={16} /> Add Subject
          </button>
        </div>

        <div className="sim-table-responsive">
          <table className="sim-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Credits</th>
                <th>Actual Grade</th>
                <th>Simulated Grade</th>
                <th>Impact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => {
                const actualPts = Number(sub.credits) * (GRADE_MAP[sub.grade] || 0);
                const simPts = Number(sub.credits) * (GRADE_MAP[sub.simGrade] || 0);
                const ptsDelta = simPts - actualPts;
                const changed = sub.grade !== sub.simGrade;

                return (
                  <tr key={sub.id} className={`animate-fade-in ${changed ? 'sim-row-changed' : ''}`}>
                    <td>
                      <input
                        type="text"
                        className="input-field"
                        value={sub.name}
                        onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                        placeholder="Subject Name"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input-field"
                        min="0"
                        step="0.5"
                        value={sub.credits}
                        onChange={(e) => updateSubject(sub.id, 'credits', e.target.value ? Number(e.target.value) : "")}
                        style={{ padding: '8px', textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <select
                        className="input-field"
                        value={sub.grade}
                        onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                      >
                        {GRADE_OPTIONS.map(g => (
                          <option key={g} value={g}>{g} ({GRADE_MAP[g]})</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="sim-grade-control">
                        <button
                          className="sim-bump-btn"
                          onClick={() => bumpSimGrade(sub.id, -1)}
                          disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === 0}
                          title="Increase grade"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <span className={`sim-grade-display ${changed ? 'changed' : ''}`}>
                          {sub.simGrade} ({GRADE_MAP[sub.simGrade]})
                        </span>
                        <button
                          className="sim-bump-btn"
                          onClick={() => bumpSimGrade(sub.id, 1)}
                          disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === GRADE_OPTIONS.length - 1}
                          title="Decrease grade"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      {changed && (
                        <span className={`sim-impact ${ptsDelta > 0 ? 'positive' : 'negative'}`}>
                          {ptsDelta > 0 ? '+' : ''}{ptsDelta.toFixed(1)} pts
                        </span>
                      )}
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => removeSubject(sub.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">No subjects added. Click "Add Subject" to begin simulating.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
