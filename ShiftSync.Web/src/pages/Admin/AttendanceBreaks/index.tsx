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
import {
  FaPauseCircle,
  FaCheck,
  FaTimes,
  FaCoffee,
  FaSpinner,
  FaFilter,
  FaClock,
} from 'react-icons/fa';

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
          ? 'rejected'
          : 'updated';
      toast.success(`Break request ${actionWord} successfully`);
      setActionItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update break status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaPauseCircle className="text-cyan-400" /> Break Requests & Queue
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Review live employee break queues, enforce minimum staff constraints, and approve or reject requests.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 self-start sm:self-auto">
          Total Requests: <span className="text-cyan-400 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-white/40 text-xs" />
            <select
              value={selectedStatus === undefined ? '' : selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value === '' ? undefined : Number(e.target.value) as BreakStatus);
                setPageNumber(1);
              }}
              aria-label="Filter by break status"
              className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value={BreakStatus.WaitingQueue}>Waiting Queue (Pending)</option>
              <option value={BreakStatus.Approved}>Approved</option>
              <option value={BreakStatus.Rejected}>Rejected</option>
              <option value={BreakStatus.Completed}>Completed</option>
            </select>
          </div>

          <select
            value={selectedBreakTypeId === undefined ? '' : selectedBreakTypeId}
            onChange={(e) => {
              setSelectedBreakTypeId(e.target.value === '' ? undefined : Number(e.target.value));
              setPageNumber(1);
            }}
            aria-label="Filter by break policy type"
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Break Types</option>
            {breakTypesList.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name} ({bt.maxDurationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* Status Pills Shortcut */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedStatus(BreakStatus.WaitingQueue);
              setPageNumber(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedStatus === BreakStatus.WaitingQueue
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            Pending Queue
          </button>
          <button
            onClick={() => {
              setSelectedStatus(undefined);
              setPageNumber(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedStatus === undefined
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            View All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/40 border-b border-white/10 font-semibold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Break Type</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Time Interval</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading break records...
                  </td>
                </tr>
              ) : breaks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No break requests found for the selected filter.
                  </td>
                </tr>
              ) : (
                breaks.map((item) => {
                  const isPending = item.status === BreakStatus.WaitingQueue;
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {item.userFullName ?? `Attendance #${item.attendanceId}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
                          <FaCoffee className="text-cyan-400 text-xs" />
                          {item.breakTypeName ?? `Type #${item.breakTypeId}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-white/70">
                        <div className="flex items-center gap-1">
                          <FaClock className="text-white/30 text-[10px]" />
                          {new Date(item.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {new Date(item.requestTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-white/60">
                        {item.startTime ? (
                          <span>
                            {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' – '}
                            {item.endTime
                              ? new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'ongoing'}
                          </span>
                        ) : (
                          <span className="text-white/30 italic">Not started</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <BreakStatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-white/50 max-w-[180px] truncate">
                        {item.note || '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleOpenAction(item, BreakStatus.Approved)}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Approve Break"
                            >
                              <FaCheck className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleOpenAction(item, BreakStatus.Rejected)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Reject Break"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenAction(
                                item,
                                item.status === BreakStatus.Approved
                                  ? BreakStatus.Rejected
                                  : BreakStatus.Approved
                              )
                            }
                            className="text-xs text-white/40 hover:text-white/80 underline decoration-dotted"
                          >
                            Change
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {/* Action Modal */}
      {actionItem && (
        <Modal
          isOpen={true}
          onClose={() => setActionItem(null)}
          title={`Update Break Request #${actionItem.breakItem.id}`}
          size="sm"
        >
          <form onSubmit={handleConfirmStatus} className="space-y-4">
            <div>
              <p className="text-sm text-white/70">
                Change status for employee{' '}
                <span className="font-semibold text-white">
                  {actionItem.breakItem.userFullName ?? `User on Attendance #${actionItem.breakItem.attendanceId}`}
                </span>{' '}
                to:
              </p>
              <div className="mt-2">
                <select
                  value={actionItem.targetStatus}
                  onChange={(e) =>
                    setActionItem({
                      ...actionItem,
                      targetStatus: Number(e.target.value) as BreakStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={BreakStatus.Approved}>Approved</option>
                  <option value={BreakStatus.WaitingQueue}>Waiting Queue</option>
                  <option value={BreakStatus.Rejected}>Rejected</option>
                  <option value={BreakStatus.Completed}>Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-1">
                Admin Note / Reason (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add optional note or justification..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950/60 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
                  actionItem.targetStatus === BreakStatus.Approved
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionItem.targetStatus === BreakStatus.Rejected
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-cyan-600 hover:bg-cyan-500'
                }`}
              >
                {isUpdating ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                Confirm Status
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
