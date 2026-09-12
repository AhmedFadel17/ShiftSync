import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { Shift, CreateShiftDto, UpdateShiftDto, ShiftFilter } from '@/types/shiftsync';

export const shiftsApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getShifts: builder.query<ApiResponse<PaginationResponse<Shift>>, ShiftFilter>({
      query: (params) => ({
        url: '/api/Shifts',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Shift' as const, id })),
              { type: 'Shift', id: 'LIST' },
            ]
          : [{ type: 'Shift', id: 'LIST' }],
    }),
    getShiftById: builder.query<ApiResponse<Shift>, number>({
      query: (id) => `/api/Shifts/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Shift', id }],
    }),
    createShift: builder.mutation<ApiResponse<Shift>, CreateShiftDto>({
      query: (body) => ({
        url: '/api/Shifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Shift', id: 'LIST' }],
    }),
    updateShift: builder.mutation<ApiResponse<Shift>, { id: number; body: UpdateShiftDto }>({
      query: ({ id, body }) => ({
        url: `/api/Shifts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Shift', id },
        { type: 'Shift', id: 'LIST' },
      ],
    }),
    deleteShift: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/Shifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Shift', id: 'LIST' }],
    }),
    getAllShifts: builder.query<ApiResponse<Shift[]>, void>({
      query: () => '/api/Shifts/all',
      providesTags: [{ type: 'Shift', id: 'ALL' }],
    }),
  }),
});

export const {
  useGetShiftsQuery,
  useGetShiftByIdQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useGetAllShiftsQuery,
} = shiftsApi;
