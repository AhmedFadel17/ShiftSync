import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function UsersPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(UserRole.User);
  const [selectedActive, setSelectedActive] = useState<boolean | undefined>(true);

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
      toast.success(`User ${deletingUser.fullName} removed successfully`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Workforce Roster
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              User Management
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Manage workforce profiles, administrative permissions, and active statuses.
            </p>
          </div>
        </div>

        <div className="font-label-mono text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
          <span className="text-tertiary">Total Registered:</span>
          <span className="text-primary font-bold">{totalCount}</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
            className="w-full h-10 pl-10 pr-4 bg-surface-container-low/60 text-on-surface rounded-xl shadow-xs placeholder:text-outline font-body-md text-xs border border-outline-variant/25 focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <select
              value={selectedRole === undefined ? '' : selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value === '' ? undefined : Number(e.target.value) as UserRole);
                setPageNumber(1);
              }}
              aria-label="Filter by role"
              className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
            >
              <option value="">All Roles</option>
              <option value={UserRole.Admin}>Admin</option>
              <option value={UserRole.User}>Staff (Employee)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={selectedActive === undefined ? '' : String(selectedActive)}
              onChange={(e) => {
                setSelectedActive(e.target.value === '' ? undefined : e.target.value === 'true');
                setPageNumber(1);
              }}
              aria-label="Filter by active status"
              className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low/70 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
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
                    Loading staff roster...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      person_search
                    </span>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {u.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
                            {u.fullName}
                          </div>
                          <div className="text-[11px] text-on-surface-variant leading-tight truncate">
                            {u.email}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5">
                      <IsActiveBadge isActive={u.isActive} />
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px] text-tertiary">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center shadow-xs"
                        title="View Profile & Stats"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_circle</span>
                      </Link>

                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-lg bg-surface-container-low hover:bg-error-container text-on-surface-variant hover:text-error transition-colors inline-flex items-center justify-center shadow-xs"
                        title="Delete User"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-outline-variant/15 flex justify-center bg-surface-container-lowest">
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
      </section>

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
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(Number(e.target.value) as UserRole)}
                className="w-full h-10 px-3 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              >
                <option value={UserRole.User}>User (Staff)</option>
                <option value={UserRole.Admin}>Admin (Full Access)</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="isActiveToggle"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary"
              />
              <label htmlFor="isActiveToggle" className="text-xs font-medium text-on-surface cursor-pointer">
                Account Active
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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
      {deletingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          title="Confirm User Removal"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to deactivate or remove <span className="font-semibold text-on-surface">{deletingUser.fullName}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
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
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
