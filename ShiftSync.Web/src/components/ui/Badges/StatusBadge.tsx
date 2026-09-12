import { UserRole } from '@/types/shiftsync/user';
import { BreakStatus } from '@/types/shiftsync/attendanceBreak';

type StatusBadgeVariant =
  | 'active'
  | 'inactive'
  | 'admin'
  | 'user'
  | 'waiting'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'open'
  | 'closed';

const variantStyles: Record<StatusBadgeVariant, string> = {
  active:    'bg-accent-green/15 text-accent-green border-accent-green/25',
  inactive:  'bg-white/5 text-white/40 border-white/10',
  admin:     'bg-accent-purple/15 text-accent-purple border-accent-purple/25',
  user:      'bg-primary/15 text-primary border-primary/25',
  waiting:   'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/25',
  approved:  'bg-accent-green/15 text-accent-green border-accent-green/25',
  rejected:  'bg-error/15 text-error border-error/25',
  completed: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25',
  open:      'bg-primary/15 text-primary border-primary/25',
  closed:    'bg-white/5 text-white/40 border-white/10',
};

const variantDots: Record<StatusBadgeVariant, string> = {
  active:    'bg-accent-green',
  inactive:  'bg-white/30',
  admin:     'bg-accent-purple',
  user:      'bg-primary',
  waiting:   'bg-accent-yellow',
  approved:  'bg-accent-green',
  rejected:  'bg-error',
  completed: 'bg-accent-cyan',
  open:      'bg-primary',
  closed:    'bg-white/30',
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border tracking-wide ${variantStyles[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${variantDots[variant]}`} />
      {label}
    </span>
  );
}

// Convenience helpers
export function IsActiveBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge variant={isActive ? 'active' : 'inactive'} label={isActive ? 'Active' : 'Inactive'} />;
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <StatusBadge
      variant={role === UserRole.Admin ? 'admin' : 'user'}
      label={role === UserRole.Admin ? 'Admin' : 'User'}
    />
  );
}

export function BreakStatusBadge({ status }: { status: BreakStatus }) {
  const map: Record<BreakStatus, { variant: StatusBadgeVariant; label: string }> = {
    [BreakStatus.Approved]:    { variant: 'approved', label: 'Approved' },
    [BreakStatus.WaitingQueue]:{ variant: 'waiting',  label: 'Waiting' },
    [BreakStatus.Rejected]:    { variant: 'rejected',  label: 'Rejected' },
    [BreakStatus.Completed]:   { variant: 'completed', label: 'Completed' },
  };
  const config = map[status] ?? { variant: 'inactive', label: 'Unknown' };
  return <StatusBadge variant={config.variant} label={config.label} />;
}
