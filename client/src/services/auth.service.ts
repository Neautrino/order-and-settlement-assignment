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
  const data = await apiClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  return data;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const data = await apiClient<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  return data;
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
