import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SemesterCalculator from './SemesterCalculator';
import OverallCalculator from './OverallCalculator';
import TargetCalculator from './TargetCalculator';
import GradeSimulator from './GradeSimulator';
import { Save, LayoutDashboard, History, Target, FlaskConical } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, logout, userData, saveUserData, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('semester');

  // Local state to hold the current values of calculators before saving
  const [semesterData, setSemesterData] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

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

  const navItems = [
    { key: 'semester', label: 'Semester GPA', icon: LayoutDashboard },
    { key: 'overall', label: 'CGPA', icon: History },
    { key: 'target', label: 'Target CGPA', icon: Target },
    { key: 'simulator', label: 'What-If', icon: FlaskConical },
  ];

  return (
    <div className="dashboard-shell">
      {/* ── Top Sub-Navigation Bar ── */}
      <div className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          {/* Left: Navigation Tabs */}
          <div className="topbar-tabs">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`topbar-tab ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon size={18} />
                <span className="topbar-tab-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right: Save + User */}
          <div className="topbar-actions">
            {currentUser && currentUser !== 'guest' && (
              <div className="topbar-user">
                <div className="topbar-avatar">{currentUser.charAt(0).toUpperCase()}</div>
                <span className="topbar-username">{currentUser}</span>
              </div>
            )}
            <button className="btn-primary topbar-save-btn" onClick={handleSave}>
              <Save size={16} />
              <span>{saveStatus || 'Save to Cloud'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Centered Main Content ── */}
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper">
          <div className="tab-content animate-fade-in" key={activeTab}>
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

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="mobile-tab-bar">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`mobile-tab ${activeTab === item.key ? 'active' : ''}`}
            onClick={() => setActiveTab(item.key)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
