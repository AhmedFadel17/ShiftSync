import React from "react";
import { SidebarUserRoutes, SidebarAdminRoutes } from '@/routes/sidebar';
interface SidebarProps {
    isAdmin: boolean;
}
export const Footer = ({ isAdmin }: SidebarProps) => {
    const routes = isAdmin ? SidebarAdminRoutes : SidebarUserRoutes;

    return (
        <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 h-16 bg-dashboard-bg/90 backdrop-blur-md rounded-t-xl border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
            {routes.map((route, index) => {
                const isActive = route.path === location.pathname;
                return (
                    <a
                        key={index}
                        href={route.path}
                        className={`flex flex-col items-center justify-center ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                        <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
                            {route.icon}
                        </span>
                        <span className="text-[10px] mt-1 font-semibold">{route.label}</span>
                    </a>
                );
            })}


        </nav>
    );
};

export default Footer;