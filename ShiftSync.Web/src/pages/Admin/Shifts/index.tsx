import React, { useState } from 'react';
import {
  useGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from '@/store/apis';
import { Shift, CreateShiftDto, UpdateShiftDto } from '@/types/shiftsync';
import { IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaUsers,
  FaCoffee,
} from 'react-icons/fa';

export default function ShiftsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState<boolean | undefined>(undefined);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateShiftDto>({
    name: '',
    startTime: '09:00:00',
    endTime: '17:00:00',
    maxAllowedBreaksDurationMinutes: 60,
    minActiveEmployeesRequired: 2,
  });

  // Edit Modal
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editForm, setEditForm] = useState<UpdateShiftDto>({
    name: '',
    startTime: '',
    endTime: '',
    maxAllowedBreaksDurationMinutes: 60,
    minActiveEmployeesRequired: 2,
  });

  // Delete Modal
  const [deletingShift, setDeletingShift] = useState<Shift | null>(null);

  // RTK Query
  const { data, isLoading, isFetching } = useGetShiftsQuery({
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
    isActive: selectedActive,
  });

  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation();
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation();
  const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();

  const shifts = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setEditForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      maxAllowedBreaksDurationMinutes: shift.maxAllowedBreaksDurationMinutes,
      minActiveEmployeesRequired: shift.minActiveEmployeesRequired,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure HH:mm:ss format
      const formattedStartTime = createForm.startTime.length === 5 ? `${createForm.startTime}:00` : createForm.startTime;
      const formattedEndTime = createForm.endTime.length === 5 ? `${createForm.endTime}:00` : createForm.endTime;

      await createShift({
        ...createForm,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      }).unwrap();
      toast.success(`Shift "${createForm.name}" created successfully`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        startTime: '09:00:00',
        endTime: '17:00:00',
        maxAllowedBreaksDurationMinutes: 60,
        minActiveEmployeesRequired: 2,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create shift');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;
    try {
      const formattedStartTime = editForm.startTime && editForm.startTime.length === 5
        ? `${editForm.startTime}:00`
        : editForm.startTime;
      const formattedEndTime = editForm.endTime && editForm.endTime.length === 5
        ? `${editForm.endTime}:00`
        : editForm.endTime;

      await updateShift({
        id: editingShift.id,
        body: {
          ...editForm,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
        },
      }).unwrap();
      toast.success(`Shift "${editingShift.name}" updated successfully`);
      setEditingShift(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update shift');
    }
  };

  const handleDelete = async () => {
    if (!deletingShift) return;
    try {
      await deleteShift(deletingShift.id).unwrap();
      toast.success(`Shift "${deletingShift.name}" deleted successfully`);
      setDeletingShift(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete shift');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaClock className="text-cyan-400" /> Shift Management
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Configure working shifts, time windows, break limits, and minimum employee coverage rules.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-900/30 self-start sm:self-auto"
        >
          <FaPlus className="text-xs" /> New Shift
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
          <input
            type="text"
            placeholder="Search shifts by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <select
          value={selectedActive === undefined ? '' : String(selectedActive)}
          onChange={(e) => {
            setSelectedActive(e.target.value === '' ? undefined : e.target.value === 'true');
            setPageNumber(1);
          }}
          aria-label="Filter by shift active status"
          className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Shifts</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/40 border-b border-white/10 font-semibold">
              <tr>
                <th className="px-6 py-4">Shift Name</th>
                <th className="px-6 py-4">Hours (Start - End)</th>
                <th className="px-6 py-4">Max Break Time</th>
                <th className="px-6 py-4">Min Staff Coverage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading shifts...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No shifts found.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {shift.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-cyan-300">
                      {shift.startTime} – {shift.endTime}
                    </td>
                    <td className="px-6 py-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <FaCoffee className="text-yellow-400/70" />
                        {shift.maxAllowedBreaksDurationMinutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <FaUsers className="text-cyan-400/70" />
                        {shift.minActiveEmployeesRequired} active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <IsActiveBadge isActive={shift.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/60 transition-colors"
                        title="Edit Shift"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setDeletingShift(shift)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors"
                        title="Delete Shift"
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

      {/* Create Shift Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Shift"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Shift Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Shift A"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  End Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Max Break (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={createForm.maxAllowedBreaksDurationMinutes}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      maxAllowedBreaksDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Min Active Staff
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={createForm.minActiveEmployeesRequired}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      minActiveEmployeesRequired: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                Create Shift
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Shift Modal */}
      {editingShift && (
        <Modal
          isOpen={true}
          onClose={() => setEditingShift(null)}
          title={`Edit Shift: ${editingShift.name}`}
          size="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Shift Name
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  End Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Min Active Staff
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingShift(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <FaSpinner className="animate-spin text-xs" /> : <FaCheckCircle className="text-xs" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Shift Modal */}
      {deletingShift && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingShift(null)}
          title="Delete Shift"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Are you sure you want to delete shift <span className="font-semibold text-white">{deletingShift.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingShift(null)}
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
                Delete Shift
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
