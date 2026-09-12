import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/**
 * ProtectedRoute — Redirects to /login if user is not authenticated.
 */
const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;