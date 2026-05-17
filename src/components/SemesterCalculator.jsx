import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UploadCloud, Loader2, ChevronDown, ChevronUp, Settings, Award, BarChart3, BookOpen, FlaskConical, Info, RotateCcw, Sparkles } from 'lucide-react';
import { scanImageForSubjects } from '../utils/ocrParser';
import AnimatedNumber from './AnimatedNumber';
import './Calculator.css';

// VIT Grading System
const GRADE_POINTS = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0
};

const DEFAULT_THEORY = Array.from({ length: 5 }, () => ({ id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' }));
const DEFAULT_LAB = Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), name: '', credits: 1, grade: 'S' }));

const ROW_COLORS = ['#EC4899','#F97316','#14B8A6','#6366F1','#A855F7','#10B981','#F59E0B','#3B82F6','#EF4444','#8B5CF6'];

const getGradeQuality = (grade) => {
  const map = { S:'Excellent', A:'Very Good', B:'Good', C:'Average', D:'Below Avg', E:'Poor', F:'Fail', N:'Absent' };
  return map[grade] || '';
};

const getGpaQuality = (gpa) => {
  const g = parseFloat(gpa);
  if (g >= 10) return { label: 'Perfect Score! 🎉', msg: "You've achieved the maximum possible GPA.", color: '#10B981' };
  if (g >= 9) return { label: 'Outstanding', msg: 'Exceptional academic performance!', color: '#22D3EE' };
  if (g >= 8) return { label: 'Excellent', msg: 'Strong performance across subjects.', color: '#818CF8' };
  if (g >= 7) return { label: 'Very Good', msg: 'Consistent and solid results.', color: '#F59E0B' };
  if (g >= 6) return { label: 'Good', msg: 'Room for improvement in some areas.', color: '#F97316' };
  if (g >= 5) return { label: 'Average', msg: 'Focus on improving weaker subjects.', color: '#F97316' };
  return { label: 'Needs Work', msg: 'Significant effort needed next semester.', color: '#EF4444' };
};

const getAvgGradeLetter = (gpa) => {
  const g = parseFloat(gpa);
  if (g >= 10) return { letter: 'S', word: 'Outstanding' };
  if (g >= 9) return { letter: 'A', word: 'Excellent' };
  if (g >= 8) return { letter: 'B', word: 'Very Good' };
  if (g >= 7) return { letter: 'C', word: 'Good' };
  if (g >= 6) return { letter: 'D', word: 'Above Average' };
  if (g >= 5) return { letter: 'E', word: 'Pass' };
  return { letter: 'F', word: 'Fail' };
};

/* ── SVG Donut Chart ── */
const DonutChart = ({ theoryCount, labCount, size = 140 }) => {
  const total = theoryCount + labCount;
  const radius = 45;
  const circ = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        <text x="60" y="55" textAnchor="middle" fill="var(--text-muted)" fontSize="24" fontWeight="700" fontFamily="Inter">0</text>
        <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Subjects</text>
      </svg>
    );
  }

  const tPct = theoryCount / total;
  const tLen = circ * tPct;
  const lLen = circ * (1 - tPct);

  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#6366F1" strokeWidth="14"
        strokeDasharray={circ} strokeDashoffset={circ - tLen}
        transform="rotate(-90 60 60)" strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <circle cx="60" cy="60" r={radius} fill="none" stroke="#22D3EE" strokeWidth="14"
        strokeDasharray={circ} strokeDashoffset={circ - lLen}
        transform={`rotate(${-90 + 360 * tPct} 60 60)`} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="60" y="55" textAnchor="middle" fill="var(--text-main)" fontSize="28" fontWeight="800" fontFamily="Inter">{total}</text>
      <text x="60" y="72" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="500">Subjects</text>
    </svg>
  );
};

