import React, { useState } from 'react';
import {
  useGetAttendancesQuery,
  useGetUsersQuery,
} from '@/store/apis';
import { Attendance } from '@/types/shiftsync';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';

export default function AttendancesPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Details Modal
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  // RTK Query
  const { data, isLoading, isFetching } = useGetAttendancesQuery({
    pageNumber,
    pageSize,
    userId: selectedUserId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: usersData } = useGetUsersQuery({ pageNumber: 1, pageSize: 100 });

  const attendances = data?.data?.items ?? [];
  const totalCount = data?.data?.totalCount ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const usersList = usersData?.data?.items ?? [];

  return (
    <div className="flex flex-col w-full px-margin md:px-space-xl pb-space-xl space-y-space-lg max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-space-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm mt-0.5">
            <span className="material-symbols-outlined text-[22px]">insights</span>
          </div>
          <div>
            <span className="font-label-mono text-label-mono text-tertiary uppercase tracking-wider">
              Floor Intelligence & Logs
            </span>
            <h1 className="font-headline-lg-mobile lg:text-headline-lg text-headline-lg-mobile text-on-surface tracking-tight font-bold">
              Attendance Records
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Real-time workforce attendance logs with check-in, check-out, and geolocation coordinates.
            </p>
          </div>
        </div>

        <div className="font-label-mono text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
          <span className="text-tertiary">Total Logs:</span>
          <span className="text-primary font-bold">{totalCount}</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-space-md shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPageNumber(1);
            }}
            aria-label="Filter attendance by employee"
            className="h-10 bg-surface-container-low/60 border border-outline-variant/25 rounded-xl px-3 text-xs text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:border-primary/50 transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Employees</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
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
              aria-label="Filter attendance from date"
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
              aria-label="Filter attendance to date"
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
                <th className="px-5 py-3.5">Check-In</th>
                <th className="px-5 py-3.5">Check-Out</th>
                <th className="px-5 py-3.5">Roster Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2 block">
                      refresh
                    </span>
                    Loading attendance logs...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                      person_off
                    </span>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => {
                  const isOngoing = !att.checkOutTime;
                  return (
                    <tr key={att.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-secondary-fixed/40 border border-secondary/20 text-on-secondary-fixed font-bold flex items-center justify-center text-xs shrink-0">
                            {att.userFullName?.charAt(0)?.toUpperCase() ?? 'U'}
                          </div>
                          <div className="font-semibold text-on-surface">
                            {att.userFullName ?? `Staff #${att.userId}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-primary">
                          {att.shiftName ?? `Shift #${att.userShiftId}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-label-mono text-[11px] text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-secondary">
                            login
                          </span>
                          {new Date(att.checkInTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-[10px] text-tertiary font-label-mono mt-0.5">
                          {new Date(att.checkInTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {att.checkOutTime ? (
                          <>
                            <div className="font-label-mono text-[11px] text-on-surface flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-tertiary">
                                logout
                              </span>
                              {new Date(att.checkOutTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            <div className="text-[10px] text-tertiary font-label-mono mt-0.5">
                              {new Date(att.checkOutTime).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed font-badge-sm text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            ON SHIFT
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-badge-sm text-[10px] font-semibold ${
                            isOngoing
                              ? 'bg-secondary-fixed/40 text-on-secondary-fixed'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOngoing ? 'bg-secondary animate-pulse' : 'bg-outline'
                            }`}
                          />
                          {isOngoing ? 'Active Roster' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedAttendance(att)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center shadow-xs"
                          title="View Attendance Details"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
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

      {/* Details Modal */}
      {selectedAttendance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAttendance(null)}
          title={`Attendance Details: ${selectedAttendance.userFullName ?? selectedAttendance.userId}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] text-tertiary uppercase font-label-mono font-bold block mb-1">
                  Check-In Time
                </span>
                <p className="font-semibold text-xs text-on-surface">
                  {new Date(selectedAttendance.checkInTime).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/20">
                <span className="text-[10px] text-tertiary uppercase font-label-mono font-bold block mb-1">
                  Check-Out Time
                </span>
                <p className="font-semibold text-xs text-on-surface">
                  {selectedAttendance.checkOutTime
                    ? new Date(selectedAttendance.checkOutTime).toLocaleString()
                    : 'Currently On Duty'}
                </p>
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>Geolocation Verification</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-label-mono text-on-surface-variant">
                <div>
                  <span className="text-tertiary block text-[10px]">Check-In Coordinates:</span>
                  <span>
                    {selectedAttendance.checkInLatitude != null && selectedAttendance.checkInLongitude != null
                      ? `${selectedAttendance.checkInLatitude.toFixed(4)}, ${selectedAttendance.checkInLongitude.toFixed(4)}`
                      : 'Not recorded'}
                  </span>
                </div>
                <div>
                  <span className="text-tertiary block text-[10px]">Check-Out Coordinates:</span>
                  <span>
                    {selectedAttendance.checkOutLatitude != null && selectedAttendance.checkOutLongitude != null
                      ? `${selectedAttendance.checkOutLatitude.toFixed(4)}, ${selectedAttendance.checkOutLongitude.toFixed(4)}`
                      : 'Not recorded'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setSelectedAttendance(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
