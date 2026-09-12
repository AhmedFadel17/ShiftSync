import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { UserShift, CreateUserShiftDto, UserShiftFilter } from '@/types/shiftsync';

export const userShiftsApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserShifts: builder.query<ApiResponse<PaginationResponse<UserShift>>, UserShiftFilter>({
      query: (params) => ({
        url: '/api/UserShifts',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'UserShift' as const, id })),
              { type: 'UserShift', id: 'LIST' },
            ]
          : [{ type: 'UserShift', id: 'LIST' }],
    }),
    createUserShift: builder.mutation<ApiResponse<UserShift>, CreateUserShiftDto>({
      query: (body) => ({
        url: '/api/UserShifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'UserShift', id: 'LIST' }],
    }),
    deleteUserShift: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/UserShifts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'UserShift', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUserShiftsQuery,
  useCreateUserShiftMutation,
  useDeleteUserShiftMutation,
} = userShiftsApi;
