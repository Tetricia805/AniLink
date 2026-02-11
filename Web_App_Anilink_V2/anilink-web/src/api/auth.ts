import { api } from './http'
import type { AuthResponseDto, RegisterRequestDto, UserDto } from '../types/auth'

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponseDto>('/auth/login', {
    email,
    password,
  })
  return response.data
}

export async function register(payload: RegisterRequestDto) {
  const response = await api.post<AuthResponseDto>('/auth/register', payload)
  return response.data
}

/** Get current authenticated user (GET /v1/auth/me). Requires Bearer token. */
export async function getCurrentUser(): Promise<UserDto> {
  const response = await api.get<UserDto>('/auth/me')
  return response.data
}

export async function logout(refreshToken: string | null) {
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // ignore; we clear local state anyway
    }
  }
}

export async function forgotPassword(email: string) {
  const response = await api.post<{ message: string }>('/auth/password/forgot', { email })
  return response.data
}

export async function verifyResetToken(token: string) {
  const response = await api.post<{ valid: boolean }>('/auth/password/verify', { token })
  return response.data
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await api.post<{ message: string }>('/auth/password/reset', {
    token,
    new_password: newPassword,
  })
  return response.data
}

export async function loginWithGoogle(idToken: string) {
  const response = await api.post<AuthResponseDto>('/auth/google', { id_token: idToken })
  return response.data
}
