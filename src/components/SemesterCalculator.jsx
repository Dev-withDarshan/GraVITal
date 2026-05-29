import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, UploadCloud, Loader2, ChevronDown, ChevronUp, Settings, Award, BarChart3, BookOpen, FlaskConical, Info, RotateCcw, Sparkles } from 'lucide-react';
import { scanImageForSubjects } from '../utils/ocrParser';
import AnimatedNumber from './AnimatedNumber';
import './Calculator.css';

const COURSE_TYPES = [
  "Theory Only",
  "Lab Only",
  "Online Course",
  "Embedded Theory and Lab",
  "Soft Skill"
];

export function parseVtopText(text) {
  const lines = text.split("\n");
  const VALID_GRADES = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'N'];

  const subjects = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!/^\d+/.test(trimmed)) return; // only rows starting with number

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 9) return; // ignore incomplete rows

    // 👉 Extract from RIGHT
    const grade = tokens[tokens.length - 1].toUpperCase();

    // Validate grade
    if (!VALID_GRADES.includes(grade)) {
      return; // Skip non-graded or invalid grade rows (like P)
    }

    const c = parseFloat(tokens[tokens.length - 4]); // Credits (C)
    if (isNaN(c)) return;

    // 👉 LEFT SIDE
    const slNo = tokens[0];
    const courseCode = tokens[1];

    // 👉 MIDDLE PART (title + type)
    const middle = tokens.slice(2, tokens.length - 7).join(" ");

    let courseType = "";
    let courseTitle = middle;

    for (let type of COURSE_TYPES) {
      if (middle.includes(type)) {
        courseType = type;
        courseTitle = middle.replace(type, "").trim();
        break;
      }
    }

    const isLab = courseType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
    const type = isLab ? "lab" : "theory";

    subjects.push({
      id: crypto.randomUUID(),
      name: courseTitle,
      credits: c,
      grade: grade,
      type: type
    });
  });

  return subjects;
}

export function parseVtopTimetable(text) {
  const lines = text.split("\n");
  const subjects = [];

  const TIMETABLE_COURSE_TYPES = [
    "Embedded Theory and Lab",
    "Embedded Theory and Project",
    "Embedded Lab and Project",
    "Theory Only",
    "Lab Only",
    "Project Only",
    "Online Course",
    "Soft Skill"
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Try parsing with tabs first
    if (trimmed.includes("\t")) {
      const tokens = trimmed.split("\t");
      if (tokens.length >= 10) {
        const courseCode = tokens[2]?.trim();
        const courseTitle = tokens[3]?.trim();
        const courseType = tokens[4]?.trim();
        const credits = parseFloat(tokens[9]?.trim());

        if (courseCode && courseTitle && !isNaN(credits)) {
          const isLab = courseType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
          const type = isLab ? "lab" : "theory";

          subjects.push({
            id: crypto.randomUUID(),
            name: courseTitle,
            credits: credits,
            grade: 'S',
            type: type
          });
          return;
        }
      }
    }

    // Fallback: If no tabs, split by regex / spaces
    const codeMatch = trimmed.match(/\b([A-Z]{3,4}\d{3,4}[A-Z]?)\b/i);
    if (!codeMatch) return;

    const courseCode = codeMatch[1].toUpperCase();
    const codeIndex = trimmed.indexOf(codeMatch[1]);

    let foundType = "";
    let foundTypeIdx = -1;

    for (let type of TIMETABLE_COURSE_TYPES) {
      const idx = trimmed.toLowerCase().indexOf(type.toLowerCase());
      if (idx !== -1 && idx > codeIndex) {
        foundType = type;
        foundTypeIdx = idx;
        break;
      }
    }

    let courseTitle = "";
    let credits = 3.0;

    if (foundTypeIdx !== -1) {
      courseTitle = trimmed.substring(codeIndex + courseCode.length, foundTypeIdx).trim();
      const afterType = trimmed.substring(foundTypeIdx + foundType.length).trim();
      const tokensAfter = afterType.split(/\s+/);
      if (tokensAfter.length >= 5) {
        const potentialCredits = parseFloat(tokensAfter[4]);
        if (!isNaN(potentialCredits)) {
          credits = potentialCredits;
        }
      }
    } else {
      const afterCode = trimmed.substring(codeIndex + courseCode.length).trim();
      const tokens = afterCode.split(/\s+/);
      if (tokens.length > 0) {
        let titleParts = [];
        for (let token of tokens) {
          if (/^\d/.test(token) || token.includes("+")) {
            break;
          }
          titleParts.push(token);
        }
        courseTitle = titleParts.join(" ").trim();
      }
    }

    if (!courseTitle) {
      courseTitle = courseCode;
    }

    const isLab = foundType === "Lab Only" || courseCode.endsWith("P") || courseTitle.toLowerCase().includes("lab");
    const type = isLab ? "lab" : "theory";

    subjects.push({
      id: crypto.randomUUID(),
      name: courseTitle,
      credits: credits,
      grade: 'S',
      type: type
    });
  });

  return subjects;
}

