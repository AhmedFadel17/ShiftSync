import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { clearAuth } from '@/store/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Accept', 'application/json');
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Custom RTK Query base query for ShiftSync JWT auth.
 * - Attaches Bearer token from Redux state to every request.
 * - On 401: clears auth state (token expired / invalid).
 */
export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(clearAuth());
  }

  return result;
};
