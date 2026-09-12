import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'cyan';
  subtitle?: string;
  isLoading?: boolean;
}

const colorMap = {
  blue:   { bg: 'bg-primary/10',         icon: 'text-primary',        border: 'border-primary/20'   },
  green:  { bg: 'bg-accent-green/10',    icon: 'text-accent-green',   border: 'border-accent-green/20' },
  yellow: { bg: 'bg-accent-yellow/10',   icon: 'text-accent-yellow',  border: 'border-accent-yellow/20' },
  purple: { bg: 'bg-accent-purple/10',   icon: 'text-accent-purple',  border: 'border-accent-purple/20' },
  red:    { bg: 'bg-error/10',           icon: 'text-error',          border: 'border-error/20'     },
  cyan:   { bg: 'bg-accent-cyan/10',     icon: 'text-accent-cyan',    border: 'border-accent-cyan/20' },
};

export default function KpiCard({ title, value, icon, color, subtitle, isLoading }: KpiCardProps) {
  const c = colorMap[color];

  return (
    <div className={`bg-surface-container rounded-2xl border ${c.border} p-5 flex items-center gap-4 transition-all duration-200 hover:border-opacity-50 hover:shadow-lg`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
        <span className={`${c.icon} text-xl`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider truncate">{title}</p>
        {isLoading ? (
          <div className="h-7 w-20 bg-white/10 rounded-lg animate-pulse mt-1" />
        ) : (
          <p className="text-white text-2xl font-bold tracking-tight mt-0.5">{value}</p>
        )}
        {subtitle && <p className="text-white/30 text-[11px] mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
