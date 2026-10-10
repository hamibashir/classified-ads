'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthResponseData,
  AuthContextType,
} from '@/types/auth';
import { apiClient, setAuthToken, clearAuthToken } from '@/lib/api-client';
import {
  getStoredTokens,
  saveAuthTokens,
  clearAuthTokens,
  getStoredRefreshToken,
} from '@/lib/auth-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    clearAuthToken();
    clearAuthTokens();
    setUser(null);
    setTokens(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch {
      // Access token may be expired; attempt token refresh
      const storedRefreshToken = getStoredRefreshToken();
      if (storedRefreshToken) {
        try {
          const refreshRes = await apiClient.post<{ accessToken: string }>(
            '/auth/refresh',
            { refreshToken: storedRefreshToken }
          );

          if (refreshRes.data?.accessToken) {
            const newTokens: AuthTokens = {
              accessToken: refreshRes.data.accessToken,
              refreshToken: storedRefreshToken,
            };
            saveAuthTokens(newTokens);
            setAuthToken(newTokens.accessToken);
            setTokens(newTokens);

            // Re-fetch user profile with new access token
            const retryRes = await apiClient.get<{ user: User }>('/auth/me');
            if (retryRes.data?.user) {
              setUser(retryRes.data.user);
              return retryRes.data.user;
            }
          }
        } catch {
          // Token refresh failed; session expired
          logout();
          return null;
        }
      }

      logout();
      return null;
    }
  }, [logout]);

  // Initial bootstrap: restore session from storage/cookies
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const stored = getStoredTokens();
        if (stored?.accessToken) {
          setTokens(stored);
          setAuthToken(stored.accessToken);
          await refreshUser();
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [refreshUser]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const response = await apiClient.post<AuthResponseData>(
        '/auth/login',
        credentials
      );

      if (!response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: loggedInUser, tokens: authTokens } = response.data;
      saveAuthTokens(authTokens);
      setAuthToken(authTokens.accessToken);
      setUser(loggedInUser);
      setTokens(authTokens);

      return loggedInUser;
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<User> => {
      const response = await apiClient.post<AuthResponseData>(
        '/auth/register',
        data
      );

      if (!response.data) {
        throw new Error(response.message || 'Registration failed');
      }

      const { user: registeredUser, tokens: authTokens } = response.data;
      saveAuthTokens(authTokens);
      setAuthToken(authTokens.accessToken);
      setUser(registeredUser);
      setTokens(authTokens);

      return registeredUser;
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<User> => {
      const response = await apiClient.post<AuthResponseData>(
        '/auth/google',
        { idToken }
      );

      if (!response.data) {
        throw new Error(response.message || 'Google authentication failed');
      }

      const { user: googleUser, tokens: authTokens } = response.data;
      saveAuthTokens(authTokens);
      setAuthToken(authTokens.accessToken);
      setUser(googleUser);
      setTokens(authTokens);

      return googleUser;
    },
    []
  );

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
