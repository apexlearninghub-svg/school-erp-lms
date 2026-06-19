import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-10 h-10 text-[#0EA5A4] animate-spin" />
          <p className="text-[#64748B] text-sm font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin bypasses admission gate (admin manages the system)
  const isAdmin = user?.role === 'admin';
  const isAdmissionApproved =
    user?.has_submitted_admission && user?.admission_status === 'approved';

  // Step 1: Non-admin users must fill & get admission approved before accessing dashboard
  if (!isAdmin && !isAdmissionApproved && location.pathname !== '/admission') {
    return <Navigate to="/admission" replace />;
  }

  // Step 2: If admission is approved and user visits /admission, send to dashboard
  if ((isAdmin || isAdmissionApproved) && location.pathname === '/admission') {
    return <Navigate to={ROLE_ROUTES[user!.role] || '/'} replace />;
  }

  // Step 3: Role-based access check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_ROUTES[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <Loader2 className="w-10 h-10 text-[#0EA5A4] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const isAdmin = user.role === 'admin';
    const isAdmissionApproved =
      user.has_submitted_admission && user.admission_status === 'approved';

    // Admin → go directly to dashboard
    // Others → go to admission if not yet approved, else dashboard
    if (isAdmin || isAdmissionApproved) {
      return <Navigate to={ROLE_ROUTES[user.role] || '/'} replace />;
    }
    return <Navigate to="/admission" replace />;
  }

  return <>{children}</>;
}
