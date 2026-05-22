import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const API = "https://cgpa-grade-calculator-backend.onrender.com";
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
    branch: '',
    year: '',
    targetCGPA: '',
    memberSince: ''
  });

  useEffect(() => {
    if (currentUser) {
      const storedProfile = localStorage.getItem(`profile_data_${currentUser}`);
      const options = { month: 'long', year: 'numeric' };
      const formattedDate = new Date().toLocaleDateString('en-US', options);

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const hasMemberSince = !!parsed.memberSince;
        const finalMemberSince = parsed.memberSince || formattedDate;
        
        const updated = {
          name: parsed.name || '',
          email: parsed.email || '',
          profilePhoto: parsed.profilePhoto || '',
          branch: parsed.branch || '',
          year: parsed.year || '',
          targetCGPA: parsed.targetCGPA || '',
          memberSince: finalMemberSince
        };

        if (!hasMemberSince) {
          localStorage.setItem(`profile_data_${currentUser}`, JSON.stringify(updated));
        }
        setProfileData(updated);
      } else {
        const defName = currentUser === 'guest' ? 'Guest User' : currentUser;
        const defEmail = currentUser === 'guest' ? 'guest@example.com' : `${currentUser}@gmail.com`;
        const defaultProf = {
          name: defName,
          email: defEmail,
          profilePhoto: '',
          branch: '',
          year: '',
          targetCGPA: '',
          memberSince: formattedDate
        };
        localStorage.setItem(`profile_data_${currentUser}`, JSON.stringify(defaultProf));
        setProfileData(defaultProf);
      }
    } else {
      setProfileData({ name: '', email: '', profilePhoto: '', branch: '', year: '', targetCGPA: '', memberSince: '' });
    }
  }, [currentUser]);

  const updateProfileData = (newData) => {
    if (currentUser) {
      const updated = { ...profileData, ...newData };
      localStorage.setItem(`profile_data_${currentUser}`, JSON.stringify(updated));
      setProfileData(updated);
      return { success: true };
    }
    return { success: false, error: 'No authenticated user' };
  };

  const loadUserData = async (username) => {
    try {
      const res = await fetch(`${API}/api/gpa/${username}`);
      const data = await res.json();

      console.log("Loaded user data:", data);

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // 💀 STEP 3: LOAD DATA ON PAGE REFRESH
  useEffect(() => {
    // Warmup call to wake the backend before any user requests are made
    const warmupBackend = async () => {
      try {
        console.log("Warming up backend...");
        await fetch("https://cgpa-grade-calculator-backend.onrender.com/");
        console.log("Backend warmup complete!");
      } catch (err) {
        console.error("Warmup call failed:", err);
      }
    };
    warmupBackend();

    const user = localStorage.getItem("user");

    if (user) {
      console.log("User logged in:", user);
      setCurrentUser(user);
      loadUserData(user).then((data) => {
        setUserData(data?.gpaData || {});
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // For Guest Users
  useEffect(() => {
    if (currentUser === 'guest') {
      const gData = localStorage.getItem('user_data_guest');
      setUserData(gData ? JSON.parse(gData) : null);
      setIsLoading(false);
    }
  }, [currentUser]);

  // 🚀 STEP 2: CONNECT LOGIN
  const login = async (username, password) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("user", username); // 🔥 store session
        setCurrentUser(username);

        const userDataResponse = await loadUserData(username);

        // 👇 VERY IMPORTANT
        setUserData(userDataResponse?.gpaData || {});

        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch(err) {
      toast.error("Cannot connect to server.");
      return { success: false, error: 'Cannot connect to server.' };
    }
  };

  // 🚀 STEP 1: CONNECT SIGNUP
  const signup = async (username, password) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("user", username);
        setCurrentUser(username);
        toast.success("Signup successful!");
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch(err) {
      toast.error("Cannot connect to server.");
      return { success: false, error: 'Cannot connect to server.' };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUserData(null);
  };

  const loginAsGuest = () => {
    setCurrentUser('guest');
  };

  const saveUserData = async (data) => {
    if (currentUser === 'guest') {
      localStorage.setItem('user_data_guest', JSON.stringify(data));
      setUserData(data);
      return;
    }

    console.log("🔥 SENDING GPA DATA:", data);

    const res = await fetch(`${API}/api/gpa/save-gpa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: localStorage.getItem("user"),
        gpaData: data
      })
    });

    const result = await res.json();
    console.log("🔥 SAVE RESPONSE:", result);
    if (result.success) {
      setUserData(data || {});
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loginAsGuest, userData, saveUserData, isLoading, profileData, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};
