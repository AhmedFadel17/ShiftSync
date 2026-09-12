import React, { useState } from 'react';
import {
  useGetUserShiftsQuery,
  useCreateUserShiftMutation,
  useDeleteUserShiftMutation,
  useGetUsersQuery,
  useGetShiftsQuery,
} from '@/store/apis';
import { UserShift, CreateUserShiftDto } from '@/types/shiftsync';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';

export default function UserShiftsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedShiftId, setSelectedShiftId] = useState<number | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<CreateUserShiftDto>({
    userId: '',
    shiftId: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Delete Modal
  const [deletingAssignment, setDeletingAssignment] = useState<UserShift | null>(null);

  // RTK Queries
  const { data, isLoading, isFetching } = useGetUserShiftsQuery({
    pageNumber,
    pageSize,
    userId: selectedUserId || undefined,
    shiftId: selectedShiftId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: usersData } = useGetUsersQuery({ pageNumber: 1, pageSize: 100, isActive: true });
  const { data: shiftsData } = useGetShiftsQuery({ pageNumber: 1, pageSize: 100, isActive: true });

  const [createUserShift, { isLoading: isAssigning }] = useCreateUserShiftMutation();
  const [deleteUserShift, { isLoading: isDeleting }] = useDeleteUserShiftMutation();

  const userShifts = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const usersList = usersData?.data?.items ?? [];
  const shiftsList = shiftsData?.data?.items ?? [];

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.shiftId || !assignForm.date) {
      toast.error('Please select an employee, a shift, and a valid date');
      return;
    }

    try {
      await createUserShift(assignForm).unwrap();
      toast.success('Shift successfully assigned to employee');
      setIsAssignOpen(false);
      setAssignForm({
        userId: '',
        shiftId: shiftsList[0]?.id || 0,
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign shift');
    }
  };

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    try {
      await deleteUserShift(deletingAssignment.id).unwrap();
      toast.success('Shift assignment removed');
      setDeletingAssignment(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove shift assignment');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">event_available</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Roster Assignments
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Shift Assignments
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Schedule employees to designated shifts by date and track work allocations.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsAssignOpen(true);
            if (shiftsList.length > 0 && !assignForm.shiftId) {
              setAssignForm((prev) => ({ ...prev, shiftId: shiftsList[0].id }));
            }
          }}
          className="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:opacity-90 self-start sm:self-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Assign Shift</span>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPageNumber(1);
            }}
            aria-label="Filter by employee"
            className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Employees</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} (@{u.userName})
              </option>
            ))}
          </select>

          <select
            value={selectedShiftId === undefined ? '' : selectedShiftId}
            onChange={(e) => {
              setSelectedShiftId(e.target.value === '' ? undefined : Number(e.target.value));
              setPageNumber(1);
            }}
            aria-label="Filter by shift"
            className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Shifts</option>
            {shiftsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime} - {s.endTime})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-label-mono text-[11px] text-tertiary">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPageNumber(1);
              }}
              aria-label="Filter from date"
              className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-2.5 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-label-mono text-[11px] text-tertiary">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPageNumber(1);
              }}
              aria-label="Filter to date"
              className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-2.5 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low/70 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Assigned Shift</th>
                <th className="px-5 py-3.5">Shift Window</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                      refresh
                    </span>
                    Loading shift assignments...
                  </td>
                </tr>
              ) : userShifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      event_busy
                    </span>
                    No assignments found for the selected criteria.
                  </td>
                </tr>
              ) : (
                userShifts.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary-container/50 border border-secondary/20 text-on-secondary-container font-bold flex items-center justify-center text-xs shrink-0">
                          {assignment.user?.fullName?.charAt(0)?.toUpperCase() ?? 'E'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-on-surface truncate">
                            {assignment.user?.fullName ?? assignment.userId}
                          </div>
                          {assignment.user?.email && (
                            <div className="text-[11px] text-on-surface-variant truncate">
                              {assignment.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-primary">
                        {assignment.shift?.name ?? `Shift #${assignment.shiftId}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px] text-tertiary">
                      {assignment.shift?.startTime} – {assignment.shift?.endTime}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface font-label-mono text-[11px] border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[13px] text-primary">
                          calendar_today
                        </span>
                        {assignment.date}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeletingAssignment(assignment)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Remove Assignment"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-outline-variant/15 flex justify-center bg-surface-container-lowest">
            <Pagination
              page={pageNumber}
              pageSize={pageSize}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={(p) => setPageNumber(p)}
              pageSizeOption={{
                values: [10, 20, 50],
                onChange: (s) => {
                  setPageSize(s);
                  setPageNumber(1);
                },
              }}
            />
          </div>
        )}
      </section>

      {/* Assign Modal */}
      {isAssignOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAssignOpen(false)}
          title="Assign Shift to Employee"
          size="md"
        >
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Select Employee
              </label>
              <select
                required
                value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                className="w-full h-10 px-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              >
                <option value="">Select an employee...</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

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
                <option value={0}>Select a shift...</option>
                {shiftsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Assignment Date
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
                onClick={() => setIsAssignOpen(false)}
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

      {/* Delete Confirmation Modal */}
      {deletingAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingAssignment(null)}
          title="Remove Shift Assignment"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to remove the shift assignment for{' '}
              <span className="font-semibold text-on-surface">
                {deletingAssignment.user?.fullName ?? deletingAssignment.userId}
              </span>{' '}
              on <span className="font-semibold text-on-surface">{deletingAssignment.date}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setDeletingAssignment(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                Remove
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
