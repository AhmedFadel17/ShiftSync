import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/Auth/Login';
import AdminRoute from '@/components/guards/AdminRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import NotFound from '@/pages/OtherPage/NotFound';
import { AdminRoutes } from '@/routes';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Dashboard */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            {AdminRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
