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
import {
  FaCoffee,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaRedo,
} from 'react-icons/fa';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaCoffee className="text-cyan-400" /> Break Type Policies
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Define break categories, duration quotas, and maximum occurrences permitted per shift.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-colors shadow-lg shadow-cyan-900/30 self-start sm:self-auto"
        >
          <FaPlus className="text-xs" /> New Break Type
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
          <input
            type="text"
            placeholder="Search break types..."
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
          aria-label="Filter by break type active status"
          className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Break Types</option>
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
                <th className="px-6 py-4">Break Name</th>
                <th className="px-6 py-4">Max Duration</th>
                <th className="px-6 py-4">Max Occurrences / Shift</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading break types...
                  </td>
                </tr>
              ) : breakTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No break types defined yet.
                  </td>
                </tr>
              ) : (
                breakTypes.map((bt) => (
                  <tr key={bt.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {bt.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-cyan-300">
                      <span className="inline-flex items-center gap-1.5 font-mono">
                        <FaClock className="text-cyan-400 text-xs" />
                        {bt.maxDurationMinutes} minutes
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1.5 font-mono">
                        <FaRedo className="text-yellow-400/80 text-xs" />
                        {bt.maxOccurrencesPerShift} max per shift
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <IsActiveBadge isActive={bt.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(bt)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/60 transition-colors"
                        title="Edit Break Type"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setDeletingBreakType(bt)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors"
                        title="Delete Break Type"
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

      {/* Create BreakType Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Break Type"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Break Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lunch Break, Coffee Break"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Max Allowed Per Shift
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
                Create Break Type
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit BreakType Modal */}
      {editingBreakType && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBreakType(null)}
          title={`Edit Break Type: ${editingBreakType.name}`}
          size="md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Break Name
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                  Max Allowed Per Shift
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
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingBreakType(null)}
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

      {/* Delete BreakType Modal */}
      {deletingBreakType && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingBreakType(null)}
          title="Delete Break Type"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Are you sure you want to delete break type{' '}
              <span className="font-semibold text-white">{deletingBreakType.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBreakType(null)}
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
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
