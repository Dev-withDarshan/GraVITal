// Grade mapping constants
export const GRADE_MAP = { S: 10, A: 9, B: 8, C: 7, D: 6, F: 0 };
export const GRADE_OPTIONS = Object.keys(GRADE_MAP);

// Helper: compute GPA from subjects safely
export function computeDetailedGPA(subjects = []) {
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
export function getSemesterGPA(sem) {
  if (sem.mode === 'detailed') {
    return computeDetailedGPA(sem.subjects);
  }
  return Number(sem.manualGPA) || 0;
}

// Helper: get effective credits for a semester
export function getSemesterCredits(sem) {
  if (sem.mode === 'detailed') {
    if (!sem.subjects || !Array.isArray(sem.subjects) || sem.subjects.length === 0) return 0;
    return sem.subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);
  }
  return Number(sem.totalCredits) || 0;
}

// Helper: compute analytics for semesters
export function computeAnalytics(semesters) {
  const activeSems = semesters.filter(s => s.isIncluded !== false);
  const gpas = activeSems.map(getSemesterGPA);
  const creditsList = activeSems.map(getSemesterCredits);

  const totalCredits = creditsList.reduce((a, b) => a + b, 0);
  const totalWeightedPoints = activeSems.reduce((sum, sem) => sum + (getSemesterGPA(sem) * getSemesterCredits(sem)), 0);
  const cgpa = totalCredits === 0 ? 0 : totalWeightedPoints / totalCredits;

  const mean = gpas.length > 0 ? gpas.reduce((a, b) => a + b, 0) / gpas.length : 0;
  
  const stdDev = gpas.length > 0
    ? Math.sqrt(gpas.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / gpas.length)
    : 0;

  const min = gpas.length > 0 ? Math.min(...gpas) : 0;
  const max = gpas.length > 0 ? Math.max(...gpas) : 0;

  return {
    mean,
    stdDev,
    min,
    max,
    totalCredits,
    cgpa
  };
}

// Trend calculation
export const getTrend = (sems) => {
  const activeSems = sems.filter(s => s.isIncluded !== false);
  if (activeSems.length < 2) return { label: "Stable", color: "#22d3ee" };

  let totalDiff = 0;
  for (let i = 1; i < activeSems.length; i++) {
    totalDiff += getSemesterGPA(activeSems[i]) - getSemesterGPA(activeSems[i - 1]);
  }

  const avgDiff = totalDiff / (activeSems.length - 1);

  if (avgDiff > 0.2) return { label: "Improving", color: "#34d399", class: "trend-improving" };
  if (avgDiff < -0.2) return { label: "Declining", color: "#f87171", class: "trend-declining" };
  return { label: "Stable", color: "#22d3ee", class: "trend-stable" };
};
