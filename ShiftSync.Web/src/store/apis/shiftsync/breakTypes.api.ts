import { mainApi } from '../mainApi';
import type { ApiResponse, PaginationResponse } from '@/types/api';
import type { BreakType, CreateBreakTypeDto, UpdateBreakTypeDto, BreakTypeFilter } from '@/types/shiftsync';

export const breakTypesApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getBreakTypes: builder.query<ApiResponse<PaginationResponse<BreakType>>, BreakTypeFilter>({
      query: (params) => ({
        url: '/api/BreakTypes',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'BreakType' as const, id })),
              { type: 'BreakType', id: 'LIST' },
            ]
          : [{ type: 'BreakType', id: 'LIST' }],
    }),
    createBreakType: builder.mutation<ApiResponse<BreakType>, CreateBreakTypeDto>({
      query: (body) => ({
        url: '/api/BreakTypes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'BreakType', id: 'LIST' }],
    }),
    updateBreakType: builder.mutation<ApiResponse<BreakType>, { id: number; body: UpdateBreakTypeDto }>({
      query: ({ id, body }) => ({
        url: `/api/BreakTypes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'BreakType', id },
        { type: 'BreakType', id: 'LIST' },
      ],
    }),
    deleteBreakType: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/BreakTypes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'BreakType', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBreakTypesQuery,
  useCreateBreakTypeMutation,
  useUpdateBreakTypeMutation,
  useDeleteBreakTypeMutation,
} = breakTypesApi;
