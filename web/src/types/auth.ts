/**
 * Core User and Authentication Type Definitions
 */

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isPhoneVerified: boolean;
  isBanned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}
