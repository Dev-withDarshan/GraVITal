import React, { useState, useMemo } from 'react';
import { FlaskConical, Plus, Trash2, ArrowUp, ArrowDown, Minus, ArrowRight, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AnimatedNumber from './AnimatedNumber';
import './GradeSimulator.css';

const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
const GRADE_OPTIONS = Object.keys(GRADE_MAP);

function createSubject(name = '', credits = 3, grade = 'B') {
  return { id: crypto.randomUUID(), name, credits, grade, simGrade: grade };
}

export default function GradeSimulator() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
      if (field === 'grade') updated.simGrade = value;
      return updated;
    }));
  };

  const bumpSimGrade = (id, direction) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const idx = GRADE_OPTIONS.indexOf(s.simGrade);
      const newIdx = idx + direction; // -1 = up (S is 0), +1 = down
      if (newIdx < 0 || newIdx >= GRADE_OPTIONS.length) return s;
      return { ...s, simGrade: GRADE_OPTIONS[newIdx] };
    }));
  };

  const updateSimGrade = (id, newGrade) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, simGrade: newGrade } : s));
  };

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

  const totalCredits = useMemo(() => subjects.reduce((sum, s) => sum + Number(s.credits), 0), [subjects]);
  const totalPoints = useMemo(() => subjects.reduce((sum, s) => sum + (Number(s.credits) * (GRADE_MAP[s.simGrade] || 0)), 0), [subjects]);

  return (
    <div className={`simulator-container animate-fade-in ${isLight ? 'bg-gray-50' : ''}`} style={{ minHeight: '100%' }}>
      {/* Premium SaaS GPA Hero Card */}
      <div
        className={`relative overflow-hidden p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${isLight ? 'bg-white border border-gray-200 shadow-sm' : 'border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl'
          }`}
        style={{
          background: isLight ? '#ffffff' : 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(17, 24, 39, 0.8))',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: isLight ? 'none' : 'blur(16px)',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        {/* Soft gradient glow behind simulated GPA */}
        {!isLight && (
          <>
            <div className="absolute pointer-events-none" style={{ position: 'absolute', right: '-80px', top: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%)', pointerEvents: 'none' }} />
            <div className="absolute pointer-events-none" style={{ position: 'absolute', left: '-80px', bottom: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)', pointerEvents: 'none' }} />
          </>
        )}

        {/* GPA Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', width: '100%', alignItems: 'center', gap: '20px', zIndex: 10, position: 'relative' }}>

          {/* 1. Original GPA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: isLight ? '#64748b' : '#94a3b8' }}>Original GPA</span>
            <div style={{ position: 'relative' }}>
              <AnimatedNumber
                value={originalGPA}
                decimals={4}
                splitDecimals={true}
                style={{ fontSize: '46px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
              />
              <div style={{ height: '2px', width: '100%', background: isLight ? 'linear-gradient(to right, #2563eb, transparent)' : 'linear-gradient(to right, #3b82f6, transparent)', marginTop: '4px', borderRadius: '4px' }} className="animate-pulse" />
            </div>
          </div>

          {/* 2. Center Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.6)', borderRadius: '50%', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)', color: isLight ? '#64748b' : '#94a3b8' }}>
            <ArrowRight size={20} style={{ color: isLight ? '#2563eb' : '#60a5fa' }} />
          </div>

          {/* 3. Simulated GPA (Shifted Left) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginLeft: '-12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: isLight ? '#64748b' : '#94a3b8' }}>Simulated GPA</span>
            <div style={{ position: 'relative' }}>
              <div className={`${isLight ? 'bg-gray-100/80 border border-gray-200' : 'bg-black/20 backdrop-blur-sm'} shadow-sm`} style={{ padding: '6px 16px', borderRadius: '10px' }}>
                <AnimatedNumber
                  value={simulatedGPA}
                  decimals={4}
                  splitDecimals={true}
                  style={{ fontSize: '46px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
              <div style={{ height: '2px', width: '100%', background: isLight ? 'linear-gradient(to right, transparent, #059669)' : 'linear-gradient(to right, transparent, #34d399)', marginTop: '4px', borderRadius: '4px' }} className="animate-pulse" />
            </div>
          </div>

          {/* 4. Delta / Impact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '24px' }}>

            {/* Glowing Circular Progress Ring Around Delta - Increased Size & Prominence */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '76px', height: '76px', backgroundColor: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)', borderRadius: '50%', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)', boxShadow: delta !== 0 && !isLight ? `0 0 20px ${delta > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}` : 'none' }}>
              <svg style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={delta >= 0 ? (isLight ? "#059669" : "#10b981") : (isLight ? "#dc2626" : "#ef4444")}
                  strokeWidth="3"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - Math.min(94.2, Math.max(0, Math.abs(delta) * 94.2))}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease', filter: isLight ? 'none' : `drop-shadow(0 0 4px ${delta >= 0 ? '#10b981' : '#ef4444'})` }} />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', color: delta > 0 ? (isLight ? '#059669' : '#34d399') : delta < 0 ? (isLight ? '#dc2626' : '#f87171') : (isLight ? '#64748b' : '#94a3b8'), textShadow: !isLight && delta !== 0 ? `0 0 10px ${delta > 0 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'}` : 'none' }}>
                  {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: isLight ? '#94a3b8' : '#64748b', marginTop: '-2px' }}>Delta</span>
              </div>
            </div>

            {/* Quality Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: isLight ? '#475569' : '#cbd5e1' }}>Status</span>
                <span style={{
                  padding: '2px 8px',
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderRadius: '9999px',
                  letterSpacing: '0.5px',
                  background: delta > 0 ? (isLight ? '#e6f4ea' : 'rgba(16, 185, 129, 0.15)') : delta < 0 ? (isLight ? '#fce8e6' : 'rgba(239, 68, 68, 0.15)') : (isLight ? '#f1f5f9' : 'rgba(100, 116, 139, 0.15)'),
                  color: delta > 0 ? (isLight ? '#137333' : '#34d399') : delta < 0 ? (isLight ? '#c5221f' : '#f87171') : (isLight ? '#475569' : '#94a3b8'),
                  border: delta > 0 ? (isLight ? '1px solid #137333' : '1px solid rgba(16, 185, 129, 0.3)') : delta < 0 ? (isLight ? '1px solid #c5221f' : '1px solid rgba(239, 68, 68, 0.3)') : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(100, 116, 139, 0.3)')
                }}>
                  {delta > 0 ? 'Improving' : delta < 0 ? 'Declining' : 'Stable'}
                </span>
              </div>
              <p style={{ fontSize: '11px', maxWidth: '160px', margin: '4px 0 0 0', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.3 }}>
                {delta > 0 ? "Your simulation is ahead of your current GPA!" : delta < 0 ? "Simulated grades are below your current GPA." : "No simulator changes detected."}
              </p>
            </div>
          </div>

        </div>

      </div>



      {/* Subjects Table */}
      <div
        className={`simulator-table-section ${isLight ? 'bg-white border border-gray-200 shadow-sm' : 'glass-panel'}`}
        style={{
          padding: 0,
          overflow: 'hidden',
          backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
          border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px'
        }}
      >
        <div className="section-header" style={{ padding: '20px 24px', borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h2 className={isLight ? 'text-gray-900' : ''}>Grade Simulation</h2>
        </div>

        <div className="sim-table-responsive" style={{ padding: '0 24px' }}>
          <table className="sim-table">
            <thead>
              <tr style={{ borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Subject</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Credits</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Actual Grade</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Simulated Grade</th>
                <th className={isLight ? 'text-gray-500 font-medium' : ''}>Impact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subjects
                .map((sub) => {
                  const actualPts = Number(sub.credits) * (GRADE_MAP[sub.grade] || 0);
                  const simPts = Number(sub.credits) * (GRADE_MAP[sub.simGrade] || 0);
                  const pointsChange = simPts - actualPts;
                  const gpaImpact = totalCredits > 0 ? (pointsChange / totalCredits) : 0;
                  const changed = sub.grade !== sub.simGrade;
                  return { ...sub, gpaImpact, changed, pointsChange };
                })
                .sort((a, b) => Math.abs(b.gpaImpact) - Math.abs(a.gpaImpact))
                .map((sub) => {
                  const changed = sub.changed;
                  const gpaImpact = sub.gpaImpact;

                  return (
                    <tr
                      key={sub.id}
                      className={`animate-fade-in premium-sim-row ${changed ? 'sim-row-changed' : ''}`}
                      style={{ borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.04)' }}
                    >
                      <td>
                        <input
                          type="text"
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          value={sub.name}
                          onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                          placeholder="Subject Name"
                          style={{
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '10px 14px',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          min="0"
                          step="0.5"
                          value={sub.credits}
                          onChange={(e) => updateSubject(sub.id, 'credits', e.target.value ? Number(e.target.value) : "")}
                          style={{
                            padding: '10px 14px',
                            textAlign: 'center',
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        />
                      </td>
                      <td>
                        <select
                          className={`input-field ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                          value={sub.grade}
                          onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                          style={{
                            background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '10px 14px',
                            fontSize: '14px',
                            borderRadius: '10px',
                            height: '42px',
                            width: '100%',
                            color: isLight ? '#0f172a' : '#e5e7eb'
                          }}
                        >
                          {GRADE_OPTIONS.map(g => (
                            <option
                              key={g}
                              value={g}
                              className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white/80 dark:hover:bg-indigo-500/20 dark:hover:text-white"
                              style={{
                                backgroundColor: isLight ? '#ffffff' : '#0f172a',
                                color: isLight ? '#0f172a' : '#ffffff'
                              }}
                            >
                              {g} ({GRADE_MAP[g]})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="sim-grade-control flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            className={`sim-bump-btn sim-bump-btn-glow ${isLight ? 'bg-gray-100 border-gray-300 text-gray-700' : ''}`}
                            onClick={() => bumpSimGrade(sub.id, -1)}
                            disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === 0}
                            title="Increase grade"
                            style={{
                              backgroundColor: isLight ? '#f1f5f9' : 'var(--bg-input)',
                              borderColor: isLight ? '#cbd5e1' : 'var(--card-border)',
                              color: isLight ? '#334155' : 'var(--text-muted)'
                            }}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <select
                            className={`input-field sim-grade-select-glow ${changed ? (isLight ? 'changed text-indigo-600 font-bold' : 'changed text-indigo-400 font-bold') : ''
                              } ${isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' : ''}`}
                            value={sub.simGrade}
                            onChange={(e) => updateSimGrade(sub.id, e.target.value)}
                            style={{
                              minWidth: '100px',
                              padding: '10px 24px 10px 14px',
                              fontSize: '14px',
                              fontWeight: '700',
                              borderRadius: '10px',
                              height: '42px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              boxShadow: changed ? (isLight ? '0 0 10px rgba(79, 70, 229, 0.15)' : '0 0 12px rgba(99, 102, 241, 0.25)') : 'none',
                              borderColor: changed ? (isLight ? '#4f46e5' : 'var(--primary)') : (isLight ? '#cbd5e1' : 'var(--card-border)'),
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                              color: isLight ? '#0f172a' : '#e5e7eb'
                            }}
                          >
                            {GRADE_OPTIONS.map(g => (
                              <option
                                key={g}
                                value={g}
                                className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white/80 dark:hover:bg-indigo-500/20 dark:hover:text-white"
                                style={{
                                  backgroundColor: isLight ? '#ffffff' : '#0f172a',
                                  color: isLight ? '#0f172a' : '#ffffff'
                                }}
                              >
                                {g} ({GRADE_MAP[g]})
                              </option>
                            ))}
                          </select>
                          <button
                            className={`sim-bump-btn sim-bump-btn-glow ${isLight ? 'bg-gray-100 border-gray-300 text-gray-700' : ''}`}
                            onClick={() => bumpSimGrade(sub.id, 1)}
                            disabled={GRADE_OPTIONS.indexOf(sub.simGrade) === GRADE_OPTIONS.length - 1}
                            title="Decrease grade"
                            style={{
                              backgroundColor: isLight ? '#f1f5f9' : 'var(--bg-input)',
                              borderColor: isLight ? '#cbd5e1' : 'var(--card-border)',
                              color: isLight ? '#334155' : 'var(--text-muted)'
                            }}
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      </td>
                      <td>
                        {changed ? (
                          <span
                            className={`sim-impact ${gpaImpact > 0 ? 'positive' : gpaImpact < 0 ? 'negative' : ''}`}
                            style={{
                              fontWeight: '700',
                              fontSize: '14px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                              backgroundColor: gpaImpact > 0 ? (isLight ? '#e6f4ea' : 'rgba(16, 185, 129, 0.08)') : gpaImpact < 0 ? (isLight ? '#fce8e6' : 'rgba(239, 68, 68, 0.08)') : (isLight ? '#f1f5f9' : 'rgba(100, 116, 139, 0.08)'),
                              color: gpaImpact > 0 ? (isLight ? '#137333' : '#10b981') : gpaImpact < 0 ? (isLight ? '#c5221f' : '#ef4444') : (isLight ? '#64748b' : '#94a3b8'),
                              border: gpaImpact > 0 ? (isLight ? '1px solid #137333' : '1px solid rgba(16, 185, 129, 0.15)') : gpaImpact < 0 ? (isLight ? '1px solid #c5221f' : '1px solid rgba(239, 68, 68, 0.15)') : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(100, 116, 139, 0.15)'),
                              textShadow: isLight ? 'none' : (gpaImpact > 0 ? '0 0 8px rgba(16, 185, 129, 0.4)' : gpaImpact < 0 ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none'),
                              boxShadow: isLight ? 'none' : (gpaImpact > 0 ? '0 0 8px rgba(16, 185, 129, 0.1)' : gpaImpact < 0 ? '0 0 8px rgba(239, 68, 68, 0.1)' : 'none')
                            }}
                          >
                            {gpaImpact > 0 ? `+${gpaImpact.toFixed(2)}` : gpaImpact.toFixed(2)}
                          </span>
                        ) : (
                          <span style={{ color: isLight ? '#94a3b8' : 'var(--text-muted)', fontSize: '12px', opacity: 0.4 }}>—</span>
                        )}
                      </td>
                      <td>
                        <button className="delete-btn" onClick={() => removeSubject(sub.id)}>
                          <Trash2 size={18} />
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

        {/* Bottom Summary Bar */}
        <div
          className="sim-bottom-summary flex items-center w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: '14px 24px',
            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
            background: isLight ? '#f8fafc' : 'rgba(99, 102, 241, 0.02)',
            backdropFilter: isLight ? 'none' : 'blur(10px)'
          }}
        >
          {/* Left */}
          <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-700' : 'text-slate-300'}`} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simulation Summary</span>
            <span className={`text-[10px] ${isLight ? 'text-gray-500' : 'text-slate-500'}`} style={{ fontSize: '10px' }}>Simulated values in real-time</span>
          </div>

          {/* Center Button */}
          <div className="flex justify-center flex-1" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
            <button
              className="sem-action-btn sem-btn-add shadow-sm hover:shadow-md"
              onClick={addSubject}
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(to right, var(--primary), var(--accent-hover))',
                color: '#ffffff'
              }}
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>

          {/* Right */}
          <div className="sem-summary-stats flex items-center gap-6" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', color: isLight ? '#475569' : 'var(--text-muted)' }}>
            <span><strong className={isLight ? 'text-gray-900' : ''}>{totalCredits}</strong> Credits</span>
            <span><strong className={isLight ? 'text-gray-900' : ''}>{subjects.length}</strong> Subjects</span>
            <span><strong className={isLight ? 'text-gray-900' : ''}>{totalPoints.toFixed(2)}</strong> Total Points</span>
            <div
              className="sem-summary-gpa-badge"
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.1)',
                color: isLight ? '#4f46e5' : 'var(--primary)',
                border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              <AnimatedNumber value={simulatedGPA} decimals={4} style={{ fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em', fontWeight: 600 }} /> GPA
            </div>
          </div>
        </div>

        {/* Premium Inline Info Bar */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border max-w-fit mx-auto mt-4 stagger-2 text-center ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-md'
            }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
            backdropFilter: isLight ? 'none' : 'blur(10px)',
            width: 'fit-content',
            margin: '16px auto 20px'
          }}
        >
          <Info size={14} className={isLight ? "text-blue-600" : "text-blue-400"} style={{ color: isLight ? '#2563eb' : '#60a5fa', flexShrink: 0 }} />
          <p className={`text-xs font-medium leading-none ${isLight ? 'text-gray-600' : 'text-slate-400'}`} style={{ fontSize: '12px', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
            Set your <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 font-bold" style={{ background: 'linear-gradient(to right, #2563eb, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>actual grades</strong> in the table, then adjust simulated grades to see the <strong className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold" style={{ background: 'linear-gradient(to right, #059669, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>GPA impact</strong> in real-time.
          </p>
        </div>

      </div>
    </div>
  );
}
