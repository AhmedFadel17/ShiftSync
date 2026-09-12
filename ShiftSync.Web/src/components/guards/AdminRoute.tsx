import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { isRoleAdmin } from '@/store/slices/authSlice';

/**
 * AdminRoute — Requires authenticated user with Admin role.
 * Redirects non-admins to /login.
 */
const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !isRoleAdmin(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;