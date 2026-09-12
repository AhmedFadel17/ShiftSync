import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { SidebarAdminRoutes } from '@/routes/sidebar';

export default function DashboardNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState({
    name: 'Emergency & Critical Care',
    location: 'Downtown Branch',
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const branches = [
    { name: 'Emergency & Critical Care', location: 'Downtown Branch' },
    { name: 'Pediatrics & Neonatal Care', location: 'North Wing Campus' },
    { name: 'Trauma & Surgical Center', location: 'City Central Ward' },
    { name: 'Outpatient Specialty Clinic', location: 'East Pavilion' },
  ];

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-space-lg flex items-center justify-between gap-space-sm max-w-7xl mx-auto w-full">
        {/* Left: Brand Logo & Branch Selector */}
        <div className="flex items-center gap-space-sm min-w-0 flex-1">
          <Link to="/admin/dashboard" className="shrink-0 flex items-center">
            <img
              alt="ShiftSync Logo"
              className="h-8 w-auto object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VLFCQVXaxkNKwJMzPnRjNoh0pmSrzDk0GYLLLOGZDWKzFbjAzQij247WFq2AVq5pgcnVzSf1HmIcibA6B2DGdAGEkKONcgO7c3e5Y0Upl9itoLM4uQEUU70ZsWk8tF2nEHxixzlHWdSNIG9Q03uudPF5pEOKbcq3HuZ2Uh6AksAd8qyMPbO53K2suZ8YQ2eJcbX4JHIH77TngpM5yoq4Fpez7HLAe8XqUK-ciH2oeeeEgNLSQmP4PqOA"
            />
          </Link>

          {/* Branch Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setBranchMenuOpen(!branchMenuOpen)}
              className="flex items-center gap-1 min-w-0 text-left h-11 px-space-xs rounded-lg hover:bg-surface-container/60 transition-colors"
              type="button"
              aria-expanded={branchMenuOpen}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-on-surface truncate leading-tight">
                  {selectedBranch.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate leading-tight">
                  {selectedBranch.location}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline shrink-0 text-[18px]">
                expand_more
              </span>
            </button>

            {branchMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBranchMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg p-1.5 z-50 animate-scaleUp">
                  <div className="px-3 py-1.5 text-tertiary font-label-mono text-[10px] uppercase tracking-wider font-semibold">
                    Select Branch
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => {
                        setSelectedBranch(b);
                        setBranchMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                        selectedBranch.name === b.name
                          ? 'bg-surface-container text-primary font-semibold'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="font-medium leading-tight">{b.name}</span>
                      <span className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                        {b.location}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-outline-variant/30">
            {SidebarAdminRoutes.map((route) => {
              const active = pathname === route.path;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
                  }`}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Search, Notifications, Profile */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Search trigger */}
          <button
            aria-label="Search shifts and staff"
            onClick={() => {
              const input = document.getElementById('quickFilterInput');
              if (input) {
                input.focus();
              }
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Pending Notifications Button */}
          <div className="relative">
            <button
              aria-label="Pending swap notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-error text-on-error font-badge-sm text-badge-sm rounded-full flex items-center justify-center font-bold">
                5
              </span>
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl p-3 z-50 animate-scaleUp">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Notifications
                    </span>
                    <span className="font-badge-sm text-badge-sm px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                      5 New
                    </span>
                  </div>
                  <div className="divide-y divide-surface-container text-xs mt-1 max-h-72 overflow-y-auto">
                    <Link
                      to="/admin/attendance-breaks"
                      onClick={() => setNotificationsOpen(false)}
                      className="block py-2.5 px-2 hover:bg-surface-container-low rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-error font-semibold font-badge-sm">
                        <span className="material-symbols-outlined text-[14px]">alarm</span>
                        Critical Unassigned Shift
                      </div>
                      <p className="text-on-surface font-medium mt-0.5">
                        Night Shift • ICU Nurse Lead starting in 4h
                      </p>
                      <span className="text-[10px] text-tertiary">24m ago</span>
                    </Link>
                    <Link
                      to="/admin/attendance-breaks"
                      onClick={() => setNotificationsOpen(false)}
                      className="block py-2.5 px-2 hover:bg-surface-container-low rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-secondary font-semibold font-badge-sm">
                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                        Peer Shift Swap Request
                      </div>
                      <p className="text-on-surface font-medium mt-0.5">
                        Alex Rivera ⇄ Jamie Chen
                      </p>
                      <span className="text-[10px] text-tertiary">42m ago</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              aria-label="Manager Profile"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
              type="button"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDly-E83IpHaC8l2rqHdx_m4boWKg4RBr3UZZW5rPNmZaQGUN4eQ5MymEZ3ep0EWhD3rT2aLfnz_g07pzBbxm7hu6SJ0-45CEy02dXsvl25eOYF9QblrS-h4Pv7q4lL5VZlCS9pQG6kuNC7aHznTJT-cgPeFxmgbuiK-aL0KlxzjioVYSUKg37cRQUArIr80_XZ5eDlqQtHOhuy_1AdmPngqsBw3eJ6NShraCkfNpQSiOUp_TXFzUM"
              />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-50 animate-scaleUp">
                  <div className="px-4 py-3 border-b border-surface-container bg-surface-container-low/50">
                    <p className="text-on-surface font-label-md text-label-md truncate">
                      {user?.fullName ?? 'Morgan Lead'}
                    </p>
                    <p className="text-on-surface-variant font-body-sm text-body-sm truncate mt-0.5">
                      {user?.email ?? 'morgan@shiftsync.hospital'}
                    </p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-badge-sm text-[10px] font-bold uppercase">
                      Admin Manager
                    </span>
                  </div>
                  <div className="p-1 border-b border-surface-container">
                    <Link
                      to={`/admin/users/${user?.id || 'me'}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-primary">account_circle</span>
                      My Profile & Stats
                    </Link>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/40 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}