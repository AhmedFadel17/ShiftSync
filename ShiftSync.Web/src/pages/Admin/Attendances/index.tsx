import React, { useState } from 'react';
import {
  useGetAttendancesQuery,
  useGetUsersQuery,
} from '@/store/apis';
import { Attendance } from '@/types/shiftsync';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modals';
import {
  FaClipboardList,
  FaMapMarkerAlt,
  FaClock,
  FaUserCheck,
  FaSpinner,
  FaFilter,
  FaEye,
} from 'react-icons/fa';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaClipboardList className="text-cyan-400" /> Attendance Records
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Real-time workforce attendance logs with check-in, check-out, and geolocation coordinates.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 self-start sm:self-auto">
          Total Logs: <span className="text-cyan-400 font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <FaFilter className="text-white/40 text-xs" />
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPageNumber(1);
            }}
            aria-label="Filter attendance by employee"
            className="bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Employees</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
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
              aria-label="Filter attendance from date"
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
              aria-label="Filter attendance to date"
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
                <th className="px-6 py-4">Shift Name</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    <FaSpinner className="animate-spin text-2xl mx-auto text-cyan-400 mb-2" />
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => {
                  const isOngoing = !att.checkOutTime;
                  return (
                    <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {att.userFullName ?? att.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-cyan-300">
                        {att.shiftName ?? `Shift #${att.userShiftId}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-white/90 flex items-center gap-1.5">
                          <FaClock className="text-cyan-400 text-xs" />
                          {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-white/40 font-mono">
                          {new Date(att.checkInTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {att.checkOutTime ? (
                          <>
                            <div className="font-mono text-xs text-white/90 flex items-center gap-1.5">
                              <FaClock className="text-orange-400 text-xs" />
                              {new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[11px] text-white/40 font-mono">
                              {new Date(att.checkOutTime).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-400 font-semibold italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            On Shift
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            isOngoing
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-white/5 text-white/50 border-white/10'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOngoing ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                            }`}
                          />
                          {isOngoing ? 'Active' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedAttendance(att)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/60 transition-colors"
                          title="View Geolocation & Details"
                        >
                          <FaEye className="text-xs" />
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

      {/* Details Modal */}
      {selectedAttendance && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAttendance(null)}
          title="Attendance Log Details"
          size="md"
        >
          <div className="space-y-5 text-sm">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
              <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                Employee
              </div>
              <div className="text-white font-bold text-base flex items-center gap-2">
                <FaUserCheck className="text-cyan-400" />
                {selectedAttendance.userFullName ?? selectedAttendance.userId}
              </div>
              <div className="text-xs text-cyan-300 font-medium">
                {selectedAttendance.shiftName ?? `Shift #${selectedAttendance.userShiftId}`}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Check-In */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <FaClock /> Check-In
                </div>
                <div className="text-xs text-white/80 font-mono">
                  {new Date(selectedAttendance.checkInTime).toLocaleString()}
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-white/60 space-y-1 font-mono">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <FaMapMarkerAlt className="text-xs" />
                    GPS Coordinates:
                  </div>
                  <div>Lat: {selectedAttendance.checkInLatitude.toFixed(6)}</div>
                  <div>Lng: {selectedAttendance.checkInLongitude.toFixed(6)}</div>
                </div>
              </div>

              {/* Check-Out */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs uppercase tracking-wider">
                  <FaClock /> Check-Out
                </div>
                {selectedAttendance.checkOutTime ? (
                  <>
                    <div className="text-xs text-white/80 font-mono">
                      {new Date(selectedAttendance.checkOutTime).toLocaleString()}
                    </div>
                    {selectedAttendance.checkOutLatitude !== undefined && (
                      <div className="pt-2 border-t border-white/10 text-xs text-white/60 space-y-1 font-mono">
                        <div className="flex items-center gap-1.5 text-orange-300">
                          <FaMapMarkerAlt className="text-xs" />
                          GPS Coordinates:
                        </div>
                        <div>Lat: {selectedAttendance.checkOutLatitude.toFixed(6)}</div>
                        <div>Lng: {selectedAttendance.checkOutLongitude?.toFixed(6)}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-white/40 italic pt-2">
                    Not checked out yet (currently on shift).
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedAttendance(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-colors"
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
