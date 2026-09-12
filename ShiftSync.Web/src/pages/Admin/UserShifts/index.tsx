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
import {
  FaCalendarAlt,
  FaPlus,
  FaTrash,
  FaClock,
  FaUser,
  FaSpinner,
  FaCheckCircle,
  FaFilter,
} from 'react-icons/fa';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-cyan-400" /> Shift Assignments
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Schedule employees to designated shifts by date and track work allocations.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAssignOpen(true);
            if (shiftsList.length > 0 && !assignForm.shiftId) {
              setAssignForm((prev) => ({ ...prev, shiftId: shiftsList[0].id }));
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-900/30 self-start sm:self-auto"
        >
          <FaPlus className="text-xs" /> Assign Shift
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-white/40 text-xs" />
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPageNumber(1);
              }}
              aria-label="Filter by employee"
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Employees</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} (@{u.userName})
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedShiftId === undefined ? '' : selectedShiftId}
            onChange={(e) => {
              setSelectedShiftId(e.target.value === '' ? undefined : Number(e.target.value));
              setPageNumber(1);
            }}
            aria-label="Filter by shift"
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Shifts</option>
            {shiftsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime} - {s.endTime})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPageNumber(1);
              }}
              aria-label="Filter from date"
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPageNumber(1);
              }}
              aria-label="Filter to date"
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/40 border-b border-white/10 font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Assigned Shift</th>
                <th className="px-6 py-4">Shift Hours</th>
                <th className="px-6 py-4">Schedule Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading shift assignments...
                  </td>
                </tr>
              ) : userShifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No assignments found for the selected criteria.
                  </td>
                </tr>
              ) : (
                userShifts.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {assignment.user?.fullName ?? assignment.userId}
                      </div>
                      {assignment.user?.email && (
                        <div className="text-xs text-white/40">{assignment.user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-cyan-300">
                        {assignment.shift?.name ?? `Shift #${assignment.shiftId}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/70">
                      {assignment.shift?.startTime} – {assignment.shift?.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-white/80 font-mono text-xs border border-white/10">
                        <FaCalendarAlt className="text-cyan-400 text-[10px]" />
                        {assignment.date}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeletingAssignment(assignment)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors"
                        title="Remove Assignment"
                      >
                        <FaTrash className="text-xs" />
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
          <div className="p-4 border-t border-white/10 flex justify-center">
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
      </div>

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
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Select Employee
              </label>
              <select
                required
                value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
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
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Select Shift
              </label>
              <select
                required
                value={assignForm.shiftId}
                onChange={(e) => setAssignForm({ ...assignForm, shiftId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
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
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={assignForm.date}
                onChange={(e) => setAssignForm({ ...assignForm, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAssigning}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isAssigning ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {deletingAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingAssignment(null)}
          title="Remove Shift Assignment"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Are you sure you want to remove this shift assignment for{' '}
              <span className="font-semibold text-white">
                {deletingAssignment.user?.fullName ?? deletingAssignment.userId}
              </span>{' '}
              on <span className="font-mono text-cyan-300">{deletingAssignment.date}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAssignment(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <FaSpinner className="animate-spin text-xs" /> : <FaTrash className="text-xs" />}
                Remove Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
