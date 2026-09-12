export interface Shift {
  id: number;
  name: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
  maxAllowedBreaksDurationMinutes: number;
  minActiveEmployeesRequired: number;
  isActive: boolean;
}

export interface CreateShiftDto {
  name: string;
  startTime: string;
  endTime: string;
  maxAllowedBreaksDurationMinutes: number;
  minActiveEmployeesRequired: number;
}

export interface UpdateShiftDto {
  name?: string;
  startTime?: string;
  endTime?: string;
  maxAllowedBreaksDurationMinutes?: number;
  minActiveEmployeesRequired?: number;
}

export interface ShiftFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
