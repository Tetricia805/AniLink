import { create } from 'zustand'
import { getCurrentUser, login, loginWithGoogle, logout as apiLogout, register } from '../api/auth'
import type { AuthResponseDto, RegisterRequestDto, UserDto } from '../types/auth'
import { storage } from '../utils/storage'
import { queryClient, NOTIFICATIONS_QUERY_KEY } from '../lib/queryClient'

interface AuthState {
  user: UserDto | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  /** True after first hydrate(); used to avoid showing landing/app until auth is resolved */
  hasHydrated: boolean
  error: string | null
  hydrate: () => Promise<void>
  /** Refetch current user (e.g. after profile update or avatar upload). */
  refreshUser: () => Promise<void>
  clearError: () => void
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  register: (payload: RegisterRequestDto) => Promise<void>
  logout: () => void
}

const applyAuthPayload = (data: AuthResponseDto) => {
  storage.setTokens(data.accessToken, data.refreshToken ?? '')
  storage.setUser<UserDto>(data.user)
  return {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
    isAuthenticated: true,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  error: null,
  hydrate: async () => {
    const accessToken = storage.getAccessToken()
    const refreshToken = storage.getRefreshToken()
    if (!accessToken) {
      storage.setUser(null)
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        hasHydrated: true,
      })
      return
    }
    try {
      const user = await getCurrentUser()
      storage.setUser(user)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        hasHydrated: true,
      })
    } catch {
      storage.clearAll()
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        hasHydrated: true,
      })
    }
  },
  refreshUser: async () => {
    const accessToken = storage.getAccessToken()
    if (!accessToken) return
    try {
      const user = await getCurrentUser()
      storage.setUser(user)
      set({ user })
    } catch {
      // ignore; keep current user
    }
  },
  clearError: () => set({ error: null }),
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const data = await login(email, password)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      set({
        ...applyAuthPayload(data),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      })
      throw error
    }
  },
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null })
    try {
      const data = await loginWithGoogle(idToken)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      set({
        ...applyAuthPayload(data),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Google login failed',
      })
      throw error
    }
  },
  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await register(payload)
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      set({
        ...applyAuthPayload(data),
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      })
      throw error
    }
  },
  logout: () => {
    const refreshToken = storage.getRefreshToken()
    apiLogout(refreshToken)
    storage.clearAll()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    })
  },
}))