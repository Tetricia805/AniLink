import axios from 'axios'
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { env } from '../config/env'
import { storage } from '../utils/storage'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  const refreshToken = storage.getRefreshToken()
  if (!refreshToken) return null

  refreshPromise = axios
    .post(`${env.apiBaseUrl}/auth/refresh`, { refreshToken })
    .then((response) => {
      const accessToken = response.data?.accessToken
      const newRefreshToken = response.data?.refreshToken ?? refreshToken
      if (accessToken) {
        storage.setTokens(accessToken, newRefreshToken)
        return accessToken as string
      }
      storage.clearTokens()
      return null
    })
    .catch(() => {
      storage.clearTokens()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (import.meta.env.DEV) {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`
    const authHeader = config.headers?.Authorization
    console.debug('[API Request]', {
      method: config.method?.toUpperCase(),
      url,
      headers: { ...config.headers, Authorization: authHeader ? 'Bearer ***' : undefined },
    })
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const url = `${response.config?.baseURL ?? ''}${response.config?.url ?? ''}`
      console.debug('[API Response]', {
        url,
        status: response.status,
        dataType: Array.isArray(response.data) ? `array[${response.data.length}]` : typeof response.data,
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalConfig = error.config as RetryConfig | undefined
    const url = originalConfig ? `${originalConfig.baseURL ?? ''}${originalConfig.url ?? ''}` : 'unknown'

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url,
        status,
        message: error.message,
        response: error.response?.data ?? error.response?.data?.toString?.() ?? null,
      })
    }

    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        originalConfig.headers = originalConfig.headers || {}
        originalConfig.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalConfig)
      }
    }

    return Promise.reject(error)
  },
)

export { api }