export default function SemesterCalculator({ initialData, overallData, onChange, onAddToCGPA }) {
  const [theorySubjects, setTheorySubjects] = useState(initialData?.theory || DEFAULT_THEORY);
  const [labSubjects, setLabSubjects] = useState(initialData?.lab || DEFAULT_LAB);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [theoryOpen, setTheoryOpen] = useState(true);
  const [labOpen, setLabOpen] = useState(true);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setIsScanning(true);
      setScanProgress(0);
      let allExtractedSubjects = [];
      const numFiles = files.length;
      for (let i = 0; i < numFiles; i++) {
        const file = files[i];
        const extracted = await scanImageForSubjects(file, (progress) => {
          setScanProgress(Math.round(((i * 100) + progress) / numFiles));
        });
        allExtractedSubjects.push(...extracted);
      }
      if (allExtractedSubjects.length > 0) {
        let currentTheory = theorySubjects.length === 5 && theorySubjects[0].name === '' ? [] : [...theorySubjects];
        let currentLabs = labSubjects.length === 3 && labSubjects[0].name === '' ? [] : [...labSubjects];
        const existingNames = new Set([...currentTheory, ...currentLabs].map(s => s.name.trim().toLowerCase()));
        const uniqueNewTheory = [];
        const uniqueNewLabs = [];
        allExtractedSubjects.forEach(s => {
          const compName = s.name.trim().toLowerCase();
          if (!existingNames.has(compName)) {
            existingNames.add(compName);
            if (s.type === 'theory') uniqueNewTheory.push(s);
            else uniqueNewLabs.push(s);
          }
        });
        setTheorySubjects([...currentTheory, ...uniqueNewTheory]);
        setLabSubjects([...currentLabs, ...uniqueNewLabs]);
      } else {
        alert("Could not detect any clear subjects or credits. Please ensure the screenshot contains formal core course codes and distinct credits clearly.");
      }
    } catch (err) {
      alert("Error scanning image: " + err.message);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      e.target.value = null;
    }
  };

  const computeStats = () => {
    let semesterCredits = 0;
    let semesterPoints = 0;
    const allSubjects = [...theorySubjects, ...labSubjects];
    allSubjects.forEach(sub => {
      if (sub.credits > 0 && Object.keys(GRADE_POINTS).includes(sub.grade)) {
        semesterCredits += Number(sub.credits);
        semesterPoints += Number(sub.credits) * GRADE_POINTS[sub.grade];
      }
    });
    const cgpa = semesterCredits === 0 ? "0.0000" : (semesterPoints / semesterCredits).toFixed(4);
    let pastCredits = 0;
    let pastPoints = 0;
    if (overallData && Array.isArray(overallData.semesters)) {
      overallData.semesters.forEach(sem => {
        if (sem.isIncluded !== false && sem.credits > 0 && sem.gpa >= 0) {
          pastCredits += Number(sem.credits);
          pastPoints += Number(sem.credits) * Number(sem.gpa);
        }
      });
    }
    let projectedCgpa = null;
    const totalCredits = semesterCredits + pastCredits;
    const totalPoints = semesterPoints + pastPoints;
    if (totalCredits > 0 && pastCredits > 0) {
      projectedCgpa = (totalPoints / totalCredits).toFixed(4);
    }
    return { cgpa, totalCredits: semesterCredits, totalPoints: semesterPoints, projectedCgpa };
  };

  const sectionStats = (subjects) => {
    let cr = 0, pts = 0;
    subjects.forEach(s => {
      if (s.credits > 0 && GRADE_POINTS[s.grade] !== undefined) {
        cr += Number(s.credits);
        pts += Number(s.credits) * GRADE_POINTS[s.grade];
      }
    });
    return { credits: cr, points: pts, count: subjects.length, gpa: cr === 0 ? 0 : pts / cr };
  };

  const { cgpa: currentCgpa, totalCredits: currentCredits, totalPoints: currentPoints, projectedCgpa } = computeStats();
  const theoryStats = sectionStats(theorySubjects);
  const labStats = sectionStats(labSubjects);

  useEffect(() => {
    onChange({ theory: theorySubjects, lab: labSubjects, computedSemCgpa: currentCgpa });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theorySubjects, labSubjects, currentCgpa]);

  const addSubject = (type) => {
    const defaultSub = { id: crypto.randomUUID(), name: '', credits: type === 'theory' ? 3 : 1, grade: 'S' };
    if (type === 'theory') setTheorySubjects([...theorySubjects, defaultSub]);
    else setLabSubjects([...labSubjects, defaultSub]);
  };

  const removeSubject = (type, id) => {
    if (type === 'theory') setTheorySubjects(theorySubjects.filter(c => c.id !== id));
    else setLabSubjects(labSubjects.filter(c => c.id !== id));
  };

  const updateSubject = (type, id, field, value) => {
    const list = type === 'theory' ? theorySubjects : labSubjects;
    const setList = type === 'theory' ? setTheorySubjects : setLabSubjects;
    if (field === 'credits') {
      const subject = list.find(c => c.id === id);
      if (subject && subject.name && subject.name.trim().length > 0) {
        const cached = JSON.parse(localStorage.getItem('userCreditCache') || '{}');
        cached[subject.name.trim().toLowerCase()] = Number(value);
        localStorage.setItem('userCreditCache', JSON.stringify(cached));
      }
    }
    setList(list.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const clearAll = () => {
    setTheorySubjects(DEFAULT_THEORY.map(() => ({ id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' })));
    setLabSubjects(DEFAULT_LAB.map(() => ({ id: crypto.randomUUID(), name: '', credits: 1, grade: 'S' })));
  };

  const quality = getGpaQuality(currentCgpa);
  const avgGrade = getAvgGradeLetter(currentCgpa);
  const gpaNum = parseFloat(currentCgpa);
  const gpaPct = Math.min((gpaNum / 10) * 100, 100);

  const renderSubjectTable = (type, subjects, stats) => {
    const isTheory = type === 'theory';
    const isOpen = isTheory ? theoryOpen : labOpen;
    const toggle = isTheory ? setTheoryOpen : setLabOpen;
    const Icon = isTheory ? BookOpen : FlaskConical;
    const label = isTheory ? 'Theory Subjects' : 'Lab Subjects';

    return (
      <div className="sem-section glass-panel">
        {/* Section Toggle Header */}
        <div className="sem-section-toggle" onClick={() => toggle(!isOpen)} role="button" tabIndex={0}>
          <div className="sem-section-toggle-left">
            {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            <Icon size={18} className="sem-section-icon" />
            <span className="sem-section-title">{label}</span>
            <span className="sem-section-count">{subjects.length}</span>
          </div>
        </div>

        {/* Table Content */}
        {isOpen && (
          <>
            <div className="table-responsive">
              <table className="subjects-table sem-table">
                <thead>
                  <tr>
                    <th>Subject Details</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                    <th>Contribution <Info size={12} style={{ opacity: 0.4, verticalAlign: 'middle' }} /></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, i) => {
                    const gp = GRADE_POINTS[sub.grade] ?? 0;
                    const contrib = Number(sub.credits) * gp;
                    const qualLabel = getGradeQuality(sub.grade);
                    const color = ROW_COLORS[i % ROW_COLORS.length];
                    const initials = sub.name ? sub.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : (isTheory ? 'T' : 'L') + (i + 1);

                    return (
                      <tr key={sub.id} className="animate-fade-in">
                        {/* Subject Details */}
                        <td>
                          <div className="sem-subject-detail">
                            <div className="sem-grade-icon" style={{ background: `${color}20`, color }}>
                              <span>{initials}</span>
                            </div>
                            <div className="sem-subject-info">
                              <input
                                type="text"
                                className="input-field sem-name-input"
                                placeholder={`${isTheory ? 'Theory' : 'Lab'} Sub ${i + 1}`}
                                value={sub.name}
                                onChange={(e) => updateSubject(type, sub.id, 'name', e.target.value)}
                              />
                              <span className="sem-quality-label" style={{ color }}>{qualLabel}</span>
                            </div>
                          </div>
                        </td>
                        {/* Credits */}
                        <td>
                          <input
                            type="number" className="input-field sem-credit-input"
                            min="0" step="0.5"
                            value={sub.credits}
                            onChange={(e) => updateSubject(type, sub.id, 'credits', e.target.value ? Number(e.target.value) : "")}
                            placeholder="Cr"
                          />
                        </td>
                        {/* Grade */}
                        <td>
                          <select className="input-field sem-grade-select" value={sub.grade}
                            onChange={(e) => updateSubject(type, sub.id, 'grade', e.target.value)}>
                            {Object.keys(GRADE_POINTS).map(g => (
                              <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>
                            ))}
                          </select>
                        </td>
                        {/* Grade Points */}
                        <td>
                          <div className="sem-gp-cell">
                            <span className="sem-gp-value">{gp.toFixed(2)}</span>
                            <span className="sem-gp-max">/ 10</span>
                          </div>
                        </td>
                        {/* Contribution */}
                        <td>
                          <div className="sem-contrib-cell">
                            <span className="sem-contrib-value">{contrib.toFixed(2)}</span>
                            <span className="sem-contrib-formula">{sub.credits} × {gp.toFixed(2)}</span>
                          </div>
                        </td>
                        {/* Delete */}
                        <td>
                          <button className="delete-btn" onClick={() => removeSubject(type, sub.id)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {subjects.length === 0 && (
                    <tr><td colSpan="6" className="empty-state">No subjects added.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Add Subject Button */}
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--card-border)' }}>
              <button className="sem-action-btn sem-btn-add" onClick={() => addSubject(type)}>
                <Plus size={16} /> Add {isTheory ? 'Theory' : 'Lab'} Subject
              </button>
            </div>

            {/* Section Summary */}
            <div className="sem-section-summary">
              <div className="sem-summary-icon">
                <Icon size={16} />
                <span>{isTheory ? 'Theory' : 'Lab'} Summary</span>
              </div>
              <div className="sem-summary-stats">
                <span><strong>{stats.credits}</strong> Credits</span>
                <span><strong>{stats.count}</strong> Subjects</span>
                <span><strong>{stats.points.toFixed(2)}</strong> Total Points</span>
                <div className="sem-summary-gpa-badge">{stats.gpa.toFixed(2)} GPA</div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="calculator-container">

      {/* ═══════════════════════════════════════
          HERO SECTION — GPA + Overview
          ═══════════════════════════════════════ */}
      <div className="sem-hero animate-fade-in stagger-1">
        {/* Left — GPA Display */}
        <div className="sem-hero-left">
          <span className="sem-hero-label">SEMESTER GPA</span>
          <AnimatedNumber value={currentCgpa} decimals={4} className="sem-hero-gpa smooth-gradient-text" />
          <div className="sem-quality-badge" style={{ background: `${quality.color}18`, color: quality.color, borderColor: `${quality.color}40` }}>
            {quality.label}
          </div>
          <p className="sem-hero-msg">{quality.msg}</p>
          <div className="sem-progress-track">
            <div className="sem-progress-fill" style={{ width: `${gpaPct}%`, background: quality.color }} />
          </div>
          <div className="sem-progress-info">
            <span>{gpaPct.toFixed(0)}% of maximum GPA</span>
            <span>{gpaNum.toFixed(2)} / 10.00</span>
          </div>
        </div>

        {/* Center — Stats */}
        <div className="sem-hero-center">
          <div className="sem-hero-medal">
            <Award size={40} />
          </div>
          <div className="sem-hero-stat">
            <span className="sem-stat-icon"><BarChart3 size={16} /></span>
            <div>
              <span className="sem-stat-label">TOTAL CREDITS</span>
              <span className="sem-stat-num">{currentCredits}</span>
              <span className="sem-stat-unit">Credits</span>
            </div>
          </div>
          <div className="sem-hero-stat">
            <span className="sem-stat-icon"><Award size={16} /></span>
            <div>
              <span className="sem-stat-label">AVERAGE GRADE</span>
              <span className="sem-stat-num">{avgGrade.letter}</span>
              <span className="sem-stat-unit">{avgGrade.word}</span>
            </div>
          </div>
          {onAddToCGPA && (
            <button className="btn-primary sem-add-cgpa-btn" onClick={() => onAddToCGPA(currentCredits, currentCgpa)}>
              <Plus size={16} /> Add to CGPA
            </button>
          )}
        </div>

        {/* Right — Donut Overview */}
        <div className="sem-hero-right">
          <span className="sem-overview-label">SEMESTER OVERVIEW</span>
          <DonutChart theoryCount={theorySubjects.length} labCount={labSubjects.length} size={140} />
          <div className="sem-overview-legend">
            <div className="sem-legend-item">
              <span className="sem-legend-dot" style={{ background: '#6366F1' }} />
              Theory Subjects <strong>{theorySubjects.length}</strong>
            </div>
            <div className="sem-legend-item">
              <span className="sem-legend-dot" style={{ background: '#22D3EE' }} />
              Lab Subjects <strong>{labSubjects.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SUBJECT CONFIGURATION HEADER
          ═══════════════════════════════════════ */}
      <div className="sem-config-header animate-fade-in stagger-2">
        <div className="sem-config-left">
          <Settings size={22} className="sem-config-icon" />
          <div>
            <h2 className="sem-config-title">Subject Configuration</h2>
            <p className="sem-config-sub">Add and manage your subjects for this semester.</p>
          </div>
        </div>
        <div className="sem-config-actions">
          <div style={{ position: 'relative' }}>
            <input type="file" id="ocr-upload" accept="image/*" multiple style={{ display: 'none' }}
              onChange={handleImageUpload} disabled={isScanning} />
            <label htmlFor="ocr-upload" className="sem-action-btn sem-btn-auto"
              style={{ cursor: isScanning ? 'not-allowed' : 'pointer', opacity: isScanning ? 0.6 : 1 }}>
              {isScanning ? (
                <><Loader2 size={16} className="animate-spin" /> Scanning ({scanProgress}%)</>
              ) : (
                <><Sparkles size={16} /> Auto-Fill</>
              )}
            </label>
          </div>
          <button className="sem-action-btn sem-btn-clear" onClick={clearAll}>
            <RotateCcw size={16} /> Clear All
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SUBJECT SECTIONS
          ═══════════════════════════════════════ */}
      <div className="animate-fade-in stagger-3">
        {renderSubjectTable('theory', theorySubjects, theoryStats)}
      </div>
      <div className="animate-fade-in stagger-4">
        {renderSubjectTable('lab', labSubjects, labStats)}
      </div>

      {/* ═══════════════════════════════════════
          BOTTOM SEMESTER SUMMARY BAR
          ═══════════════════════════════════════ */}
      <div className="sem-bottom-bar">
        <div className="sem-bottom-left">
          <div className="sem-bottom-icon"><BarChart3 size={22} /></div>
          <div>
            <span className="sem-bottom-title">Semester Summary</span>
            <span className="sem-bottom-sub">Overall performance for this semester</span>
          </div>
        </div>
        <div className="sem-bottom-stats">
          <div className="sem-bottom-stat">
            <span className="sem-bottom-num">{theorySubjects.length + labSubjects.length}</span>
            <span className="sem-bottom-label">Total Subjects</span>
          </div>
          <div className="sem-bottom-stat">
            <span className="sem-bottom-num">{currentCredits}</span>
            <span className="sem-bottom-label">Total Credits</span>
          </div>
          <div className="sem-bottom-stat">
            <span className="sem-bottom-num">{currentPoints.toFixed(2)}</span>
            <span className="sem-bottom-label">Total Points</span>
          </div>
          <div className="sem-bottom-gpa">
            <Award size={20} />
            <div>
              <AnimatedNumber value={currentCgpa} decimals={4} className="sem-bottom-gpa-val" />
              <span className="sem-bottom-gpa-label">Semester GPA</span>
            </div>
          </div>
        </div>
      </div>

      <datalist id="credits-options">
        {[1, 1.5, 2, 3, 4, 5, 6, 9, 20].map(c => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}
