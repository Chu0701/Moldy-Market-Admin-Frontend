import { useAuthStore } from '@/state/authStore';
import axios from 'axios'


const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1'

export const apiServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

//prevents refresh requests from triggering
const refreshServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Moldy-Auth': '1',
  }
});
let refreshPromise = null;
//attach access token to every authenticated request
apiServer.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if(token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Unwrap backend ApiResponse.
apiServer.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body && typeof body === 'object' && 'data' in body) {
      return body.data
    }

    return body
  },
  async (error) => {
    const originalRequest = error.config;


    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(createApiError(error));
    }

    // Don't refresh login or refresh-token requests.
    const isAuthRequest =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')

    if (isAuthRequest || originalRequest._retry) {
      return Promise.reject(createApiError(error))
    }

    originalRequest._retry = true

    try {
      // Reuse an existing refresh operation if one is running.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
      }

      const newAccessToken = await refreshPromise

      // Retry original request with the new access token.
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return apiServer(originalRequest)
    } catch (refreshError) {
      return Promise.reject(createApiError(refreshError))
    }
  }
)

// Perform exactly one refresh operation at a time.
async function refreshAccessToken() {
  try {
    const {updateTokens} = useAuthStore.getState();

    const response = await refreshServer.post('/auth/refresh');

    const newAccessToken = response.data?.data?.accessToken;
    if(!newAccessToken){
      throw new Error('Invalid refresh token response');
    }
    updateTokens({accessToken: newAccessToken});

    return newAccessToken;
  } catch (error) {
    // Clear authentication only once, after refresh fails.
    useAuthStore.getState().logout()

    throw error
  } finally {
    // Allow a future refresh operation.
    refreshPromise = null
  }
}


function createApiError(error) {
  if (error.originalError) {
    return error
  }

  const message =
    error.response?.data?.message ||
    error.message ||
    'Something went wrong'

  const enhancedError = new Error(message)

  enhancedError.status = error.response?.status
  enhancedError.code = error.response?.data?.code
  enhancedError.originalError = error

  return enhancedError
}
export default apiServer
