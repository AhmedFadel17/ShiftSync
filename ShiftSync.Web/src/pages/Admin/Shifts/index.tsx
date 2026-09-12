import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Scheduling Rules
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Shift Management
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Configure working shifts, time windows, break limits, and minimum employee coverage rules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:opacity-90 self-start sm:self-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Shift</span>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search shifts by name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full h-10 pl-10 pr-4 bg-surface-container-low/60 text-on-surface rounded-xl shadow-xs placeholder:text-outline font-body-md text-xs border border-outline-variant/25 focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all"
          />
        </div>

        <select
          value={selectedActive === undefined ? '' : String(selectedActive)}
          onChange={(e) => {
            setSelectedActive(e.target.value === '' ? undefined : e.target.value === 'true');
            setPageNumber(1);
          }}
          aria-label="Filter by shift active status"
          className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <option value="">All Shifts</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low/70 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Shift Name</th>
                <th className="px-5 py-3.5">Operating Window</th>
                <th className="px-5 py-3.5">Max Break Allowed</th>
                <th className="px-5 py-3.5">Min Coverage Required</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                      refresh
                    </span>
                    Loading shifts...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      schedule
                    </span>
                    No shifts found.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-on-surface">
                      <Link
                        to={`/admin/shifts/${shift.id}`}
                        className="text-on-surface hover:text-primary transition-colors hover:underline flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          schedule
                        </span>
                        <span>{shift.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-label-mono text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-primary font-semibold">
                        {shift.startTime} – {shift.endTime}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-tertiary">
                          coffee
                        </span>
                        <span>{shift.maxAllowedBreaksDurationMinutes} min</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">
                          groups
                        </span>
                        <span>{shift.minActiveEmployeesRequired} active</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <IsActiveBadge isActive={shift.isActive} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <Link
                        to={`/admin/shifts/${shift.id}`}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center shadow-xs"
                        title="View Shift Details & Staff"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(shift)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Edit Shift"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingShift(shift)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Delete Shift"
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
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Shift Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Morning Shift A"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Start Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  End Time (HH:mm)
                </label>
                <input
                  type="time"
                  step="1"
                  required
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
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
                  value={createForm.maxAllowedBreaksDurationMinutes}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
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
                  value={createForm.minActiveEmployeesRequired}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
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
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isCreating ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">add</span>
                )}
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
                onClick={() => setEditingShift(null)}
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

      {/* Delete Confirmation Modal */}
      {deletingShift && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingShift(null)}
          title="Confirm Delete Shift"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete shift <span className="font-semibold text-on-surface">{deletingShift.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setDeletingShift(null)}
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
                Delete Shift
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
