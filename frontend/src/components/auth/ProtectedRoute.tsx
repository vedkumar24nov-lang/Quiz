import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthLoading, useAuthUser, type UserRole } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional role gate. Omit to require only sign-in. */
  requireRole?: UserRole | UserRole[];
}

/**
 * Wraps any route that requires a signed-in user. Optionally gates on role.
 * - Loading → quiet loader (no flash)
 * - Unauthed → redirect to /sign-in (remembering the target)
 * - Authed but wrong role → friendly 403 page
 */
export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!allowed.includes(user.role)) {
      return (
        <div className="container-page py-16 max-w-md mx-auto text-center">
          <div className="inline-flex w-14 h-14 items-center justify-center rounded-xl bg-red-100 text-red-700 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Access denied</h1>
          <p className="text-sm text-slate-600 mt-2">
            This area requires the <strong>{allowed.join(' or ')}</strong> role. You're signed in as <strong>{user.role}</strong>.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-5 px-4 py-2 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md"
          >
            Back to your dashboard
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
}
