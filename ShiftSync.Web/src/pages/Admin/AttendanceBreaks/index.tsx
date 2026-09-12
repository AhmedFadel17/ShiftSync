import React, { useState } from 'react';
import {
  useGetAttendanceBreaksQuery,
  useUpdateBreakStatusMutation,
  useGetBreakTypesQuery,
} from '@/store/apis';
import { AttendanceBreak, BreakStatus, UpdateBreakStatusDto } from '@/types/shiftsync';
import { BreakStatusBadge } from '@/components/ui/Badges/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import { toast } from 'sonner';

export default function AttendanceBreaksPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<BreakStatus | undefined>(undefined);
  const [selectedBreakTypeId, setSelectedBreakTypeId] = useState<number | undefined>(undefined);

  // Status Change Modal
  const [actionItem, setActionItem] = useState<{
    breakItem: AttendanceBreak;
    targetStatus: BreakStatus;
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  // RTK Query
  const { data, isLoading, isFetching } = useGetAttendanceBreaksQuery({
    pageNumber,
    pageSize,
    status: selectedStatus,
    breakTypeId: selectedBreakTypeId,
  });

  const { data: breakTypesData } = useGetBreakTypesQuery({ pageNumber: 1, pageSize: 100 });
  const [updateBreakStatus, { isLoading: isUpdating }] = useUpdateBreakStatusMutation();

  const breaks = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const breakTypesList = breakTypesData?.data?.items ?? [];

  const handleOpenAction = (item: AttendanceBreak, targetStatus: BreakStatus) => {
    setActionItem({ breakItem: item, targetStatus });
    setAdminNote(item.note || '');
  };

  const handleConfirmStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionItem) return;

    try {
      const body: UpdateBreakStatusDto = {
        status: actionItem.targetStatus,
        note: adminNote.trim() || undefined,
      };
      await updateBreakStatus({
        id: actionItem.breakItem.id,
        body,
      }).unwrap();

      const actionWord =
        actionItem.targetStatus === BreakStatus.Approved
          ? 'approved'
          : actionItem.targetStatus === BreakStatus.Rejected
          ? 'declined'
          : 'updated';
      toast.success(`Break request ${actionWord} successfully`);
      setActionItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update break status');
    }
  };

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Break Approvals & Swap Queue
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Break Requests & Queue
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Review live employee break queues, enforce minimum coverage constraints, and authorize requests.
            </p>
          </div>
        </div>

        <div className="font-label-mono text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
          <span className="text-tertiary">Total Requests:</span>
          <span className="text-primary font-bold">{totalCount}</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedStatus === undefined ? '' : selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value === '' ? undefined : Number(e.target.value) as BreakStatus);
              setPageNumber(1);
            }}
            aria-label="Filter by break status"
            className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Statuses</option>
            <option value={BreakStatus.WaitingQueue}>Waiting Queue (Pending)</option>
            <option value={BreakStatus.Approved}>Approved</option>
            <option value={BreakStatus.Rejected}>Rejected</option>
            <option value={BreakStatus.Completed}>Completed</option>
          </select>

          <select
            value={selectedBreakTypeId === undefined ? '' : selectedBreakTypeId}
            onChange={(e) => {
              setSelectedBreakTypeId(e.target.value === '' ? undefined : Number(e.target.value));
              setPageNumber(1);
            }}
            aria-label="Filter by break policy type"
            className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Break Types</option>
            {breakTypesList.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name} ({bt.maxDurationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Shortcut Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedStatus(BreakStatus.WaitingQueue);
              setPageNumber(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === BreakStatus.WaitingQueue
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Pending Queue
          </button>
          <button
            onClick={() => {
              setSelectedStatus(undefined);
              setPageNumber(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedStatus === undefined
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            View All
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low/70 text-on-surface-variant font-label-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/15 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Break Policy</th>
                <th className="px-5 py-3.5">Requested At</th>
                <th className="px-5 py-3.5">Time Interval</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Notes</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                      refresh
                    </span>
                    Loading break records...
                  </td>
                </tr>
              ) : breaks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      inbox
                    </span>
                    No break requests found for the selected filter.
                  </td>
                </tr>
              ) : (
                breaks.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {b.userFullName?.charAt(0)?.toUpperCase() ?? 'S'}
                        </div>
                        <div className="font-semibold text-on-surface">
                          {b.userFullName ?? `Attendance #${b.attendanceId}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-on-surface font-medium">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">
                          coffee
                        </span>
                        {b.breakTypeName ?? `Type #${b.breakTypeId}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px] text-tertiary">
                      {new Date(b.requestTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      <span className="text-[10px]">
                        ({new Date(b.requestTime).toLocaleDateString()})
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-label-mono text-[11px]">
                      {b.startTime && b.endTime ? (
                        <span className="text-on-surface">
                          {new Date(b.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          –{' '}
                          {new Date(b.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-tertiary italic">Pending Approval</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <BreakStatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px] truncate text-on-surface-variant text-[11px]">
                      {b.note || <span className="text-outline">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {b.status === BreakStatus.WaitingQueue && (
                        <>
                          <button
                            onClick={() => handleOpenAction(b, BreakStatus.Approved)}
                            className="p-1.5 rounded-lg bg-secondary-fixed/40 hover:bg-secondary-fixed text-on-secondary-fixed transition-colors inline-flex items-center justify-center shadow-xs"
                            title="Approve Break"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button
                            onClick={() => handleOpenAction(b, BreakStatus.Rejected)}
                            className="p-1.5 rounded-lg bg-error-container hover:bg-error-container/80 text-on-error-container transition-colors inline-flex items-center justify-center shadow-xs"
                            title="Decline Break"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </>
                      )}
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

      {/* Action Modal (Approve / Reject) */}
      {actionItem && (
        <Modal
          isOpen={true}
          onClose={() => setActionItem(null)}
          title={`${
            actionItem.targetStatus === BreakStatus.Approved ? 'Authorize' : 'Decline'
          } Break Request`}
          size="sm"
        >
          <form onSubmit={handleConfirmStatus} className="space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Confirm {actionItem.targetStatus === BreakStatus.Approved ? 'approval' : 'decline'} for{' '}
              <span className="font-semibold text-on-surface">
                {actionItem.breakItem.userFullName ?? `Attendance #${actionItem.breakItem.attendanceId}`}
              </span>{' '}
              ({actionItem.breakItem.breakTypeName}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1 font-label-md">
                Admin Note / Audit Reason (Optional)
              </label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add supervisory notes or coverage comments..."
                className="w-full p-2.5 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 ${
                  actionItem.targetStatus === BreakStatus.Approved
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-error text-on-error'
                }`}
              >
                {isUpdating ? (
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    {actionItem.targetStatus === BreakStatus.Approved ? 'check_circle' : 'cancel'}
                  </span>
                )}
                Confirm {actionItem.targetStatus === BreakStatus.Approved ? 'Approval' : 'Decline'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
