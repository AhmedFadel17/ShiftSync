import { AppRoute } from '@/types/ui';
import AdminDashboard from '@/pages/Admin/Dashboard';
import UsersPage from '@/pages/Admin/Users';
import ShiftsPage from '@/pages/Admin/Shifts';
import UserShiftsPage from '@/pages/Admin/UserShifts';
import BreakTypesPage from '@/pages/Admin/BreakTypes';
import AttendancesPage from '@/pages/Admin/Attendances';
import AttendanceBreaksPage from '@/pages/Admin/AttendanceBreaks';

// =============================
// ADMIN ROUTES
// =============================
export const AdminRoutes: AppRoute[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/users',
    label: 'Users',
    element: <UsersPage />,
  },
  {
    path: '/admin/shifts',
    label: 'Shifts',
    element: <ShiftsPage />,
  },
  {
    path: '/admin/user-shifts',
    label: 'Shift Assignments',
    element: <UserShiftsPage />,
  },
  {
    path: '/admin/break-types',
    label: 'Break Types',
    element: <BreakTypesPage />,
  },
  {
    path: '/admin/attendances',
    label: 'Attendances',
    element: <AttendancesPage />,
  },
  {
    path: '/admin/attendance-breaks',
    label: 'Attendance Breaks',
    element: <AttendanceBreaksPage />,
  },
];
