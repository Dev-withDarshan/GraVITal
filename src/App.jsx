import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardTabProvider } from './context/DashboardTabContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ParticleBackground from './components/ParticleBackground';
import ScoreFlow from './components/ScoreFlow';

// Layout wrapper to easily include Navbar and global background on all pages
const AppLayout = () => {
  const location = useLocation();
  const showParticles = location.pathname === '/' || location.pathname === '/login';
  const showNavbar = location.pathname !== '/login';

  return (
    <>
      {showParticles && <ParticleBackground />}
      {showNavbar && <Navbar />}
      <div key={location.pathname} className="animate-mac-micromotion" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthScreen />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/score-flow" 
            element={
              <ProtectedRoute>
                <ScoreFlow />
              </ProtectedRoute>
            } 
          />
          {/* Render landing page for unknown routes */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardTabProvider>
          <Router>
            <Toaster 
              position="top-right" 
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-soft)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--card-border)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'var(--bg-soft)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--error)',
                    secondary: 'var(--bg-soft)',
                  },
                },
              }}
            />
            <AppLayout />
          </Router>
        </DashboardTabProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

