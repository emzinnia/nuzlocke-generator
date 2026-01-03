/**
 * Authentication API functions.
 */

import { api, setAuthToken, clearAuthToken, getAuthToken } from './client';

export interface User {
  id: string;
  email: string | null;
  is_anonymous: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
}

/**
 * Register a new user account.
 */
export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/register', { email, password });
  setAuthToken(response.token);
  return response;
}

/**
 * Log in with email and password.
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(`/api/auth/login`, { email, password });
  setAuthToken(response.token);
  return response;
}

/**
 * Log out the current user.
 */
export function logout(): void {
  clearAuthToken();
}

/**
 * Create an anonymous user session.
 * This allows users to use the app without signing up.
 */
export async function loginAnonymously(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/anonymous');
  setAuthToken(response.token);
  return response;
}

/**
 * Upgrade an anonymous account to a full account with email and password.
 */
export async function upgradeAccount(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/upgrade', { email, password });
  setAuthToken(response.token);
  return response;
}

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await api.get<MeResponse>('/api/auth/me');
    return response.user;
  } catch {
    clearAuthToken();
    return null;
  }
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Ensure the user is authenticated.
 * If not authenticated, automatically create an anonymous session.
 */
export async function ensureAuthenticated(): Promise<User> {
  const token = getAuthToken();
  
  if (token) {
    try {
      const response = await api.get<MeResponse>('/api/auth/me');
      return response.user;
    } catch {
      clearAuthToken();
    }
  }
  
  const response = await loginAnonymously();
  return response.user;
}

