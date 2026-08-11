import { apiClient } from './api.client';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
  error?: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient<{ user: AuthUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const payload = res.data!;
  if (payload.token) {
    localStorage.setItem('auth_token', payload.token);
    localStorage.setItem('auth_user', JSON.stringify(payload.user));
  }

  return {
    message: res.message || 'Login successful',
    user: payload.user,
    token: payload.token,
  };
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient<{ user: AuthUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const payload = res.data!;
  if (payload.token) {
    localStorage.setItem('auth_token', payload.token);
    localStorage.setItem('auth_user', JSON.stringify(payload.user));
  }

  return {
    message: res.message || 'User registered successfully',
    user: payload.user,
    token: payload.token,
  };
}

export function getStoredUser(): AuthUser | null {
  const user = localStorage.getItem('auth_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
