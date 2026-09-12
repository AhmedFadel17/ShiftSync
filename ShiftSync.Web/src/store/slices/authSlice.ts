import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '@/types/shiftsync';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  userName?: string;
  role: string | UserRole;
}

export function isRoleAdmin(role: string | UserRole | undefined | null): boolean {
  if (!role) return false;
  return (
    role === 'Admin' ||
    role === UserRole.Admin ||
    String(role).toLowerCase() === 'admin' ||
    String(role) === '2'
  );
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'shiftsync_token';
const USER_KEY = 'shiftsync_user';

// Rehydrate from localStorage on startup
const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem(USER_KEY);

const initialState: AuthState = {
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
