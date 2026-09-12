import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { SidebarAdminRoutes } from '@/routes/sidebar';

interface NavbarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function DashboardNavbar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Find current page label from routes
  const currentRoute = SidebarAdminRoutes.find((r) => r.path === pathname);
  const pageTitle = currentRoute?.label ?? 'Admin';

  const iconName = isMobile
    ? isMobileMenuOpen ? 'close' : 'menu'
    : isSidebarCollapsed ? 'menu' : 'menu_open';

  return (
    <header className="sticky top-0 z-30 bg-surface-container/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleMenuClick}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined text-xl">{iconName}</span>
          </button>
          <h1 className="text-white font-semibold text-base tracking-wide hidden sm:block">
            {pageTitle}
          </h1>
        </div>

        {/* Right: User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-white text-xs font-semibold leading-tight">
                {user?.fullName ?? 'Admin'}
              </span>
              <span className="text-white/40 text-[10px] leading-tight">Administrator</span>
            </div>
            <span className="material-symbols-outlined text-white/40 text-sm group-hover:text-white/60 transition-colors">
              expand_more
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-high border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scaleUp">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
                <p className="text-white/40 text-[10px] truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out
              </button>
            </div>
          )}

          {/* Click-away overlay */}
          {userMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Mobile navigation links */}
      {isMobile && isMobileMenuOpen && (
        <nav className="border-t border-white/5 px-4 py-3 space-y-1">
          {SidebarAdminRoutes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === route.path
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}