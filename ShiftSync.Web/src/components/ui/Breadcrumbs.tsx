import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}
<div className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">
    <span>Home</span>
    <span className="material-symbols-outlined text-[14px]">
        chevron_right
    </span>
    <span className="text-primary font-bold">Bingo</span>
</div>
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">
                        {item.path ? (
                            <Link
                                to={item.path}
                                className=""
                            >
                                {item.icon && (
                                    <span className="material-symbols-outlined text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                                        {item.icon}
                                    </span>
                                )}
                                <span className="">{item.label}</span>
                            </Link>
                        ) : (
                            <div className="text-primary font-bold">
                                {item.icon && (
                                    <span className="material-symbols-outlined text-lg text-accent-cyan">
                                        {item.icon}
                                    </span>
                                )}
                                <span className="">{item.label}</span>
                            </div>
                        )}


                        {index < items.length - 1 && (
                            <span className="material-symbols-outlined text-[14px] pr-2">
                                chevron_right
                            </span>
                        )}
                    </div>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
