import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '@/services/customBaseQuery';

export const mainApi = createApi({
  reducerPath: 'mainApi',
  baseQuery: customBaseQuery,
  tagTypes: [
    'User',
    'Shift',
    'UserShift',
    'Attendance',
    'AttendanceBreak',
    'BreakType',
  ],
  endpoints: () => ({}),
});
