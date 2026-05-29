import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoading } = useAuth();
  const hasToken = !!localStorage.getItem('token');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  console.log('[ProtectedRoute]', { isLoading, hasToken, isGuest });

  // Still initializing session from localStorage token on first load
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
        Loading session...
      </div>
    );
  }

  // No token AND not a guest → redirect to login
  if (!hasToken && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated user (has JWT) or guest (localStorage flag) — allow access
  return children ? children : <Outlet />;
}
