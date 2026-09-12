import React, { useState } from 'react';
import {
  useGetBreakTypesQuery,
  useCreateBreakTypeMutation,
  useUpdateBreakTypeMutation,
  useDeleteBreakTypeMutation,
} from '@/store/apis';
import { BreakType, CreateBreakTypeDto, UpdateBreakTypeDto } from '@/types/shiftsync';
import { IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';

export default function BreakTypesPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActive, setSelectedActive] = useState<boolean | undefined>(undefined);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateBreakTypeDto>({
    name: '',
    maxDurationMinutes: 15,
    maxOccurrencesPerShift: 2,
  });

  // Edit Modal
  const [editingBreakType, setEditingBreakType] = useState<BreakType | null>(null);
  const [editForm, setEditForm] = useState<UpdateBreakTypeDto>({
    name: '',
    maxDurationMinutes: 15,
    maxOccurrencesPerShift: 2,
  });

  // Delete Modal
  const [deletingBreakType, setDeletingBreakType] = useState<BreakType | null>(null);

  // RTK Query
  const { data, isLoading, isFetching } = useGetBreakTypesQuery({
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
    isActive: selectedActive,
  });

  const [createBreakType, { isLoading: isCreating }] = useCreateBreakTypeMutation();
  const [updateBreakType, { isLoading: isUpdating }] = useUpdateBreakTypeMutation();
  const [deleteBreakType, { isLoading: isDeleting }] = useDeleteBreakTypeMutation();

  const breakTypes = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleOpenEdit = (bt: BreakType) => {
    setEditingBreakType(bt);
    setEditForm({
      name: bt.name,
      maxDurationMinutes: bt.maxDurationMinutes,
      maxOccurrencesPerShift: bt.maxOccurrencesPerShift,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBreakType(createForm).unwrap();
      toast.success(`Break type "${createForm.name}" created successfully`);
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        maxDurationMinutes: 15,
        maxOccurrencesPerShift: 2,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create break type');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBreakType) return;
    try {
      await updateBreakType({
        id: editingBreakType.id,
        body: editForm,
      }).unwrap();
      toast.success(`Break type "${editingBreakType.name}" updated successfully`);
      setEditingBreakType(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update break type');
    }
  };

  const handleDelete = async () => {
    if (!deletingBreakType) return;
    try {
      await deleteBreakType(deletingBreakType.id).unwrap();
      toast.success(`Break type "${deletingBreakType.name}" deleted successfully`);
      setDeletingBreakType(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete break type');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">coffee</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Policy & Compliance
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Break Type Policies
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Define break categories, duration quotas, and maximum occurrences permitted per shift.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all hover:opacity-90 self-start sm:self-auto"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Break Type</span>
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
            placeholder="Search break types..."
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
          aria-label="Filter by break type active status"
          className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <option value="">All Break Types</option>
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
                <th className="px-5 py-3.5">Break Policy Name</th>
                <th className="px-5 py-3.5">Max Duration</th>
                <th className="px-5 py-3.5">Max Occurrences / Shift</th>
                <th className="px-5 py-3.5">Status</th>
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
                    Loading break policies...
                  </td>
                </tr>
              ) : breakTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      free_cancellation
                    </span>
                    No break types defined yet.
                  </td>
                </tr>
              ) : (
                breakTypes.map((bt) => (
                  <tr key={bt.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-on-surface">
                      {bt.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 font-label-mono text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-tertiary font-semibold">
                        <span className="material-symbols-outlined text-[13px] text-tertiary">
                          timer
                        </span>
                        {bt.maxDurationMinutes} min
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          repeat
                        </span>
                        <span>{bt.maxOccurrencesPerShift} allowed</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <IsActiveBadge isActive={bt.isActive} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(bt)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Edit Break Type"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingBreakType(bt)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Delete Break Type"
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

      {/* Create Break Type Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Break Type"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Break Policy Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lunch Break, Coffee Break"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Max Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={createForm.maxDurationMinutes}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      maxDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Max Per Shift
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={createForm.maxOccurrencesPerShift}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      maxOccurrencesPerShift: Number(e.target.value),
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
                Create Break Policy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Break Type Modal */}
      {editingBreakType && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBreakType(null)}
          title={`Edit Break Type: ${editingBreakType.name}`}
          size="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Break Policy Name
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
                  Max Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.maxDurationMinutes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                  Max Per Shift
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.maxOccurrencesPerShift}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxOccurrencesPerShift: Number(e.target.value),
                    })
                  }
                  className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setEditingBreakType(null)}
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
      {deletingBreakType && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingBreakType(null)}
          title="Confirm Delete Break Type"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete break policy <span className="font-semibold text-on-surface">{deletingBreakType.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setDeletingBreakType(null)}
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
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
