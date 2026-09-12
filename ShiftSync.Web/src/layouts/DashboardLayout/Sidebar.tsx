import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarAdminRoutes } from '@/routes/sidebar';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { pathname } = useLocation();
  const isExpanded = !isCollapsed || isHovered;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          h-screen fixed left-0 top-0 z-40
          bg-surface-container border-r border-white/5
          flex flex-col py-6 overflow-y-auto custom-scrollbar
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isExpanded ? 'w-72' : 'w-20'}
        `}
      >
        {/* Logo */}
        <div className={`mb-8 transition-all duration-300 ${isExpanded ? 'px-6' : 'px-4'}`}>
          <div
            className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`}
          >
            {/* ShiftSync icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">schedule</span>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                !isExpanded ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}
            >
              <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">
                ShiftSync
              </span>
              <p className="text-[10px] text-white/30 whitespace-nowrap">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4 border-t border-white/5" />

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 transition-all duration-300 ${isExpanded ? 'px-3' : 'px-2'}`}>
          {SidebarAdminRoutes.map((route) => {
            const active = isActive(route.path);
            return (
              <Link
                key={route.path}
                to={route.path}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center rounded-xl transition-all duration-200 group
                  ${isExpanded ? 'px-3 py-2.5 gap-3' : 'justify-center p-3'}
                  ${active
                    ? 'bg-primary/15 text-white border border-primary/25 shadow-[0_0_20px_rgba(59,130,246,0.12)]'
                    : 'text-white/55 hover:bg-white/5 hover:text-white'
                  }
                `}
                title={!isExpanded ? route.label : undefined}
              >
                <span
                  className={`flex-shrink-0 flex items-center justify-center transition-colors ${
                    active ? 'text-primary' : 'group-hover:text-white'
                  }`}
                >
                  {route.icon}
                </span>

                <span
                  className={`font-medium text-[13px] tracking-wide whitespace-nowrap transition-all duration-300 ${
                    !isExpanded ? 'w-0 opacity-0 hidden' : 'flex-1'
                  }`}
                >
                  {route.label}
                </span>

                {active && isExpanded && (
                  <div className="ml-auto w-1.5 h-5 bg-primary rounded-full shadow-[0_0_8px_#3B82F6]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        {isExpanded && (
          <div className="px-3 mt-4 pt-4 border-t border-white/5">
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">Version</p>
              <p className="text-xs text-white/50">ShiftSync v1.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}