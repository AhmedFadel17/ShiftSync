import React, { useState } from 'react';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '@/store/apis';
import { User, UserRole, UpdateUserDto } from '@/types/shiftsync';
import { RoleBadge, IsActiveBadge } from '@/components/ui/Badges/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaUsers,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';

export default function UsersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(undefined);
  const [selectedActive, setSelectedActive] = useState<boolean | undefined>(undefined);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.User);
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete Modal State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // RTK Query hooks
  const { data, isLoading, isFetching } = useGetUsersQuery({
    pageNumber,
    pageSize,
    search: searchTerm || undefined,
    role: selectedRole,
    isActive: selectedActive,
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const body: UpdateUserDto = {
        fullName: editFullName.trim(),
        role: editRole,
        isActive: editIsActive,
      };
      await updateUser({ id: editingUser.id, body }).unwrap();
      toast.success(`User ${editingUser.fullName} updated successfully`);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id).unwrap();
      toast.success(`User ${deletingUser.fullName} deleted successfully`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaUsers className="text-cyan-400" /> User Management
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Manage system users, assign administrator privileges, and control account statuses.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 self-start sm:self-auto">
          Total Users: <span className="text-cyan-400 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-white/40 text-xs" />
            <select
              value={selectedRole === undefined ? '' : selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value === '' ? undefined : Number(e.target.value) as UserRole);
                setPageNumber(1);
              }}
              aria-label="Filter by role"
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Roles</option>
              <option value={UserRole.Admin}>Admin</option>
              <option value={UserRole.User}>User (Employee)</option>
            </select>
          </div>

          <select
            value={selectedActive === undefined ? '' : String(selectedActive)}
            onChange={(e) => {
              setSelectedActive(e.target.value === '' ? undefined : e.target.value === 'true');
              setPageNumber(1);
            }}
            aria-label="Filter by active status"
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/40 border-b border-white/10 font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{user.fullName}</div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/70">
                      @{user.userName}
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <IsActiveBadge isActive={user.isActive} />
                    </td>
                    <td className="px-6 py-4 text-xs text-white/40">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/60 transition-colors"
                        title="Edit User"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/60 transition-colors"
                        title="Delete User"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-center">
            <Pagination
              page={pageNumber}
              pageSize={pageSize}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={(newPage) => setPageNumber(newPage)}
              pageSizeOption={{
                values: [10, 20, 50],
                onChange: (size) => {
                  setPageSize(size);
                  setPageNumber(1);
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.fullName}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(Number(e.target.value) as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={UserRole.User}>User (Employee)</option>
                <option value={UserRole.Admin}>Admin (Full Access)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isActiveToggle"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-white/20"
              />
              <label htmlFor="isActiveToggle" className="text-sm font-medium text-white/80 cursor-pointer">
                Account Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          title="Confirm Delete User"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Are you sure you want to delete <span className="font-semibold text-white">{deletingUser.fullName}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
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
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
