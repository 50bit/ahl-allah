import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireMohafez?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireMohafez }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isMohafez } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireMohafez && !isMohafez) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

