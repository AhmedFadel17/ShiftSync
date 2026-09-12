import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { User, UpdateUserDto, UserFilter } from '@/types/shiftsync';

export const usersApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiResponse<PaginationResponse<User>>, UserFilter>({
      query: (params) => ({
        url: '/api/Users',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/api/Users/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'User', id }],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { id: string; body: UpdateUserDto }>({
      query: ({ id, body }) => ({
        url: `/api/Users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/api/Users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
