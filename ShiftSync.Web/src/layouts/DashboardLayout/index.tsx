import { Outlet } from 'react-router-dom';
import DashboardNavbar from './Navbar';
import DashboardFooter from './Footer';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface">
      {/* Fixed Top Header */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-16 pb-20 lg:pb-12 bg-surface flex-1 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <DashboardFooter />
    </div>
  );
}
