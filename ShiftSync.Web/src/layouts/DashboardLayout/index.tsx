import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './Navbar';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-dashboard-bg text-white font-body selection:bg-accent-purple/30">
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        } ml-0`}
      >
        <DashboardNavbar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 min-h-0 flex flex-col p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
