export enum BreakStatus {
  Approved = 1,
  WaitingQueue = 2,
  Rejected = 3,
  Completed = 4,
}

export interface AttendanceBreak {
  id: number;
  attendanceId: number;
  breakTypeId: number;
  breakTypeName?: string;
  requestTime: string;
  startTime?: string;
  endTime?: string;
  status: BreakStatus;
  note?: string;
  userFullName?: string;
}

export interface UpdateBreakStatusDto {
  status: BreakStatus;
  note?: string;
}

export interface AttendanceBreakFilter {
  pageNumber?: number;
  pageSize?: number;
  attendanceId?: number;
  status?: BreakStatus;
  breakTypeId?: number;
}
