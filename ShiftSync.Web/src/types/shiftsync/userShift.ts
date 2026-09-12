import { User } from './user';
import { Shift } from './shift';

export interface UserShift {
  id: number;
  userId: string;
  shiftId: number;
  date: string; // "YYYY-MM-DD"
  user?: User;
  shift?: Shift;
}

export interface CreateUserShiftDto {
  userId: string;
  shiftId: number;
  date: string;
}

export interface UserShiftFilter {
  pageNumber?: number;
  pageSize?: number;
  userId?: string;
  shiftId?: number;
  dateFrom?: string;
  dateTo?: string;
}
