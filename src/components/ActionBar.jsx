import React, { useMemo } from 'react';
import { Plus, Zap, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActionBar({ semesters, onAddSemester, onSetSemesters, onOpenAnalysis }) {
  
  // Robust default state check: checks both empty state and the default initial state
  const isDefaultState = useMemo(() => {
    if (semesters.length === 0) return true;
    if (semesters.length === 1) {
      const s = semesters[0];
      const isTempName = s.name === "Sem 1" || s.name === "";
      const isTempGPA = Number(s.manualGPA) === 9.0 || Number(s.manualGPA) === 0;
      const isTempCreds = Number(s.totalCredits) === 20 || Number(s.totalCredits) === 0;
      const isTempSubjects = !s.subjects || s.subjects.length === 0 || s.subjects.every(sub => !sub.name || sub.name.startsWith("Subject"));
      if (isTempName && isTempGPA && isTempCreds && isTempSubjects) return true;
    }
    return semesters.every(sem => 
      (!sem.subjects || sem.subjects.length === 0) &&
      (!sem.manualGPA || Number(sem.manualGPA) === 0) &&
      (!sem.totalCredits || Number(sem.totalCredits) === 0)
    );
  }, [semesters]);

  const handleAutoFill = () => {
    if (!isDefaultState) {
      toast.error("Auto-Fill is only available when the calculator is empty or in its default state!");
      return;
    }

    const typicalData = [
      { 
        id: crypto.randomUUID(), 
        name: "Sem 1", 
        mode: 'quick', 
        totalCredits: 20, 
        manualGPA: 8.5, 
        subjects: [
          { id: crypto.randomUUID(), name: 'Subject 1', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 2', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 3', credits: 3, grade: 'S' }
        ], 
        isIncluded: true 
      },
      { 
        id: crypto.randomUUID(), 
        name: "Sem 2", 
        mode: 'quick', 
        totalCredits: 21, 
        manualGPA: 8.8, 
        subjects: [
          { id: crypto.randomUUID(), name: 'Subject 1', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 2', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 3', credits: 3, grade: 'S' }
        ], 
        isIncluded: true 
      },
      { 
        id: crypto.randomUUID(), 
        name: "Sem 3", 
        mode: 'quick', 
        totalCredits: 22, 
        manualGPA: 9.1, 
        subjects: [
          { id: crypto.randomUUID(), name: 'Subject 1', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 2', credits: 3, grade: 'S' }, 
          { id: crypto.randomUUID(), name: 'Subject 3', credits: 3, grade: 'S' }
        ], 
        isIncluded: true 
      }
    ];

    onSetSemesters(typicalData);
    toast.success("Loaded typical semesters successfully! ⚡");
  };

  return (
    <div className="dashboard-action-bar animate-fade-in stagger-2">
      <span className="action-bar-label">What would you like to do?</span>
      <div className="action-buttons">
        <button className="action-btn btn-add-semester" onClick={onAddSemester}>
          <Plus size={16} /> Add Semester
        </button>
        <button 
          className={`action-btn btn-autofill-typical ${!isDefaultState ? 'disabled' : ''}`} 
          onClick={handleAutoFill}
          title={!isDefaultState ? "Clear semesters to auto-fill mock data" : "Auto-fill typical data"}
        >
          <Zap size={16} /> Auto-Fill Typical
        </button>
        <button className="action-btn btn-analyze-perf" onClick={onOpenAnalysis}>
          <BarChart2 size={16} /> Analyze Performance
        </button>
      </div>
    </div>
  );
}
