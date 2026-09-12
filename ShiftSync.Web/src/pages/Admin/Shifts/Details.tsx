import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetShiftByIdQuery,
  useGetUserShiftsQuery,
  useGetUsersQuery,
  useCreateUserShiftMutation,
  useDeleteUserShiftMutation,
  useUpdateShiftMutation,
} from '@/store/apis';
import { IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';

export default function ShiftDetailsPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shiftId = Number(paramId);

  // RTK Queries
  const { data: shiftData, isLoading: isShiftLoading, error: shiftError } = useGetShiftByIdQuery(shiftId, {
    skip: !shiftId || isNaN(shiftId),
  });

  const { data: userShiftsData, isLoading: isUserShiftsLoading } = useGetUserShiftsQuery(
    { shiftId, pageSize: 100 },
    { skip: !shiftId || isNaN(shiftId) }
  );

  const { data: usersData } = useGetUsersQuery({ pageSize: 100, isActive: true });

  const [createUserShift, { isLoading: isAssigning }] = useCreateUserShiftMutation();
  const [deleteUserShift, { isLoading: isDeleting }] = useDeleteUserShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Inline Assignment Form State
  const [inlineUserId, setInlineUserId] = useState('');
  const [inlineDate, setInlineDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Shift Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    startTime: '',
    endTime: '',
    maxAllowedBreaksDurationMinutes: 60,
    minActiveEmployeesRequired: 2,
  });

  const shift = shiftData?.data;
  const userShifts = userShiftsData?.data?.items ?? [];
  const usersList = usersData?.data?.items ?? [];

  // Derived Metrics & Coverage Calculations
  const coverageMetrics = useMemo(() => {
    if (!shift) return { assignedCount: 0, uniqueStaff: 0, isCompliant: false, capacityRate: 0 };

    const assignedCount = userShifts.length;
    const uniqueStaffIds = new Set(userShifts.map((us) => us.userId));
    const uniqueStaff = uniqueStaffIds.size;

    const minRequired = shift.minActiveEmployeesRequired || 1;
    const isCompliant = uniqueStaff >= minRequired;
    const capacityRate = Math.min(100, Math.round((uniqueStaff / minRequired) * 100));

    return {
      assignedCount,
      uniqueStaff,
      minRequired,
      isCompliant,
      capacityRate,
    };
  }, [shift, userShifts]);

  // Filtered Roster for this shift
  const filteredUserShifts = userShifts.filter((us) => {
    const employeeName = us.user?.fullName?.toLowerCase() ?? '';
    const employeeEmail = us.user?.email?.toLowerCase() ?? '';
    const matchesSearch =
      searchTerm.trim() === '' ||
      employeeName.includes(searchTerm.toLowerCase()) ||
      employeeEmail.includes(searchTerm.toLowerCase());

    const matchesDate = filterDate.trim() === '' || us.date === filterDate;
    return matchesSearch && matchesDate;
  });

  const handleInlineAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftId || !inlineUserId || !inlineDate) {
      toast.error('Please select an employee and date');
      return;
    }

    try {
      await createUserShift({
        userId: inlineUserId,
        shiftId,
        date: inlineDate,
      }).unwrap();
      toast.success('Staff member successfully scheduled for this shift');
      setInlineUserId('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign staff to shift');
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await deleteUserShift(assignmentId).unwrap();
      toast.success('Shift assignment removed');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove assignment');
    }
  };

  const handleOpenEdit = () => {
    if (!shift) return;
    setEditForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      maxAllowedBreaksDurationMinutes: shift.maxAllowedBreaksDurationMinutes,
      minActiveEmployeesRequired: shift.minActiveEmployeesRequired,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) return;

    try {
      const formattedStartTime =
        editForm.startTime && editForm.startTime.length === 5 ? `${editForm.startTime}:00` : editForm.startTime;
      const formattedEndTime =
        editForm.endTime && editForm.endTime.length === 5 ? `${editForm.endTime}:00` : editForm.endTime;

      await updateShift({
        id: shift.id,
        body: {
          ...editForm,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        },
      }).unwrap();
      toast.success(`Shift "${editForm.name}" updated successfully`);
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update shift');
    }
  };

  if (isShiftLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary mb-3">
          refresh
        </span>
        <p className="font-body-md text-sm">Loading shift specifications and roster...</p>
      </div>
    );
  }

  if (shiftError || !shift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto p-4">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">event_busy</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface font-headline-md mb-1">
          Shift Record Not Found
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          The requested shift does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/admin/shifts')}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-sm"
        >
          Return to Shift Management
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant pt-space-sm">
        <Link to="/admin/shifts" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Shift Rules</span>
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{shift.name}</span>
      </div>

      {/* Hero Shift Summary Card */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-3xl">schedule</span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface font-bold truncate">
                {shift.name}
              </h1>
              <IsActiveBadge isActive={shift.isActive} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
              <span className="font-label-mono px-2.5 py-0.5 rounded-md bg-surface-container text-primary font-bold">
                {shift.startTime} – {shift.endTime}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-tertiary">coffee</span>
                <span>Max Break: {shift.maxAllowedBreaksDurationMinutes} min</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">groups</span>
                <span>Min Coverage: {shift.minActiveEmployeesRequired} required</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenEdit}
            className="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Edit Shift Rules</span>
          </button>
        </div>
      </section>

      {/* Coverage & Health Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Metric 1: Coverage Health */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Staffing Status</span>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                coverageMetrics.isCompliant
                  ? 'bg-secondary-fixed/50 text-secondary'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {coverageMetrics.isCompliant ? 'check_circle' : 'warning'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                {coverageMetrics.uniqueStaff}
              </span>
              <span className="text-xs text-on-surface-variant">
                / {coverageMetrics.minRequired} min
              </span>
            </div>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full font-badge-sm text-[9px] font-bold ${
                coverageMetrics.isCompliant
                  ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                  : 'bg-error-container text-on-error-container'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  coverageMetrics.isCompliant ? 'bg-secondary' : 'bg-error animate-pulse'
                }`}
              />
              <span>{coverageMetrics.isCompliant ? 'Fully Compliant' : 'Needs Reinforcement'}</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                coverageMetrics.isCompliant ? 'bg-secondary' : 'bg-error'
              }`}
              style={{ width: `${coverageMetrics.capacityRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Assigned Shifts */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Allocations</span>
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {coverageMetrics.assignedCount}
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
              Scheduled calendar entries
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-mono text-[10px] mt-2">
            <span className="text-primary font-bold">●</span> Active across calendar
          </div>
        </div>

        {/* Metric 3: Max Break Quota */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Max Break Quota</span>
            <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[14px]">coffee</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              {shift.maxAllowedBreaksDurationMinutes}
              <span className="text-label-md text-tertiary font-normal">m</span>
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
              Cumulative per employee
            </div>
          </div>
          <div className="font-label-mono text-[10px] text-tertiary mt-2">
            Strict policy enforced
          </div>
        </div>

        {/* Metric 4: Floor Roster Tier */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant">Tier Category</span>
            <div className="w-6 h-6 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[14px]">timelapse</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
              Primary Shift
            </div>
            <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
              Standard operating window
            </div>
          </div>
          <div className="font-label-mono text-[10px] text-secondary font-bold mt-2">
            Emergency Floor Ready
          </div>
        </div>
      </section>

      {/* INLINE ASSIGNMENT PANEL - Assign Staff Directly on this Page */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Schedule Staff to this Shift
            </h2>
            <p className="text-xs text-on-surface-variant">
              Assign an employee directly to "{shift.name}" on a specific calendar date.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleInlineAssign}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1"
        >
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-md">
              Choose Employee
            </label>
            <select
              required
              value={inlineUserId}
              onChange={(e) => setInlineUserId(e.target.value)}
              className="w-full h-10 px-3 bg-surface-container-low/60 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
            >
              <option value="">Select staff member to assign...</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1 font-label-md">
              Schedule Date
            </label>
            <input
              type="date"
              required
              value={inlineDate}
              onChange={(e) => setInlineDate(e.target.value)}
              className="w-full h-10 px-3.5 bg-surface-container-low/60 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isAssigning || !inlineUserId}
              className="w-full h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isAssigning ? (
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-sm">add</span>
              )}
              <span>Assign Now</span>
            </button>
          </div>
        </form>
      </section>

      {/* ALL EMPLOYEES SCHEDULED FOR THIS SHIFT */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar Header */}
        <div className="p-space-md border-b border-outline-variant/15 flex flex-wrap gap-3 items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Scheduled Staff ({userShifts.length})
            </h3>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Filter staff by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-surface-container-lowest text-on-surface rounded-lg shadow-xs placeholder:text-outline font-body-md text-xs border border-outline-variant/25 focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="font-label-mono text-[11px] text-tertiary">Date:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="h-9 px-2 bg-surface-container-lowest border border-outline-variant/25 rounded-lg text-xs text-on-surface focus:outline-none shadow-xs"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-primary font-semibold hover:underline ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          {isUserShiftsLoading ? (
            <div className="p-8 text-center text-on-surface-variant text-xs">
              <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                refresh
              </span>
              Loading assigned staff roster...
            </div>
          ) : filteredUserShifts.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                person_search
              </span>
              No employees match the selected criteria for this shift. Use the form above to schedule staff.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-surface-container-low/70 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Scheduled Date</th>
                  <th className="px-5 py-3">Shift Hours</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredUserShifts.map((us) => (
                  <tr key={us.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {us.user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <Link
                            to={`/admin/users/${us.userId}`}
                            className="font-semibold text-on-surface hover:text-primary transition-colors hover:underline block"
                          >
                            {us.user?.fullName ?? us.userId}
                          </Link>
                          {us.user?.userName && (
                            <span className="text-[10px] text-tertiary font-label-mono">
                              @{us.user.userName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px] text-on-surface-variant">
                      {us.user?.email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-label-mono text-[11px] px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[13px] text-primary">
                          calendar_today
                        </span>
                        {us.date}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px] text-tertiary">
                      {shift.startTime} – {shift.endTime}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleRemoveAssignment(us.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Remove Employee from Shift"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Edit Shift Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Shift: ${shift.name}`}
          size="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Shift Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Start Time
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  End Time
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Max Break (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editForm.maxAllowedBreaksDurationMinutes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxAllowedBreaksDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Min Staff Required
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editForm.minActiveEmployeesRequired}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      minActiveEmployeesRequired: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
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
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isUpdating ? (
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
