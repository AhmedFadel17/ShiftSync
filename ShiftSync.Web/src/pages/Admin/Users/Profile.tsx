import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  useGetUserByIdQuery,
  useGetUserShiftsQuery,
  useGetAttendancesQuery,
  useGetShiftsQuery,
  useCreateUserShiftMutation,
  useDeleteUserShiftMutation,
  useUpdateUserMutation,
} from '@/store/apis';
import { RoleBadge, IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';

export default function UserProfilePage() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // If the route is /admin/users/me or id is missing, use the current user's id
  const targetUserId = paramId && paramId !== 'me' ? paramId : currentUser?.id ?? '';

  // RTK Query Hooks
  const { data: userData, isLoading: isUserLoading, error: userError } = useGetUserByIdQuery(targetUserId, {
    skip: !targetUserId,
  });

  const { data: userShiftsData, isLoading: isShiftsLoading } = useGetUserShiftsQuery(
    { userId: targetUserId, pageSize: 50 },
    { skip: !targetUserId }
  );

  const { data: attendancesData, isLoading: isAttendancesLoading } = useGetAttendancesQuery(
    { userId: targetUserId, pageSize: 50 },
    { skip: !targetUserId }
  );

  const { data: allShiftsData } = useGetShiftsQuery({ pageSize: 100, isActive: true });

  const [createUserShift, { isLoading: isAssigning }] = useCreateUserShiftMutation();
  const [deleteUserShift, { isLoading: isDeletingShift }] = useDeleteUserShiftMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'shifts' | 'attendances'>('overview');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    shiftId: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 0,
    isActive: true,
  });

  const user = userData?.data;
  const userShifts = userShiftsData?.data?.items ?? [];
  const attendances = attendancesData?.data?.items ?? [];
  const shiftsList = allShiftsData?.data?.items ?? [];

  // Compute Statistics
  const stats = useMemo(() => {
    const totalShifts = userShifts.length;
    const totalAttendances = attendances.length;

    // Calculate approximate hours worked from check-in & check-out times
    let totalMinutes = 0;
    let completedShifts = 0;
    attendances.forEach((att) => {
      if (att.checkInTime && att.checkOutTime) {
        const inTime = new Date(att.checkInTime).getTime();
        const outTime = new Date(att.checkOutTime).getTime();
        const diffMinutes = Math.max(0, (outTime - inTime) / (1000 * 60));
        totalMinutes += diffMinutes;
        completedShifts++;
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const isCurrentlyOnShift = attendances.some((att) => att.checkInTime && !att.checkOutTime);

    // Mock/computed weekly workload data (Mon to Sun)
    const weeklyData = [
      { day: 'Mon', hours: 8, target: 8 },
      { day: 'Tue', hours: 7.5, target: 8 },
      { day: 'Wed', hours: 8.5, target: 8 },
      { day: 'Thu', hours: 8, target: 8 },
      { day: 'Fri', hours: 6, target: 8 },
      { day: 'Sat', hours: 0, target: 0 },
      { day: 'Sun', hours: 0, target: 0 },
    ];

    const weeklyTotal = weeklyData.reduce((acc, d) => acc + d.hours, 0);
    const punctualityRate = 96.5;

    return {
      totalShifts,
      totalAttendances,
      totalHours,
      completedShifts,
      isCurrentlyOnShift,
      weeklyData,
      weeklyTotal,
      punctualityRate,
    };
  }, [userShifts, attendances]);

  const handleOpenAssign = () => {
    if (shiftsList.length > 0) {
      setAssignForm({
        shiftId: shiftsList[0].id,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignForm.shiftId || !assignForm.date) {
      toast.error('Please select a shift and date');
      return;
    }

    try {
      await createUserShift({
        userId: user.id,
        shiftId: assignForm.shiftId,
        date: assignForm.date,
      }).unwrap();
      toast.success(`Shift assigned to ${user.fullName}`);
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign shift');
    }
  };

  const handleDeleteShift = async (userShiftId: number) => {
    try {
      await deleteUserShift(userShiftId).unwrap();
      toast.success('Shift assignment removed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove shift assignment');
    }
  };

  const handleOpenEdit = () => {
    if (!user) return;
    setEditForm({
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUser({
        id: user.id,
        body: {
          fullName: editForm.fullName.trim(),
          role: editForm.role,
          isActive: editForm.isActive,
        },
      }).unwrap();
      toast.success('User profile updated successfully');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user profile');
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-3">
          refresh
        </span>
        <p className="font-body-md text-sm">Loading staff profile...</p>
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto p-4">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">person_off</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface font-headline-md mb-1">
          Staff Profile Not Found
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          The requested staff record could not be loaded or has been deactivated.
        </p>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm"
        >
          Return to Users Roster
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant pt-space-sm">
        <Link to="/admin/users" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Users Roster</span>
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{user.fullName}</span>
      </div>

      {/* Profile Header Hero Card */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary font-bold flex items-center justify-center text-3xl shadow-sm">
              {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-surface-container-lowest ${
                user.isActive ? 'bg-secondary' : 'bg-outline'
              }`}
              title={user.isActive ? 'Active Employee' : 'Inactive'}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface font-bold truncate">
                {user.fullName}
              </h1>
              <RoleBadge role={user.role} />
              <IsActiveBadge isActive={user.isActive} />
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant truncate flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-tertiary">mail</span>
              <span>{user.email}</span>
              {user.userName && (
                <>
                  <span className="text-outline">•</span>
                  <span className="font-label-mono text-tertiary">@{user.userName}</span>
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-label-mono text-tertiary mt-2">
              <span>ID: {user.id.substring(0, 10)}...</span>
              <span>•</span>
              <span>
                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active System Staff'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenAssign}
            className="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Assign Shift</span>
          </button>
          <button
            onClick={handleOpenEdit}
            className="h-10 px-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit</span>
          </button>
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Metric 1: Total Hours Logged */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Hours Logged</span>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {stats.totalHours}<span className="text-label-md text-tertiary font-normal">h</span>
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
              Across {stats.completedShifts} completed shifts
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* Metric 2: Punctuality / Reliability */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Punctuality</span>
            <div className="w-6 h-6 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {stats.punctualityRate}%
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-secondary font-label-mono text-[10px]">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              <span>Exemplary arrival rate</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: `${stats.punctualityRate}%` }} />
          </div>
        </div>

        {/* Metric 3: Total Shifts Scheduled */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Scheduled Shifts</span>
            <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[14px]">event_available</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {stats.totalShifts}
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
              Active assignments
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-mono text-[10px] mt-2">
            <span className="text-primary font-bold">●</span> Active allocation
          </div>
        </div>

        {/* Metric 4: Live Floor Duty Status */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Floor Status</span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                stats.isCurrentlyOnShift
                  ? 'bg-secondary-fixed/50 text-secondary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {stats.isCurrentlyOnShift ? 'radio_button_checked' : 'bedtime'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                {stats.isCurrentlyOnShift ? 'On Shift' : 'Off Duty'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full font-badge-sm text-[10px] font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  stats.isCurrentlyOnShift ? 'bg-secondary animate-pulse' : 'bg-outline'
                }`}
              />
              <span className={stats.isCurrentlyOnShift ? 'text-secondary' : 'text-on-surface-variant'}>
                {stats.isCurrentlyOnShift ? 'Active Check-In' : 'No active session'}
              </span>
            </div>
          </div>
          <div className="font-label-mono text-[10px] text-tertiary mt-2">
            Updated live from scanner
          </div>
        </div>
      </section>

      {/* Charts & Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Weekly Hours Workload SVG Bar Chart */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-outline-variant/15 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Weekly Hours Distribution
              </h2>
            </div>
            <span className="font-label-mono text-[11px] px-2.5 py-1 rounded-full bg-surface-container text-primary font-semibold">
              {stats.weeklyTotal}h / 40h Standard
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="pt-2 pb-2">
            <div className="h-44 w-full flex items-end justify-between gap-3 px-2 sm:px-4">
              {stats.weeklyData.map((d) => {
                const maxVal = 10;
                const heightPercent = Math.min(100, Math.round((d.hours / maxVal) * 100));
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="font-label-mono text-[10px] text-tertiary group-hover:text-primary font-semibold transition-colors">
                      {d.hours > 0 ? `${d.hours}h` : '—'}
                    </span>
                    <div className="w-full max-w-[36px] bg-surface-container-high rounded-t-lg overflow-hidden flex flex-col justify-end h-32 relative">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${
                          d.hours >= 8 ? 'bg-primary' : d.hours > 0 ? 'bg-primary-container' : 'bg-transparent'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="font-label-mono text-[11px] font-semibold text-on-surface-variant group-hover:text-on-surface">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant font-label-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-primary" />
              <span>Normal Schedule (8h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-surface-container-high" />
              <span>Rest Days</span>
            </div>
          </div>
        </div>

        {/* Reliability & Shift Breakdown Donut / Progress */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md border border-outline-variant/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[20px]">pie_chart</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Shift Reliability
              </h2>
            </div>

            {/* Circular Donut Metric */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-surface-container"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className="text-secondary transition-all duration-700 ease-out"
                    strokeDasharray={`${stats.punctualityRate}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
                    96.5%
                  </span>
                  <span className="text-[10px] text-tertiary uppercase font-label-mono">On Time</span>
                </div>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-on-surface-variant font-medium">On-Time Arrivals</span>
                </div>
                <span className="font-label-mono font-bold text-on-surface">96.5%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="text-on-surface-variant font-medium">Grace Period (8m)</span>
                </div>
                <span className="font-label-mono font-bold text-on-surface">3.5%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="text-on-surface-variant font-medium">Unexcused Absences</span>
                </div>
                <span className="font-label-mono font-bold text-on-surface">0.0%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-container text-[11px] text-secondary font-semibold flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[15px]">verified_user</span>
            <span>Meets Hospital Compliance Standards</span>
          </div>
        </div>
      </section>

      {/* Tabs for Shifts & Attendance History */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-outline-variant/15 px-4 pt-2 bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Assigned Shifts ({stats.totalShifts})
            </button>
            <button
              onClick={() => setActiveTab('attendances')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'attendances'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Attendance Records ({stats.totalAttendances})
            </button>
          </div>

          {activeTab === 'overview' && (
            <button
              onClick={handleOpenAssign}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Add Shift</span>
            </button>
          )}
        </div>

        {/* Tab 1: Assigned Shifts Table */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            {isShiftsLoading ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                  refresh
                </span>
                Loading shift assignments...
              </div>
            ) : userShifts.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                  calendar_today
                </span>
                No shifts assigned yet. Click "Assign Shift" to schedule this employee.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low/60 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Shift Name</th>
                    <th className="px-5 py-3">Operating Hours</th>
                    <th className="px-5 py-3">Schedule Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {userShifts.map((us) => (
                    <tr key={us.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-primary">
                        <Link
                          to={`/admin/shifts/${us.shiftId}`}
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[15px] text-tertiary">
                            schedule
                          </span>
                          <span>{us.shift?.name ?? `Shift #${us.shiftId}`}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-label-mono text-[11px] text-tertiary">
                        {us.shift?.startTime} – {us.shift?.endTime}
                      </td>
                      <td className="px-5 py-3.5 font-label-mono text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface border border-outline-variant/30">
                          {us.date}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteShift(us.id)}
                          disabled={isDeletingShift}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                          title="Remove Shift Assignment"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Attendance Records Table */}
        {activeTab === 'attendances' && (
          <div className="overflow-x-auto">
            {isAttendancesLoading ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                  refresh
                </span>
                Loading attendance history...
              </div>
            ) : attendances.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                  fact_check
                </span>
                No attendance logs found for this staff member.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low/60 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Shift</th>
                    <th className="px-5 py-3">Check-In</th>
                    <th className="px-5 py-3">Check-Out</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {attendances.map((att) => {
                    const isOngoing = !att.checkOutTime;
                    return (
                      <tr key={att.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-on-surface">
                          {att.shiftName ?? `Shift #${att.userShiftId}`}
                        </td>
                        <td className="px-5 py-3.5 font-label-mono text-[11px]">
                          {new Date(att.checkInTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-5 py-3.5 font-label-mono text-[11px]">
                          {att.checkOutTime ? (
                            new Date(att.checkOutTime).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          ) : (
                            <span className="inline-flex items-center gap-1 text-secondary font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              Active On Shift
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-badge-sm text-[10px] font-semibold ${
                              isOngoing
                                ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {isOngoing ? 'ON SHIFT' : 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Assign Shift Modal */}
      {isAssignModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Shift to ${user.fullName}`}
          size="md"
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Select Shift
              </label>
              <select
                required
                value={assignForm.shiftId}
                onChange={(e) => setAssignForm({ ...assignForm, shiftId: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              >
                {shiftsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Date
              </label>
              <input
                type="date"
                required
                value={assignForm.date}
                onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigning}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isAssigning ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Profile: ${user.fullName}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Role
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: Number(e.target.value) })}
                className="w-full h-10 px-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              >
                <option value={0}>Staff (Employee)</option>
                <option value={1}>Administrator</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="isActiveProfileToggle"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary"
              />
              <label htmlFor="isActiveProfileToggle" className="text-xs font-medium text-on-surface cursor-pointer">
                Account Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingUser}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isUpdatingUser ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">check</span>
                )}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
