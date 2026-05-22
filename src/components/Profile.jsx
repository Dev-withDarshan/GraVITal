import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { capitalizeName } from '../utils/helpers';
import {
  Camera, Save, User, Mail, ArrowLeft, GraduationCap, Calendar,
  Target, BookOpen, Award, Settings, Shield, ChevronRight,
  Sun, Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Profile.css';

/* ── Branch & Year Options ── */
const BRANCH_OPTIONS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Other'
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];


export default function Profile() {
  const { profileData, updateProfileData, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  /* ── Local form state (profile card) ── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /* ── Local form state (academic card) ── */
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [targetCGPA, setTargetCGPA] = useState('');
  const [isSavingAcademic, setIsSavingAcademic] = useState(false);

  const handleCGPAChange = (e) => {
    let val = e.target.value;
    if (val.includes('.') && val.split('.')[1].length > 2) return;
    setTargetCGPA(val);
  };

  const targetCGPAError = targetCGPA && (Number(targetCGPA) < 0 || Number(targetCGPA) > 10) 
    ? 'CGPA must be between 0 and 10' 
    : '';

  /* ── Sync with context ── */
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '');
      setEmail(profileData.email || '');
      setPhoto(profileData.profilePhoto || '');
      setBranch(profileData.branch || '');
      setYear(profileData.year || '');
      setTargetCGPA(profileData.targetCGPA || '');
    }
  }, [profileData]);



  /* ── Handlers ── */
  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      toast.success("Photo selected — click Save to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setIsSaving(true);
    const res = updateProfileData({ name: name.trim(), profilePhoto: photo });
    if (res.success) toast.success("Profile saved!");
    else toast.error(res.error || "Save failed");
    setIsSaving(false);
  };

  const handleSaveAcademic = (e) => {
    e.preventDefault();
    if (targetCGPAError) return;
    if (targetCGPA !== '' && (Number(targetCGPA) < 0 || Number(targetCGPA) > 10)) {
      toast.error("Target CGPA must be between 0 and 10");
      return;
    }
    setIsSavingAcademic(true);
    const res = updateProfileData({ branch, year, targetCGPA });
    if (res.success) toast.success("Academic details saved!");
    else toast.error(res.error || "Save failed");
    setIsSavingAcademic(false);
  };

  const getInitials = () => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';

  const isGuest = currentUser === 'guest';

  return (
    <div className="prof-page">
      {/* ── Breadcrumb ── */}
      <div className="prof-top-bar">
        <button className="prof-back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* ── Page Header ── */}
      <div className="prof-page-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information, academic details, and preferences.</p>
      </div>

      {/* ═══ HERO CARD — Avatar + Identity ═══ */}
      <section className="prof-card prof-hero-card">
        <div className="prof-hero-left">
          {/* Avatar */}
          <div className="prof-avatar-wrapper" onClick={handleAvatarClick}>
            {photo ? (
              <img src={photo} alt={name} className="prof-avatar-img" />
            ) : (
              <div className="prof-avatar-fallback">{getInitials()}</div>
            )}
            <div className="prof-avatar-overlay">
              <Camera size={18} color="#fff" />
              <span>Change</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

          {/* Identity */}
          <div className="prof-hero-info">
            <div className="prof-hero-name-row">
              <h2>{capitalizeName(name) || 'Your Name'}</h2>
            </div>
            <div className="prof-hero-meta">
              <span><Mail size={13} /> {email || '—'}</span>
              {branch && <span><GraduationCap size={13} /> VIT Student</span>}
            </div>
            <span className="prof-avatar-hint">Upload a clear profile picture. Max size 2MB. JPG, PNG or WebP.</span>
          </div>
        </div>

        {/* Right side stats */}
        {!isGuest && (
          <div className="prof-hero-right">
            <div className="prof-hero-stat">
              <Calendar size={16} />
              <div>
                <span className="prof-hero-stat-label">Member since</span>
                <span className="prof-hero-stat-value">{profileData?.memberSince || 'May 2024'}</span>
              </div>
            </div>
            <div className="prof-hero-stat">
              <Shield size={16} />
              <div>
                <span className="prof-hero-stat-label">Account status</span>
                <span className="prof-hero-stat-value prof-status-active">Active <span className="prof-status-dot" /></span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══ TWO-COLUMN GRID: Personal + Academic ═══ */}
      <div className="prof-two-col">
        {/* ── Personal Information ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <User size={18} />
            <div>
              <h3>Personal Information</h3>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="prof-form">
            <div className="prof-field">
              <label className="prof-label">Display Name</label>
              <div className="prof-input-wrap">
                <User size={15} className="prof-input-icon" />
                <input
                  type="text"
                  className="prof-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="prof-field">
              <label className="prof-label">Email Address</label>
              <div className="prof-input-wrap">
                <Mail size={15} className="prof-input-icon" />
                <input
                  type="email"
                  className="prof-input prof-input-disabled"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
              <span className="prof-hint">Email is linked to your account and cannot be changed.</span>
            </div>

            <button type="submit" disabled={isSaving} className="prof-save-btn">
              <Save size={15} />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* ── Academic Details ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <GraduationCap size={18} />
            <div>
              <h3>Academic Details</h3>
            </div>
          </div>
          <form onSubmit={handleSaveAcademic} className="prof-form">
            <div className="prof-field">
              <label className="prof-label">Branch</label>
              <div className="prof-input-wrap">
                <BookOpen size={15} className="prof-input-icon" />
                <select className="prof-input prof-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="prof-field">
              <label className="prof-label">Current Year</label>
              <div className="prof-input-wrap">
                <Calendar size={15} className="prof-input-icon" />
                <select className="prof-input prof-select" value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="prof-field">
              <label className="prof-label">Target CGPA</label>
              <div className="prof-input-wrap">
                <Target size={15} className="prof-input-icon" />
                <input
                  type="number"
                  className={`prof-input ${targetCGPAError ? 'input-error' : ''}`}
                  value={targetCGPA}
                  onChange={handleCGPAChange}
                  placeholder="Enter CGPA (0 - 10)"
                  min="0"
                  max="10"
                  step="0.01"
                  style={targetCGPAError ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {targetCGPAError ? (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{targetCGPAError}</span>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>Valid range: 0.00 to 10.00</span>
              )}
            </div>

            <button type="submit" disabled={isSavingAcademic || !!targetCGPAError} className="prof-save-btn prof-save-btn-secondary">
              <Save size={15} />
              {isSavingAcademic ? 'Saving…' : 'Save Academic Details'}
            </button>
          </form>
        </section>
      </div>



      {/* ═══ TWO-COLUMN: Preferences + Account ═══ */}
      <div className="prof-two-col">
        {/* ── Preferences ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <Settings size={18} />
            <div><h3>Preferences</h3></div>
          </div>
          <div className="prof-settings-list">
            <div className="prof-setting-row" onClick={toggleTheme}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <div className="prof-setting-info">
                <span className="prof-setting-title">Theme</span>
                <span className="prof-setting-desc">Choose your preferred theme</span>
              </div>
              <span className="prof-setting-badge">{themeLabel}</span>
            </div>

            <div className="prof-setting-row">
              <Award size={16} />
              <div className="prof-setting-info">
                <span className="prof-setting-title">Grade System</span>
                <span className="prof-setting-desc">Select your grading system</span>
              </div>
              <span className="prof-setting-badge">VIT Grading</span>
            </div>
          </div>
        </section>

        {/* ── Account & Security ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <Shield size={18} />
            <div><h3>Account & Security</h3></div>
          </div>
          <div className="prof-settings-list">
            <div className="prof-setting-row prof-setting-clickable">
              <Shield size={16} />
              <div className="prof-setting-info">
                <span className="prof-setting-title">Change Password</span>
                <span className="prof-setting-desc">Update your account password</span>
              </div>
              <ChevronRight size={16} className="prof-setting-chevron" />
            </div>

            <div className="prof-setting-row">
              <Shield size={16} />
              <div className="prof-setting-info">
                <span className="prof-setting-title">Two-Factor Authentication</span>
                <span className="prof-setting-desc">Add an extra layer of security</span>
              </div>
              <span className="prof-coming-soon">Coming Soon</span>
            </div>

            <div className="prof-setting-row prof-setting-danger">
              <Shield size={16} />
              <div className="prof-setting-info">
                <span className="prof-setting-title">Delete Account</span>
                <span className="prof-setting-desc">Permanently delete your account</span>
              </div>
              <span className="prof-setting-plus">+</span>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ SUPPORT FOOTER ═══ */}
      <section className="prof-card prof-support-card">
        <div className="prof-support-left">
          <Shield size={18} />
          <div>
            <span className="prof-setting-title">Need help?</span>
            <span className="prof-setting-desc">If you have any questions or need assistance, contact our support team.</span>
          </div>
        </div>
        <button className="prof-support-btn" onClick={() => window.open('mailto:support@gravital.app', '_blank')}>
          Contact Support
        </button>
      </section>
    </div>
  );
}
