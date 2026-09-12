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
  active:    'bg-secondary-fixed/40 text-on-secondary-fixed border-secondary-fixed/60',
  inactive:  'bg-surface-container text-on-surface-variant border-outline-variant/40',
  admin:     'bg-primary/10 text-primary border-primary/30',
  user:      'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
  waiting:   'bg-tertiary-fixed text-tertiary border-tertiary-fixed-dim',
  approved:  'bg-secondary-fixed/40 text-on-secondary-fixed border-secondary-fixed/60',
  rejected:  'bg-error-container text-on-error-container border-error/30',
  completed: 'bg-secondary-container/60 text-on-secondary-container border-secondary/30',
  open:      'bg-primary/10 text-primary border-primary/25',
  closed:    'bg-surface-container text-on-surface-variant border-outline-variant/40',
};

const variantDots: Record<StatusBadgeVariant, string> = {
  active:    'bg-secondary',
  inactive:  'bg-outline',
  admin:     'bg-primary',
  user:      'bg-tertiary',
  waiting:   'bg-tertiary',
  approved:  'bg-secondary',
  rejected:  'bg-error',
  completed: 'bg-secondary',
  open:      'bg-primary',
  closed:    'bg-outline',
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
