import { request } from './http';
import type { AuthResponse, Credentials, User } from './types';

export const authApi = {
  register: (data: Credentials) => request<AuthResponse>('POST', '/api/auth/register', data),
  login: (data: Credentials) => request<AuthResponse>('POST', '/api/auth/login', data),
  me: () => request<User>('GET', '/api/auth/me'),
};
