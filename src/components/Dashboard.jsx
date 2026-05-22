import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardTab } from '../context/DashboardTabContext';
import SemesterCalculator from './SemesterCalculator';
import OverallCalculator from './OverallCalculator';
import TargetCalculator from './TargetCalculator';
import GradeSimulator from './GradeSimulator';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, logout, userData, saveUserData, isLoading } = useAuth();
  const { activeTab, setActiveTab, setOnSave, saveStatus, setSaveStatus } = useDashboardTab();

  // Local state to hold the current values of calculators before saving
  const [semesterData, setSemesterData] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [targetData, setTargetData] = useState(null);

  // Load user data on mount
  useEffect(() => {
    if (userData) {
      if (userData.semester) setSemesterData(userData.semester);
      if (userData.overall) setOverallData(userData.overall);
      if (userData.target) setTargetData(userData.target);
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <h2 className="smooth-gradient-text animate-pulse">Syncing Cloud Database...</h2>
      </div>
    );
  }

  const handleSave = async () => {
    const dataToSave = {
      semester: semesterData,
      overall: overallData,
      target: targetData
    };

    setSaveStatus('Saving...');
    try {
      await saveUserData(dataToSave);
      setSaveStatus('✓ Saved!');
    } catch (err) {
      setSaveStatus('Save failed!');
    }
    setTimeout(() => setSaveStatus(''), 2000);
  };

  // Register the save callback in the shared context
  useEffect(() => {
    setOnSave(() => handleSave);
    return () => setOnSave(null);
  }, [semesterData, overallData, targetData, setOnSave]);

  const handleAddToCGPA = (credits, gpa) => {
    if (!credits || credits <= 0) return;

    const currentSems = overallData?.semesters || (userData?.overall?.semesters || []);
    const newSem = {
      id: crypto.randomUUID(),
      name: `Added Sem ${currentSems.length + 1}`,
      mode: 'quick',
      totalCredits: credits,
      manualGPA: gpa,
      subjects: [],
      isIncluded: true
    };

    setOverallData({
      ...overallData,
      semesters: [...currentSems, newSem]
    });

    // Switch to the overall tab to show the newly added semester!
    setActiveTab('overall');
  };

  return (
    <div className="dashboard-shell">

      {/* ── Centered Main Content ── */}
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper">
          <div className="tab-content animate-mac-micromotion" key={activeTab}>
            {activeTab === 'semester' && (
              <SemesterCalculator
                key={userData ? 'loaded' : 'default'}
                initialData={semesterData || userData?.semester}
                overallData={overallData || userData?.overall}
                onChange={setSemesterData}
                onAddToCGPA={handleAddToCGPA}
              />
            )}
            {activeTab === 'overall' && (
              <OverallCalculator
                key={userData ? 'loaded' : 'default'}
                initialData={overallData || userData?.overall}
                onChange={setOverallData}
              />
            )}
            {activeTab === 'target' && (
              <TargetCalculator
                key={userData ? 'loaded' : 'default'}
                initialData={targetData || userData?.target}
                onChange={setTargetData}
              />
            )}
            {activeTab === 'simulator' && (
              <GradeSimulator />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
