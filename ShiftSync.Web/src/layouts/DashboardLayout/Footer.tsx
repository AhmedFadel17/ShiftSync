import { Link, useLocation } from 'react-router-dom';

export default function DashboardFooter() {
  const { pathname } = useLocation();

  const navItems = [
    {
      label: 'Overview',
      path: '/admin/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Roster',
      path: '/admin/users',
      icon: 'badge',
    },
    {
      label: 'Shifts',
      path: '/admin/shifts',
      icon: 'calendar_today',
    },
    {
      label: 'Swaps',
      path: '/admin/attendance-breaks',
      icon: 'swap_horiz',
      badge: '5',
    },
    {
      label: 'Analytics',
      path: '/admin/attendances',
      icon: 'insights',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-outline-variant/20 lg:hidden"
      data-active-classes="text-primary font-bold"
    >
      <div className="flex items-center justify-around h-16 px-space-xs max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-12 transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.badge && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-error text-on-error font-badge-sm text-[9px] rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
              <span className="font-badge-sm text-badge-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}