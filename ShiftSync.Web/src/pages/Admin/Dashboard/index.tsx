import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import {
  useGetUsersQuery,
  useGetShiftsQuery,
  useGetUserShiftsQuery,
  useGetAttendancesQuery,
  useGetAttendanceBreaksQuery,
  useUpdateBreakStatusMutation,
} from '@/store/apis';
import { BreakStatus } from '@/types/shiftsync';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // States
  const [filterText, setFilterText] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');

  // RTK Query hooks for live data
  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery({ pageSize: 100, isActive: true });
  const { data: shiftsData, isLoading: isShiftsLoading } = useGetShiftsQuery({ pageSize: 100, isActive: true });
  const { data: userShiftsData, isLoading: isUserShiftsLoading } = useGetUserShiftsQuery({ pageSize: 100 });
  const { data: attendancesData, isLoading: isAttendancesLoading } = useGetAttendancesQuery({ pageSize: 50 });
  const { data: pendingBreaksData, isLoading: isBreaksLoading } = useGetAttendanceBreaksQuery({
    pageSize: 10,
    status: BreakStatus.WaitingQueue,
  });

  const [updateBreakStatus, { isLoading: isUpdatingBreak }] = useUpdateBreakStatusMutation();

  const usersList = usersData?.data?.items ?? [];
  const shiftsList = shiftsData?.data?.items ?? [];
  const userShiftsList = userShiftsData?.data?.items ?? [];
  const attendancesList = attendancesData?.data?.items ?? [];
  const pendingBreaks = pendingBreaksData?.data?.items ?? [];

  // Keyboard shortcut listener for CMD+F / CTRL+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const input = document.getElementById('quickFilterInput');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute Live Metrics from API Data
  const metrics = useMemo(() => {
    const totalUsers = usersData?.data?.totalCount ?? usersList.length;
    const activeShiftsCount = shiftsData?.data?.totalCount ?? shiftsList.length;
    const totalAttendances = attendancesData?.data?.totalCount ?? attendancesList.length;
    const pendingRequestsCount = pendingBreaksData?.data?.totalCount ?? pendingBreaks.length;

    // Minimum staff required across all active shifts
    const totalRequiredStaff = shiftsList.reduce(
      (sum, s) => sum + (s.minActiveEmployeesRequired || 1),
      0
    );

    // Unique employees currently scheduled across shifts
    const uniqueScheduledStaffIds = new Set(userShiftsList.map((us) => us.userId));
    const uniqueScheduledStaffCount = uniqueScheduledStaffIds.size;

    // Coverage Rate
    const coverageRate =
      totalRequiredStaff > 0
        ? Math.min(100, Math.round((uniqueScheduledStaffCount / totalRequiredStaff) * 100))
        : activeShiftsCount > 0
        ? 100
        : 0;

    // Identify Shifts that are currently under minimum required coverage
    const understaffedShifts = shiftsList.filter((shift) => {
      const assignedToShift = userShiftsList.filter((us) => us.shiftId === shift.id);
      return assignedToShift.length < (shift.minActiveEmployeesRequired || 1);
    });

    // Approximate total scheduled hours (e.g. 8h per user-shift assignment or logged hours)
    const estimatedTotalHours = userShiftsList.length * 8;

    return {
      totalUsers,
      activeShiftsCount,
      totalAttendances,
      pendingRequestsCount,
      coverageRate,
      understaffedShifts,
      estimatedTotalHours,
      uniqueScheduledStaffCount,
    };
  }, [
    usersData,
    shiftsData,
    attendancesData,
    pendingBreaksData,
    usersList,
    shiftsList,
    userShiftsList,
    attendancesList,
    pendingBreaks,
  ]);

  // Handle Real Break Request Decision (Approve / Reject)
  const handleBreakDecision = async (breakId: number, status: BreakStatus) => {
    try {
      await updateBreakStatus({
        id: breakId,
        body: { status },
      }).unwrap();
      if (status === BreakStatus.Approved) {
        toast.success('Break request approved & synchronized');
      } else {
        toast.info('Break request was declined');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update request');
    }
  };

  // Filter attendance logs by search text and selected shift filter
  const displayedAttendances = attendancesList.filter((att) => {
    const matchesShift =
      selectedShiftFilter === 'all' ||
      (selectedShiftFilter === 'ongoing' && !att.checkOutTime) ||
      (selectedShiftFilter === 'completed' && !!att.checkOutTime) ||
      att.shiftName?.toLowerCase().includes(selectedShiftFilter.toLowerCase());

    const staffName = att.userFullName?.toLowerCase() ?? '';
    const shiftName = att.shiftName?.toLowerCase() ?? '';
    const matchesSearch =
      filterText.trim() === '' ||
      staffName.includes(filterText.toLowerCase()) ||
      shiftName.includes(filterText.toLowerCase());

    return matchesShift && matchesSearch;
  });

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const greetingTime = getGreeting();
  const managerName = user?.fullName?.split(' ')[0] ?? 'Admin';

  // Find the first understaffed shift for the alert card, if any
  const criticalShift = metrics.understaffedShifts[0];
  const firstPendingBreak = pendingBreaks[0];

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Manager Greeting & Tactical Search */}
      <section className="flex flex-col pt-space-sm">
        <div className="flex items-center justify-between gap-space-sm mb-space-xs">
          <div className="flex flex-col min-w-0">
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Today • {currentDate}
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Good {greetingTime}, {managerName}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center text-on-secondary-container shrink-0 shadow-sm">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              health_and_safety
            </span>
          </div>
        </div>

        {/* Quick Search Field with Tactical Keyboard Indicator */}
        <div className="relative mt-space-sm w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            id="quickFilterInput"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full h-11 pl-10 pr-20 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-low transition-all duration-150 border border-outline-variant/20 focus:border-primary/40"
            placeholder="Filter active floor staff, shifts, or roles..."
            type="text"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md text-on-surface-variant font-label-mono text-label-mono select-none">
            <span>⌘</span>
            <span>F</span>
          </div>
        </div>
      </section>

      {/* Key Metrics Bento Grid (2x2 on mobile, 4-col on desktop) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Metric 1: Coverage Rate */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/15 hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Coverage Rate
            </span>
            <div className="w-6 h-6 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[14px]">pie_chart</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {isShiftsLoading || isUserShiftsLoading ? '—' : `${metrics.coverageRate}%`}
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary font-label-mono text-[10px]">
              <span className="material-symbols-outlined text-[13px]">
                {metrics.coverageRate >= 80 ? 'trending_up' : 'trending_down'}
              </span>
              <span>
                {metrics.coverageRate >= 100
                  ? 'Full workforce coverage'
                  : `${metrics.uniqueScheduledStaffCount} staff scheduled`}
              </span>
            </div>
          </div>
          {/* Progress Gauge */}
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.coverageRate >= 80 ? 'bg-secondary-fixed-dim' : 'bg-error'
              }`}
              style={{ width: `${Math.max(5, metrics.coverageRate)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Open / Understaffed Shifts */}
        <Link
          to="/admin/shifts"
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/15 hover:border-error/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface">
              Open / Deficit Shifts
            </span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                metrics.understaffedShifts.length > 0
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-secondary-fixed/50 text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {metrics.understaffedShifts.length > 0 ? 'warning' : 'check_circle'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                {metrics.understaffedShifts.length}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {metrics.understaffedShifts.length === 1 ? 'shift needs staff' : 'shifts need staff'}
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full font-badge-sm text-[9px] font-bold ${
                metrics.understaffedShifts.length > 0
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-secondary-fixed/40 text-on-secondary-fixed'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  metrics.understaffedShifts.length > 0 ? 'bg-error animate-pulse' : 'bg-secondary'
                }`}
              />
              <span>
                {metrics.understaffedShifts.length > 0
                  ? `${metrics.understaffedShifts.length} Under Minimum`
                  : 'All Shifts Covered'}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                metrics.understaffedShifts.length > 0 ? 'bg-error' : 'bg-secondary'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (metrics.understaffedShifts.length / Math.max(1, metrics.activeShiftsCount)) * 100
                )}%`,
              }}
            />
          </div>
        </Link>

        {/* Metric 3: Active Staff & Scheduled Workload */}
        <Link
          to="/admin/users"
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface">
              Active Staff
            </span>
            <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[14px]">groups</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {isUsersLoading ? '—' : metrics.totalUsers}
              <span className="text-label-md text-tertiary font-normal ml-1">registered</span>
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5 truncate">
              {metrics.estimatedTotalHours}h total scheduled
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-mono text-[10px] mt-2">
            <span className="text-primary font-bold">●</span> Workforce ready
          </div>
        </Link>

        {/* Metric 4: Pending Swaps & Break Queue */}
        <Link
          to="/admin/attendance-breaks"
          className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface">
              Break & Swap Queue
            </span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                metrics.pendingRequestsCount > 0
                  ? 'bg-tertiary-fixed text-tertiary'
                  : 'bg-secondary-fixed/50 text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {isBreaksLoading ? '—' : metrics.pendingRequestsCount}
            </div>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full font-badge-sm text-[9px] font-bold ${
                metrics.pendingRequestsCount > 0
                  ? 'bg-surface-container-high text-primary'
                  : 'bg-secondary-fixed/40 text-on-secondary-fixed'
              }`}
            >
              {metrics.pendingRequestsCount > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  <span>Needs review</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[11px]">check</span>
                  <span>Queue clear</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between font-label-mono text-[10px] text-tertiary mt-2">
            <span>
              {metrics.pendingRequestsCount > 0
                ? `${metrics.pendingRequestsCount} pending requests`
                : 'No pending approvals'}
            </span>
          </div>
        </Link>
      </section>

      {/* Live Floor Roster Status Widget */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md border border-outline-variant/15">
        {/* Header & Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">timelapse</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Live Floor Roster
            </h2>
          </div>
          <span className="font-label-mono text-label-mono px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-semibold">
            {attendancesList.length} Logs Recorded
          </span>
        </div>

        {/* Dynamic Filter Pills */}
        <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-1 rounded-xl">
          <button
            onClick={() => setSelectedShiftFilter('all')}
            className={`shift-pill-btn flex flex-col items-center py-1.5 px-1 rounded-lg transition-all ${
              selectedShiftFilter === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="font-badge-sm text-[10px] uppercase font-bold text-secondary">
              All Activity
            </span>
            <span className="font-label-md text-label-md mt-0.5">Floor Total</span>
            <span className="font-label-mono text-[10px] text-on-surface-variant">
              {attendancesList.length} Logs
            </span>
          </button>

          <button
            onClick={() => setSelectedShiftFilter('ongoing')}
            className={`shift-pill-btn flex flex-col items-center py-1.5 px-1 rounded-lg transition-all ${
              selectedShiftFilter === 'ongoing'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="font-badge-sm text-[10px] uppercase font-bold text-secondary">
              Active Now
            </span>
            <span className="font-label-md text-label-md mt-0.5">On Shift</span>
            <span className="font-label-mono text-[10px] text-on-surface-variant">
              {attendancesList.filter((a) => !a.checkOutTime).length} Active
            </span>
          </button>

          <button
            onClick={() => setSelectedShiftFilter('completed')}
            className={`shift-pill-btn flex flex-col items-center py-1.5 px-1 rounded-lg transition-all ${
              selectedShiftFilter === 'completed'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="font-badge-sm text-[10px] uppercase font-bold text-tertiary">
              Checked Out
            </span>
            <span className="font-label-md text-label-md mt-0.5">Completed</span>
            <span className="font-label-mono text-[10px] text-on-surface-variant">
              {attendancesList.filter((a) => !!a.checkOutTime).length} Logs
            </span>
          </button>
        </div>

        {/* Live Staff Roster Rows */}
        <div className="flex flex-col space-y-space-sm pt-space-xs">
          {isAttendancesLoading ? (
            <div className="text-center py-8 text-on-surface-variant text-xs flex flex-col items-center">
              <span className="material-symbols-outlined text-2xl animate-spin text-primary mb-2">
                refresh
              </span>
              Loading floor attendance logs...
            </div>
          ) : displayedAttendances.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                person_search
              </span>
              {attendancesList.length === 0
                ? 'No employee check-ins recorded yet today. When staff clock in, their live status appears here.'
                : 'No attendance records match your filter.'}
            </div>
          ) : (
            displayedAttendances.slice(0, 8).map((att) => {
              const isOngoing = !att.checkOutTime;
              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm shadow-sm">
                        {att.userFullName?.charAt(0)?.toUpperCase() ?? 'U'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-surface-container-lowest ${
                          isOngoing ? 'bg-secondary' : 'bg-outline'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link
                        to={`/admin/users/${att.userId}`}
                        className="font-body-lg text-body-lg text-on-surface font-semibold truncate leading-tight hover:text-primary transition-colors hover:underline"
                      >
                        {att.userFullName ?? `Staff #${att.userId}`}
                      </Link>
                      <span className="font-body-sm text-body-sm text-tertiary truncate">
                        {att.shiftName ?? `Shift #${att.userShiftId}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-badge-sm text-badge-sm font-semibold ${
                        isOngoing
                          ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {isOngoing ? 'ON SHIFT' : 'COMPLETED'}
                    </span>
                    <span className="font-label-mono text-[10px] text-tertiary mt-0.5">
                      In:{' '}
                      {new Date(att.checkInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Section: Urgent Actions & Pending Approvals */}
      <section className="space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-error text-[20px]">
              notifications_active
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Urgent Action Items
            </h2>
          </div>
          <span className="font-badge-sm text-badge-sm px-2 py-0.5 bg-error text-on-error rounded-full font-bold">
            {metrics.understaffedShifts.length + pendingBreaks.length} PENDING
          </span>
        </div>

        {/* Card 1: Real Understaffed Shift Alert */}
        {criticalShift ? (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md relative overflow-hidden border border-outline-variant/15">
            {/* Left Urgent Color Strip Indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error" />
            <div className="pl-1.5 flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-badge-sm text-[10px] font-bold tracking-wider">
                  UNDERSTAFFED SHIFT
                </span>
                <span className="font-label-mono text-label-mono text-error font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">alarm</span> Active
                  Schedule
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold pt-1">
                {criticalShift.name}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Hours: {criticalShift.startTime} – {criticalShift.endTime} • Requires minimum{' '}
                {criticalShift.minActiveEmployeesRequired} staff
              </p>
            </div>

            {/* Shift Staffing Health Strip */}
            <div className="pl-1.5 p-2 bg-surface-container-low rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">groups</span>
                <span className="font-body-sm text-body-sm text-on-surface">
                  Requires additional staff allocations to meet hospital safety compliance
                </span>
              </div>
              <span className="font-label-mono text-label-mono text-error font-bold">
                Action Required
              </span>
            </div>

            {/* Action Buttons Duo */}
            <div className="pl-1.5 grid grid-cols-2 gap-space-sm pt-0.5">
              <button
                className="h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                onClick={() => navigate(`/admin/shifts/${criticalShift.id}`)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Assign Staff to Shift</span>
              </button>
              <button
                className="h-11 rounded-xl bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container-highest active:scale-[0.98] transition-all"
                onClick={() => navigate('/admin/shifts')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span>View All Shifts</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <p className="font-semibold text-xs text-on-surface">All Shifts Adequately Staffed</p>
              <p className="text-[11px] text-on-surface-variant">
                Every configured shift meets the required minimum employee staffing threshold.
              </p>
            </div>
          </div>
        )}

        {/* Card 2: Real Pending Break / Swap Approval Request */}
        {firstPendingBreak ? (
          <div
            key={firstPendingBreak.id}
            className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col space-y-space-md border border-outline-variant/15 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  swap_horizontal_circle
                </span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Pending Break / Swap Authorization
                </span>
              </div>
              <span className="font-label-mono text-[10px] text-tertiary">
                Submitted {new Date(firstPendingBreak.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Request Summary */}
            <div className="flex items-center justify-between bg-surface-container-low/80 p-space-sm rounded-xl gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {firstPendingBreak.userFullName?.charAt(0)?.toUpperCase() ?? 'S'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                    {firstPendingBreak.userFullName ?? `Attendance #${firstPendingBreak.attendanceId}`}
                  </span>
                  <span className="font-label-mono text-[10px] text-on-surface-variant">
                    Type: {firstPendingBreak.breakTypeName ?? `Break Type #${firstPendingBreak.breakTypeId}`}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-label-mono text-xs font-semibold text-tertiary px-2 py-0.5 rounded bg-surface-container">
                  Pending Queue
                </span>
              </div>
            </div>

            {firstPendingBreak.note && (
              <div className="text-xs text-on-surface-variant bg-surface-container-low/40 p-2 rounded-lg italic">
                "{firstPendingBreak.note}"
              </div>
            )}

            {/* Real Action Buttons */}
            <div className="grid grid-cols-2 gap-space-sm pt-0.5">
              <button
                className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                onClick={() => handleBreakDecision(firstPendingBreak.id, BreakStatus.Approved)}
                disabled={isUpdatingBreak}
                type="button"
              >
                {isUpdatingBreak ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
                <span>Approve Request</span>
              </button>
              <button
                className="h-11 rounded-xl bg-surface-container-high text-error font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-error-container active:scale-[0.98] transition-all disabled:opacity-50"
                onClick={() => handleBreakDecision(firstPendingBreak.id, BreakStatus.Rejected)}
                disabled={isUpdatingBreak}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span>Decline</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 border border-outline-variant/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 text-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">done_all</span>
            </div>
            <div>
              <p className="font-semibold text-xs text-on-surface">No Pending Break or Swap Requests</p>
              <p className="text-[11px] text-on-surface-variant">
                All employee break queue requests and floor swaps have been reviewed.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
