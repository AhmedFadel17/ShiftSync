export interface BreakType {
  id: number;
  name: string;
  maxDurationMinutes: number;
  maxOccurrencesPerShift: number;
  isActive: boolean;
}

export interface CreateBreakTypeDto {
  name: string;
  maxDurationMinutes: number;
  maxOccurrencesPerShift: number;
}

export interface UpdateBreakTypeDto {
  name?: string;
  maxDurationMinutes?: number;
  maxOccurrencesPerShift?: number;
}

export interface BreakTypeFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
