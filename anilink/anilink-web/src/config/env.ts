const DEFAULT_API_BASE_URL = 'http://localhost:8000/v1'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
}