export function parseVTOPData(text) {
  // Step 1: Split into blocks using course code pattern
  const blocks = text.split(/\n(?=\d+\s*\n)/); // split at Sl.No

  const subjects = [];

  blocks.forEach(block => {
    // Extract CODE + NAME
    const courseMatch = block.match(/([A-Z]{4}\d{3}[A-Z])\s*-\s*(.+)/);

    if (!courseMatch) return;

    const code = courseMatch[1];
    let name = courseMatch[2].trim();

    // Extract TYPE
    let type = "theory";
    if (/\(.*Lab.*\)/i.test(block)) {
      type = "lab";
    }

    // Extract CREDITS (first decimal number in block after course code to avoid matching digits inside the code)
    const afterCode = block.substring(block.indexOf(code) + code.length);
    const creditMatch = afterCode.match(/\b\d+(\.\d+)?\b/);
    const credits = creditMatch ? parseFloat(creditMatch[0]) : 0;

    subjects.push({
      id: crypto.randomUUID(),
      name,
      credits,
      grade: 'S',
      type,
      code
    });
  });

  return subjects;
}

// VIT Grading System
const GRADE_POINTS = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0, N: 0
};

const DEFAULT_THEORY = Array.from({ length: 3 }, () => ({ id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' }));
const DEFAULT_LAB = Array.from({ length: 1 }, () => ({ id: crypto.randomUUID(), name: '', credits: 1, grade: 'S' }));

const ROW_COLORS = ['#EC4899', '#F97316', '#14B8A6', '#6366F1', '#A855F7', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const getGradeQuality = (grade) => {
  const map = { S: 'Excellent', A: 'Very Good', B: 'Good', C: 'Average', D: 'Below Avg', E: 'Poor', F: 'Fail', N: 'Absent' };
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

  const [isAutofillModalOpen, setIsAutofillModalOpen] = useState(false);
  const [autofillTab, setAutofillTab] = useState('timetable'); // 'timetable', 'vtop', or 'ocr'
  const [vtopText, setVtopText] = useState('');
  const [timetableText, setTimetableText] = useState('');
  const [replaceSubjects, setReplaceSubjects] = useState(true);

  const handleTimetableAutofill = () => {
    if (!timetableText.trim()) {
      toast.error("Please paste your VTOP registration or timetable text first!");
      return;
    }

    try {
      // Auto-detect format: if there's a pattern of CODE - NAME, parse as registration text
      const isRegistrationText = /([A-Z]{4}\d{3}[A-Z])\s*-\s*(.+)/.test(timetableText);
      const parsed = isRegistrationText
        ? parseVTOPData(timetableText)
        : parseVtopTimetable(timetableText);

      if (parsed.length === 0) {
        toast.error("No valid subjects detected. Please make sure the format is correct.");
        return;
      }

      const newTheory = parsed.filter(s => s.type === 'theory');
      const newLab = parsed.filter(s => s.type === 'lab');

      if (replaceSubjects) {
        setTheorySubjects(newTheory.length > 0 ? newTheory : DEFAULT_THEORY.map(() => ({ id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' })));
        setLabSubjects(newLab.length > 0 ? newLab : DEFAULT_LAB.map(() => ({ id: crypto.randomUUID(), name: '', credits: 1, grade: 'S' })));
      } else {
        let currentTheory = theorySubjects.length === DEFAULT_THEORY.length && theorySubjects[0].name === '' ? [] : [...theorySubjects];
        let currentLabs = labSubjects.length === DEFAULT_LAB.length && labSubjects[0].name === '' ? [] : [...labSubjects];

        const existingNames = new Set([...currentTheory, ...currentLabs].map(s => s.name.trim().toLowerCase()));

        const uniqueNewTheory = [];
        const uniqueNewLabs = [];

        newTheory.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNewTheory.push(s);
          }
        });

        newLab.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNewLabs.push(s);
          }
        });

        setTheorySubjects([...currentTheory, ...uniqueNewTheory]);
        setLabSubjects([...currentLabs, ...uniqueNewLabs]);
      }

      toast.success("Subjects loaded successfully 🚀");
      setIsAutofillModalOpen(false);
      setTimetableText('');
    } catch (err) {
      toast.error("Failed to parse VTOP text: " + err.message);
    }
  };

  const handleVtopAutofill = () => {
    if (!vtopText.trim()) {
      toast.error("Please paste your VTOP grade table first!");
      return;
    }

    try {
      const parsed = parseVtopText(vtopText);
      if (parsed.length === 0) {
        toast.error("No valid subjects detected. Please make sure the table format is correct and contains valid grades (S, A, B, C, D, E, F, N).");
        return;
      }

      const newTheory = parsed.filter(s => s.type === 'theory');
      const newLab = parsed.filter(s => s.type === 'lab');

      if (replaceSubjects) {
        setTheorySubjects(newTheory.length > 0 ? newTheory : DEFAULT_THEORY.map(() => ({ id: crypto.randomUUID(), name: '', credits: 3, grade: 'S' })));
        setLabSubjects(newLab.length > 0 ? newLab : DEFAULT_LAB.map(() => ({ id: crypto.randomUUID(), name: '', credits: 1, grade: 'S' })));
      } else {
        let currentTheory = theorySubjects.length === DEFAULT_THEORY.length && theorySubjects[0].name === '' ? [] : [...theorySubjects];
        let currentLabs = labSubjects.length === DEFAULT_LAB.length && labSubjects[0].name === '' ? [] : [...labSubjects];

        const existingNames = new Set([...currentTheory, ...currentLabs].map(s => s.name.trim().toLowerCase()));

        const uniqueNewTheory = [];
        const uniqueNewLabs = [];

        newTheory.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNewTheory.push(s);
          }
        });

        newLab.forEach(s => {
          if (!existingNames.has(s.name.trim().toLowerCase())) {
            existingNames.add(s.name.trim().toLowerCase());
            uniqueNewLabs.push(s);
          }
        });

        setTheorySubjects([...currentTheory, ...uniqueNewTheory]);
        setLabSubjects([...currentLabs, ...uniqueNewLabs]);
      }

      toast.success("Subjects auto-filled successfully 🚀");
      setIsAutofillModalOpen(false);
      setVtopText('');
    } catch (err) {
      toast.error("Failed to parse VTOP text: " + err.message);
    }
  };

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
        let currentTheory = theorySubjects.length === DEFAULT_THEORY.length && theorySubjects[0].name === '' ? [] : [...theorySubjects];
        let currentLabs = labSubjects.length === DEFAULT_LAB.length && labSubjects[0].name === '' ? [] : [...labSubjects];
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
        toast.error("Could not detect any clear subjects or credits. Please ensure the screenshot contains formal core course codes and distinct credits clearly.");
      }
    } catch (err) {
      toast.error("Error scanning image: " + err.message);
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

            {/* Section Summary */}
            <div className="sem-section-summary flex items-center w-full" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <div className="sem-summary-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Icon size={16} fill="none" />
                <span>{isTheory ? 'Theory' : 'Lab'} Summary</span>
              </div>

              {/* Centered Add Button */}
              <div className="flex justify-center flex-1" style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                <button className="sem-action-btn sem-btn-add" onClick={() => addSubject(type)} style={{ margin: 0 }}>
                  <Plus size={16} /> Add {isTheory ? 'Theory' : 'Lab'} Subject
                </button>
              </div>

              <div className="sem-summary-stats flex items-center gap-6">
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
      <div className="hero-dashboard-card animate-fade-in stagger-1">
        {/* Left — GPA Display */}
        <div className="sem-hero-left">
          <span className="sem-hero-label">SEMESTER GPA</span>
          <AnimatedNumber value={currentCgpa} decimals={4} className="sem-hero-gpa blue-glow-text" />
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
          <div className="sem-hero-stats-row">
            <div className="sem-hero-stat">
              <div className="sem-stat-icon-wrapper">
                <BarChart3 size={14} className="sem-stat-icon" />
              </div>
              <span className="sem-stat-label">TOTAL CREDITS</span>
              <span className="sem-stat-num">{currentCredits}</span>
              <span className="sem-stat-unit">Credits</span>
            </div>
            <div className="sem-hero-stat">
              <div className="sem-stat-icon-wrapper">
                <Award size={14} className="sem-stat-icon" />
              </div>
              <span className="sem-stat-label">AVERAGE GRADE</span>
              <span className="sem-stat-num">{avgGrade.letter}</span>
              <span className="sem-stat-unit">{avgGrade.word}</span>
            </div>
          </div>
          {onAddToCGPA && (
            <button className="btn-primary sem-add-cgpa-btn" onClick={() => onAddToCGPA(currentCredits, currentCgpa)}>
              <Plus size={14} /> Add to CGPA
            </button>
          )}
        </div>

        {/* Right — Donut Overview */}
        <div className="sem-hero-right">
          <span className="sem-overview-label">SEMESTER OVERVIEW</span>
          <div className="sem-overview-content">
            <DonutChart theoryCount={theorySubjects.length} labCount={labSubjects.length} size={90} />
            <div className="sem-overview-legend">
              <div className="sem-legend-item">
                <span className="sem-legend-dot" style={{ background: '#6366F1' }} />
                <span className="sem-legend-text">Theory: <strong>{theorySubjects.length}</strong></span>
              </div>
              <div className="sem-legend-item">
                <span className="sem-legend-dot" style={{ background: '#22D3EE' }} />
                <span className="sem-legend-text">Labs: <strong>{labSubjects.length}</strong></span>
              </div>
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
          {isScanning ? (
            <div className="sem-action-btn sem-btn-auto" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              <Loader2 size={16} className="animate-spin" /> Scanning ({scanProgress}%)
            </div>
          ) : (
            <button className="sem-action-btn sem-btn-auto" onClick={() => setIsAutofillModalOpen(true)}>
              <Sparkles size={16} /> Auto-Fill
            </button>
          )}
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

      {/* ─── VTOP AUTOFILL MODAL ─── */}
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

            <div className="autofill-modal-tabs">
              <button
                className={`autofill-tab ${autofillTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setAutofillTab('timetable')}
              >
                Import Time Table
              </button>
              <button
                className={`autofill-tab ${autofillTab === 'vtop' ? 'active' : ''}`}
                onClick={() => setAutofillTab('vtop')}
              >
                Paste grade table
              </button>
              <button
                className={`autofill-tab ${autofillTab === 'ocr' ? 'active' : ''}`}
                onClick={() => setAutofillTab('ocr')}
              >
                Scan Screenshot
              </button>
            </div>

            <div className="autofill-modal-body">
              {autofillTab === 'vtop' ? (
                <div className="vtop-autofill-pane">
                  <p className="autofill-pane-desc">
                    Log in to VTOP, copy your entire grade table from Examination -{'>'} Grades, and paste it below. (Reference format shown below)
                  </p>

                  <label className="vtop-textarea-label">Paste your VTOP Grade Table here</label>
                  <textarea
                    className="vtop-textarea"
                    placeholder="Paste your VTOP Grade Table here..."
                    value={vtopText}
                    onChange={(e) => setVtopText(e.target.value)}
                  />

                  <div className="vtop-example-table-container" style={{ marginTop: '16px' }}>
                    <table className="vtop-example-table">
                      <thead>
                        <tr>
                          <th rowSpan="2">Sl.No.</th>
                          <th rowSpan="2">Course Code</th>
                          <th rowSpan="2">Course Title</th>
                          <th rowSpan="2">Course Type</th>
                          <th colSpan="4" style={{ textAlign: 'center' }}>Credits</th>
                          <th rowSpan="2">Grading Type</th>
                          <th rowSpan="2">Grand Total</th>
                          <th rowSpan="2">Grade</th>
                          <th rowSpan="2">View Mark</th>
                        </tr>
                        <tr>
                          <th>L</th>
                          <th>P</th>
                          <th>J</th>
                          <th>C</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>BCSE101E</td>
                          <td>Computer Programming: Python</td>
                          <td>Embedded Theory and Lab</td>
                          <td>1.0</td>
                          <td>2.0</td>
                          <td>0.0</td>
                          <td>3.0</td>
                          <td>AG</td>
                          <td>93</td>
                          <td>S</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>BEEE102L</td>
                          <td>Basic Electrical and Electronics Engineering</td>
                          <td>Theory Only</td>
                          <td>3.0</td>
                          <td>0.0</td>
                          <td>0.0</td>
                          <td>3.0</td>
                          <td>RG</td>
                          <td>85</td>
                          <td>A</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>BEEE102P</td>
                          <td>Basic Electrical and Electronics Engineering Lab</td>
                          <td>Lab Only</td>
                          <td>0.0</td>
                          <td>1.0</td>
                          <td>0.0</td>
                          <td>1.0</td>
                          <td>AG</td>
                          <td>99</td>
                          <td>S</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

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
                  <button className="btn-primary vtop-submit-btn" onClick={handleVtopAutofill}>
                    Auto Fill Subjects
                  </button>
                </div>
              ) : autofillTab === 'timetable' ? (
                <div className="vtop-autofill-pane">
                  <p className="autofill-pane-desc">
                    Log in to VTOP, copy your course registration text or timetable, and paste it below. (Reference format shown below)
                  </p>

                  <label className="vtop-textarea-label">Paste VTOP Registration Text / Timetable here</label>
                  <textarea
                    className="vtop-textarea"
                    placeholder="Paste your VTOP Registration Text or Timetable here..."
                    value={timetableText}
                    onChange={(e) => setTimetableText(e.target.value)}
                  />

                  <div className="vtop-example-table-container" style={{ marginTop: '16px' }}>
                    <table className="vtop-example-table">
                      <thead>
                        <tr>
                          <th>Sl.No</th>
                          <th>Class Group</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Category</th>
                          <th>Course Option</th>
                          <th>Class Id</th>
                          <th>Slot/ Venue</th>
                          <th>Faculty Details</th>
                          <th>Registered / Updated Date & Time</th>
                          <th>Attendance Date/ Type</th>
                          <th>Status & Ref. No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>General Freshers</td>
                          <td>BCSE101E - Computer Programming: Python<br/>( Embedded Theory )</td>
                          <td>1.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250107560</td>
                          <td>TCC2 -<br/>PRP124</td>
                          <td>SELVA RANI B -<br/>SCORE</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br/>- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>General Freshers</td>
                          <td>BCSE101E - Computer Programming: Python<br/>( Embedded Lab )</td>
                          <td>2.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250107561</td>
                          <td>L9+L10+L13+L14 -<br/>SJT218</td>
                          <td>SELVA RANI B -<br/>SCORE</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br/>- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>General Freshers</td>
                          <td>BEEE102L - Basic Electrical and Electronics Engineering<br/>( Theory Only )</td>
                          <td>3.0</td>
                          <td>Foundation Core</td>
                          <td>Regular</td>
                          <td>VL2024250106644</td>
                          <td>G2+TG2 -<br/>PRP124</td>
                          <td>ARUN N -<br/>SELECT</td>
                          <td>28-Jul-2024 04:39</td>
                          <td>29-Jul-2024<br/>- Manual</td>
                          <td>Registered and Approved</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

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
                  <button className="btn-primary vtop-submit-btn" onClick={handleTimetableAutofill}>
                    Auto Fill from VTOP
                  </button>
                </div>
              ) : (
                <div className="ocr-autofill-pane">
                  <p className="autofill-pane-desc">
                    <strong>Currently under development...</strong>Upload or drag screenshots of your VTOP grade page to automatically scan and import course codes, names, credits, and grades.
                  </p>
                  <div className="ocr-dropzone">
                    <input
                      type="file"
                      id="ocr-upload"
                      accept="image/*"
                      multiple
                      className="ocr-file-input"
                      onChange={(e) => {
                        handleImageUpload(e);
                        setIsAutofillModalOpen(false);
                      }}
                      disabled={isScanning}
                    />
                    <label htmlFor="ocr-upload" className="ocr-dropzone-label">
                      <UploadCloud size={40} className="ocr-dropzone-icon" />
                      <span className="ocr-dropzone-text">Click to choose image files</span>
                      <span className="ocr-dropzone-sub">Supports multiple screenshots</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
