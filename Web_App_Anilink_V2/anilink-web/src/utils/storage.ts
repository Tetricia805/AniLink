const ACCESS_TOKEN_KEY = 'anilink.accessToken'
const REFRESH_TOKEN_KEY = 'anilink.refreshToken'
const USER_KEY = 'anilink.user'

export const storage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  setUser<T>(user: T | null) {
    if (!user) {
      localStorage.removeItem(USER_KEY)
      return
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clearAll() {
    this.clearTokens()
    this.setUser(null)
  },
}
