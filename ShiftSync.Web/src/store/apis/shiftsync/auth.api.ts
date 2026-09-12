import { mainApi } from '../mainApi';
import type { ApiResponse } from '@/types/api';

export interface AuthResponseDto {
  token: string;
  expiresAt: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export const authApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponseDto>, LoginRequest>({
      query: (body) => ({
        url: '/api/Auth/Login',
        method: 'POST',
        body,
      }),
    }),
    register: builder.mutation<ApiResponse<AuthResponseDto>, RegisterRequest>({
      query: (body) => ({
        url: '/api/Auth/Register',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
