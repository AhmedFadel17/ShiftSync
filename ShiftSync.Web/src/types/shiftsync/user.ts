export enum UserRole {
  User = 1,
  Admin = 2,
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}
