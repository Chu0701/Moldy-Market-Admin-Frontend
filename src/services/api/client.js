import axios from 'axios'

import { getAccessToken } from '@/lib/tokenStorage'
import { ApiError } from '@/services/api/ApiError'

export const apiClient = axios.create({
  // Services supply the complete path because Backend uses both /api/v1 and /api.
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  if (config.url?.startsWith('/api/v1/auth/')) return config

  const accessToken = getAccessToken()

  if (accessToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TanStack Query must still recognize requests cancelled through AbortSignal.
    if (axios.isCancel(error)) return Promise.reject(error)
    return Promise.reject(ApiError.from(error))
  },
)
