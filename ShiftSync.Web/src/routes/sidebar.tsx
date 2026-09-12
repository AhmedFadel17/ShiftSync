import { SidebarRoute } from '@/types/ui';
import {
  FaHome,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaCoffee,
  FaClipboardList,
  FaPauseCircle,
} from 'react-icons/fa';

// =============================
// ADMIN SIDEBAR ROUTES
// =============================
export const SidebarAdminRoutes: SidebarRoute[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: <FaHome size={18} />,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: <FaUsers size={18} />,
  },
  {
    path: '/admin/shifts',
    label: 'Shifts',
    icon: <FaClock size={18} />,
  },
  {
    path: '/admin/user-shifts',
    label: 'Shift Assignments',
    icon: <FaCalendarAlt size={18} />,
  },
  {
    path: '/admin/break-types',
    label: 'Break Types',
    icon: <FaCoffee size={18} />,
  },
  {
    path: '/admin/attendances',
    label: 'Attendances',
    icon: <FaClipboardList size={18} />,
  },
  {
    path: '/admin/attendance-breaks',
    label: 'Break Requests',
    icon: <FaPauseCircle size={18} />,
  },
];

// Empty user routes — admin-only app
export const SidebarUserRoutes: SidebarRoute[] = [];
