import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ── Guest flag helpers (localStorage-backed, no backend involvement) ──────────
export const getIsGuest = () => localStorage.getItem('isGuest') === 'true';

export const AuthProvider = ({ children }) => {
  // Use env var in production; fall back to localhost for local dev
  const API = import.meta.env.VITE_API_URL || 'https://gravital-backend.onrender.com';

  const [currentUser, setCurrentUser] = useState(null);  // display username string (null for guests)
  const [authEmail, setAuthEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [scoreFlowData, setScoreFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => getIsGuest());
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
    branch: '',
    year: '',
    targetCGPA: '',
    gradingSystem: 'VIT Grading',
    emailNotifications: true,
    twoFactorEnabled: true,
    memberSince: ''
  });

  // ── Core helper: attaches JWT to every authenticated request ──────────────
  const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  };

  // Profile localStorage key (auth users only)
  const getProfileKey = () => 'profile_data_local';

  // ── Load profile from backend (authenticated users only) ──────────────────
  const loadProfileData = async () => {
    try {
      const res = await authFetch(`${API}/api/profile/me`);
      if (res.status === 401) return null;
      const data = await res.json();
      if (data.success && data.profile) return data.profile;
    } catch (err) {
      console.error('Load Profile Error:', err);
    }
    return null;
  };

  // ── Rebuild profileData whenever currentUser/authEmail changes ─────────────
  useEffect(() => {
    if (currentUser) {
      // Authenticated user — load from localStorage then merge backend data
      const PROFILE_KEY = getProfileKey();
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const hasMemberSince = !!parsed.memberSince;
        const updated = {
          name: parsed.name || currentUser,
          email: authEmail || parsed.email || '',
          profilePhoto: parsed.profilePhoto || '',
          branch: parsed.branch || '',
          year: parsed.year || '',
          targetCGPA: parsed.targetCGPA || '',
          gradingSystem: parsed.gradingSystem !== undefined ? parsed.gradingSystem : 'VIT Grading',
          emailNotifications: parsed.emailNotifications !== undefined ? parsed.emailNotifications : true,
          twoFactorEnabled: parsed.twoFactorEnabled !== undefined ? parsed.twoFactorEnabled : true,
          memberSince: parsed.memberSince || formattedDate
        };
        if (!hasMemberSince) localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        setProfileData(updated);
      } else {
        const defaultProf = {
          name: currentUser,
          email: authEmail,
          profilePhoto: '',
          branch: '',
          year: '',
          targetCGPA: '',
          gradingSystem: 'VIT Grading',
          emailNotifications: true,
          twoFactorEnabled: true,
          memberSince: formattedDate
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProf));
        setProfileData(defaultProf);
      }

      // Merge backend profile data (photo, email, memberSince)
      loadProfileData().then((backendProfile) => {
        if (backendProfile) {
          setProfileData(prev => ({
            ...prev,
            profilePhoto: backendProfile.profilePhoto || prev.profilePhoto || '',
            email: backendProfile.email || prev.email || '',
            memberSince: backendProfile.memberSince
              ? new Date(backendProfile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : prev.memberSince
          }));
        }
      });
    } else if (isGuest) {
      // Guest user — use a minimal local profile, no backend
      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const stored = localStorage.getItem('profile_data_guest');
      if (stored) {
        setProfileData(JSON.parse(stored));
      } else {
        const guestProfile = {
          name: 'Guest User',
          email: 'guest@example.com',
          profilePhoto: '',
          branch: '',
          year: '',
          targetCGPA: '',
          gradingSystem: 'VIT Grading',
          emailNotifications: true,
          twoFactorEnabled: true,
          memberSince: formattedDate
        };
        localStorage.setItem('profile_data_guest', JSON.stringify(guestProfile));
        setProfileData(guestProfile);
      }
    } else {
      setProfileData({
        name: '', email: '', profilePhoto: '', branch: '', year: '',
        targetCGPA: '', gradingSystem: 'VIT Grading',
        emailNotifications: true, twoFactorEnabled: true, memberSince: ''
      });
    }
  }, [currentUser, authEmail, isGuest]);

  const updateProfileData = useCallback((newData) => {
    if (currentUser) {
      // Authenticated user — save to localStorage (excluding profilePhoto which goes via ImageKit)
      const PROFILE_KEY = getProfileKey();
      const { profilePhoto, ...safeData } = newData;
      const updated = { ...profileData, ...safeData, email: authEmail || profileData.email };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfileData(updated);
      return { success: true };
    }
    if (isGuest) {
      // Guest — save locally
      const { profilePhoto, ...safeData } = newData;
      const updated = { ...profileData, ...safeData };
      localStorage.setItem('profile_data_guest', JSON.stringify(updated));
      setProfileData(updated);
      return { success: true };
    }
    return { success: false, error: 'No authenticated user' };
  }, [currentUser, isGuest, profileData, authEmail]);

  // ── Upload profile photo via backend → ImageKit ───────────────────────────
  const uploadProfilePhoto = useCallback(async (file) => {
    if (!currentUser)
      return { success: false, error: 'Guest users cannot upload photos' };

    try {
      const compressedBase64 = await compressImage(file, 300);
      const res = await authFetch(`${API}/api/profile/upload-photo`, {
        method: 'POST',
        body: JSON.stringify({ file: compressedBase64 })
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProfileData(prev => ({ ...prev, profilePhoto: data.url }));
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (err) {
      console.error('Upload Profile Photo Error:', err);
      return { success: false, error: 'Failed to upload photo' };
    }
  }, [currentUser, API]);

  // Canvas image compression helper
  const compressImage = (file, maxSize = 300) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // ── Load GPA data from backend ────────────────────────────────────────────
  const loadUserData = async () => {
    try {
      const res = await authFetch(`${API}/api/gpa/`);
      if (res.status === 401) return null;
      const data = await res.json();
      if (data.email) setAuthEmail(data.email);
      return data;
    } catch (err) {
      console.error('Load GPA Error:', err);
      return null;
    }
  };

  // ── Load ScoreFlow data from backend ──────────────────────────────────────
  const loadScoreFlowData = async () => {
    try {
      const res = await authFetch(`${API}/api/scoreflow/`);
      if (res.status === 401) return;
      const data = await res.json();
      if (data.success && data.scoreFlowData) {
        setScoreFlowData(data.scoreFlowData);
        localStorage.setItem('vtop_imported_data', JSON.stringify(data.scoreFlowData));
      } else {
        setScoreFlowData(null);
      }
    } catch (err) {
      console.error('Load ScoreFlow Error:', err);
    }
  };

  // ── Session restore on page refresh ──────────────────────────────────────
  useEffect(() => {
    // Warmup render-hosted backend
    fetch(`${API}/`).catch(() => {});

    // Guest users: purely client-side, skip all backend calls
    if (getIsGuest()) {
      const gData = localStorage.getItem('user_data_guest');
      setUserData(gData ? JSON.parse(gData) : null);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Validate token by fetching profile — backend returns 401 if expired/invalid
    authFetch(`${API}/api/profile/me`)
      .then(res => {
        if (res.status === 401) {
          // Token expired or tampered — force clean logout
          localStorage.removeItem('token');
          localStorage.removeItem('profile_data_local');
          setIsLoading(false);
          return null;
        }
        return res.json();
      })
      .then(async (profileRes) => {
        if (!profileRes?.success) { setIsLoading(false); return; }

        const { username, email } = profileRes.profile;
        setCurrentUser(username);
        if (email) setAuthEmail(email);

        const [gpaResult] = await Promise.all([loadUserData(), loadScoreFlowData()]);
        setUserData(gpaResult?.gpaData || {});
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('isGuest');
      setCurrentUser(null);
      setIsGuest(false);

      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      console.log('[Auth] Login response:', data);

      if (data.success) {
        if (!data.token) {
          console.error('[Auth] ERROR: Backend returned success but no token. Is the deployed backend updated?');
          toast.error('Server configuration error. Please try again later.');
          return { success: false, error: 'No token received from server.' };
        }

        // 1. Store token
        localStorage.setItem('token', data.token);
        console.log('[Auth] Token stored:', data.token.substring(0, 20) + '...');

        // 2. Verify token immediately by calling /api/profile/me
        const profileRes = await authFetch(`${API}/api/profile/me`);
        console.log('[Auth] /api/profile/me status:', profileRes.status);

        if (!profileRes.ok) {
          localStorage.removeItem('token');
          toast.error('Authentication verification failed. Please try again.');
          return { success: false, error: 'Token verification failed.' };
        }

        const profileDataRes = await profileRes.json();
        console.log('[Auth] Profile data:', profileDataRes);

        // 3. Set user state from verified backend response
        const verifiedUsername = profileDataRes.profile?.username || data.username;
        const verifiedEmail = profileDataRes.profile?.email || data.email || '';

        setCurrentUser(verifiedUsername);
        if (verifiedEmail) setAuthEmail(verifiedEmail);

        // 4. Load GPA and ScoreFlow in parallel
        const [userDataResponse] = await Promise.all([loadUserData(), loadScoreFlowData()]);
        setUserData(userDataResponse?.gpaData || {});

        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[Auth] Login error:', err);
      toast.error('Cannot connect to server.');
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API]);

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async (username, email, password) => {
    try {
      localStorage.removeItem('isGuest');
      setIsGuest(false);

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      console.log('[Auth] Signup response:', data);

      if (data.success) {
        if (!data.token) {
          console.error('[Auth] ERROR: Backend returned success but no token.');
          toast.error('Server configuration error. Please try again later.');
          return { success: false, error: 'No token received from server.' };
        }

        localStorage.setItem('token', data.token);
        console.log('[Auth] Token stored after signup:', data.token.substring(0, 20) + '...');

        // Verify token by calling /api/profile/me
        const profileRes = await authFetch(`${API}/api/profile/me`);
        console.log('[Auth] /api/profile/me status after signup:', profileRes.status);

        if (!profileRes.ok) {
          localStorage.removeItem('token');
          toast.error('Authentication verification failed. Please try again.');
          return { success: false, error: 'Token verification failed.' };
        }

        const profileDataRes = await profileRes.json();
        const verifiedUsername = profileDataRes.profile?.username || data.username;

        setCurrentUser(verifiedUsername);
        setAuthEmail(email);

        toast.success('Signup successful!');
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      toast.error('Cannot connect to server.');
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('profile_data_local');
    localStorage.removeItem('profile_data_guest');
    localStorage.removeItem('vtop_imported_data');
    localStorage.removeItem('user_data_guest');
    setCurrentUser(null);
    setIsGuest(false);
    setAuthEmail('');
    setUserData(null);
    setScoreFlowData(null);
  }, []);

  // ── Guest mode (purely client-side, no JWT, no backend calls) ────────────
  const loginAsGuest = useCallback(() => {
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
    // currentUser stays null — guest identity is tracked via localStorage flag only
    const gData = localStorage.getItem('user_data_guest');
    setUserData(gData ? JSON.parse(gData) : null);
    setIsLoading(false);
  }, []);

  // ── Save GPA data ─────────────────────────────────────────────────────────
  const saveUserData = useCallback(async (data) => {
    if (isGuest) {
      localStorage.setItem('user_data_guest', JSON.stringify(data));
      setUserData(data);
      return;
    }

    const res = await authFetch(`${API}/api/gpa/save-gpa`, {
      method: 'POST',
      body: JSON.stringify({ gpaData: data })
    });
    const result = await res.json();
    if (result.success) setUserData(data || {});
  }, [isGuest, API]);

  // ── Save ScoreFlow data ───────────────────────────────────────────────────
  const saveScoreFlowData = useCallback(async (data) => {
    // Guest: localStorage only — no backend
    if (isGuest) {
      if (data) {
        localStorage.setItem('vtop_imported_data', JSON.stringify(data));
      } else {
        localStorage.removeItem('vtop_imported_data');
      }
      setScoreFlowData(data);
      return;
    }

    if (!currentUser) {
      // Not logged in and not a guest — ignore
      return;
    }

    try {
      const res = await authFetch(`${API}/api/scoreflow/save`, {
        method: 'POST',
        body: JSON.stringify({ scoreFlowData: data })
      });
      const result = await res.json();
      if (result.success) {
        setScoreFlowData(data);
        if (data) {
          localStorage.setItem('vtop_imported_data', JSON.stringify(data));
        } else {
          localStorage.removeItem('vtop_imported_data');
        }
      }
    } catch (err) {
      console.error('Save ScoreFlow Error:', err);
    }
  }, [isGuest, currentUser, API]);

  // ── Change password (Protected — token auth, no username in body) ─────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const res = await authFetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      return data.success
        ? { success: true }
        : { success: false, error: data.error || 'Password update failed' };
    } catch (err) {
      console.error('Change Password Error:', err);
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API]);

  const contextValue = useMemo(() => ({
    currentUser, isGuest, login, signup, logout, loginAsGuest,
    userData, saveUserData, isLoading,
    profileData, updateProfileData, uploadProfilePhoto,
    scoreFlowData, saveScoreFlowData, changePassword
  }), [
    currentUser, isGuest, login, signup, logout, loginAsGuest,
    userData, saveUserData, isLoading,
    profileData, updateProfileData, uploadProfilePhoto,
    scoreFlowData, saveScoreFlowData, changePassword
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
