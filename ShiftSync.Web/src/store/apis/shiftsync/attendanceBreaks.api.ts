import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { AttendanceBreak, UpdateBreakStatusDto, AttendanceBreakFilter } from '@/types/shiftsync';

export const attendanceBreaksApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceBreaks: builder.query<ApiResponse<PaginationResponse<AttendanceBreak>>, AttendanceBreakFilter>({
      query: (params) => ({
        url: '/api/AttendanceBreaks',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'AttendanceBreak' as const, id })),
              { type: 'AttendanceBreak', id: 'LIST' },
            ]
          : [{ type: 'AttendanceBreak', id: 'LIST' }],
    }),
    updateBreakStatus: builder.mutation<ApiResponse<AttendanceBreak>, { id: number; body: UpdateBreakStatusDto }>({
      query: ({ id, body }) => ({
        url: `/api/AttendanceBreaks/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'AttendanceBreak', id },
        { type: 'AttendanceBreak', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAttendanceBreaksQuery,
  useUpdateBreakStatusMutation,
} = attendanceBreaksApi;
