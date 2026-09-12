import KpiCard from '@/components/ui/Cards/KpiCard';
import { useGetUsersQuery } from '@/store/apis';
import { useGetShiftsQuery } from '@/store/apis';
import { useGetAttendancesQuery } from '@/store/apis';
import { useGetAttendanceBreaksQuery } from '@/store/apis';
import { BreakStatus } from '@/types/shiftsync';
import { FaUsers, FaClock, FaClipboardList, FaPauseCircle } from 'react-icons/fa';
import { BreakStatusBadge, IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ pageNumber: 1, pageSize: 1 });
  const { data: shiftsData, isLoading: shiftsLoading } = useGetShiftsQuery({ pageNumber: 1, pageSize: 1, isActive: true });
  const { data: attendancesData, isLoading: attendancesLoading } = useGetAttendancesQuery({ pageNumber: 1, pageSize: 5 });
  const { data: breaksData, isLoading: breaksLoading } = useGetAttendanceBreaksQuery({
    pageNumber: 1,
    pageSize: 5,
    status: BreakStatus.WaitingQueue,
  });

  const totalUsers = usersData?.data?.totalCount ?? 0;
  const activeShifts = shiftsData?.data?.totalCount ?? 0;
  const totalAttendances = attendancesData?.data?.totalCount ?? 0;
  const pendingBreaks = breaksData?.data?.totalCount ?? 0;

  const recentAttendances = attendancesData?.data?.items ?? [];
  const waitingBreaks = breaksData?.data?.items ?? [];

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()},{' '}
          <span className="text-primary">{user?.fullName?.split(' ')[0] ?? 'Admin'}</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Here's what's happening with your workforce today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Users"
          value={totalUsers}
          icon={<FaUsers />}
          color="blue"
          subtitle="All registered employees"
          isLoading={usersLoading}
        />
        <KpiCard
          title="Active Shifts"
          value={activeShifts}
          icon={<FaClock />}
          color="green"
          subtitle="Currently configured shifts"
          isLoading={shiftsLoading}
        />
        <KpiCard
          title="Attendances"
          value={totalAttendances}
          icon={<FaClipboardList />}
          color="cyan"
          subtitle="All check-in records"
          isLoading={attendancesLoading}
        />
        <KpiCard
          title="Pending Breaks"
          value={pendingBreaks}
          icon={<FaPauseCircle />}
          color="yellow"
          subtitle="Waiting for approval"
          isLoading={breaksLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Attendances */}
        <div className="section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white text-sm">Recent Attendances</h3>
          </div>
          {attendancesLoading ? (
            <SkeletonRows rows={5} />
          ) : recentAttendances.length === 0 ? (
            <EmptyState message="No attendance records yet" />
          ) : (
            <ul className="divide-y divide-white/5">
              {recentAttendances.map((att) => (
                <li key={att.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{att.userFullName ?? `User #${att.userId}`}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {formatDateTime(att.checkInTime)}
                    </p>
                  </div>
                  <IsActiveBadge isActive={!att.checkOutTime} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Waiting Break Requests */}
        <div className="section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white text-sm">Waiting Break Requests</h3>
          </div>
          {breaksLoading ? (
            <SkeletonRows rows={5} />
          ) : waitingBreaks.length === 0 ? (
            <EmptyState message="No pending break requests" />
          ) : (
            <ul className="divide-y divide-white/5">
              {waitingBreaks.map((brk) => (
                <li key={brk.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{brk.userFullName ?? `Attendance #${brk.attendanceId}`}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {brk.breakTypeName ?? `Break Type #${brk.breakTypeId}`} · {formatDateTime(brk.requestTime)}
                    </p>
                  </div>
                  <BreakStatusBadge status={brk.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <ul className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center justify-between px-5 py-3.5">
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-white/30">
      <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
