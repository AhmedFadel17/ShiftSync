export interface Attendance {
  id: number;
  userId: string;
  userShiftId: number;
  checkInTime: string;
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutTime?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  userFullName?: string;
  shiftName?: string;
}

export interface AttendanceFilter {
  pageNumber?: number;
  pageSize?: number;
  userId?: string;
  userShiftId?: number;
  dateFrom?: string;
  dateTo?: string;
}
