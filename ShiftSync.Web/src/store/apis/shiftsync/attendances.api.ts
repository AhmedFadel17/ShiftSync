import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { Attendance, AttendanceFilter } from '@/types/shiftsync';

export const attendancesApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendances: builder.query<ApiResponse<PaginationResponse<Attendance>>, AttendanceFilter>({
      query: (params) => ({
        url: '/api/Attendances',
        params,
      }),
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
  }),
});

export const { useGetAttendancesQuery } = attendancesApi;
