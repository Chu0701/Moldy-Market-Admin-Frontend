import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/services/api/authApi'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Login with email and password, check for ADMIN role
       */
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const authData = await authApi.login({ email, password })

          // Store temporary token so subsequent requests are authenticated
          set({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            user: {
              id: authData.userId,
              email: authData.email,
              fullName: authData.fullName,
            },
          })

          // Retrieve full profile to check roles
          const profile = await authApi.getMyProfile()

          const roles = profile.roles || []
          const isAdmin = roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

          if (!isAdmin) {
            get().logout()
            throw new Error('Access denied. Administrator permissions required.')
          }

          set({
            user: {
              id: profile.id || authData.userId,
              email: profile.email || authData.email,
              fullName: authData.fullName || profile.email,
              avatarUrl: profile.avatarUrl,
              status: profile.status,
              trustPoints: profile.trustPoints,
              roles: profile.roles,
            },
            isLoading: false,
          })

          return true
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      /**
       * Fetch/refresh the current user profile
       */
      fetchProfile: async () => {
        try {
          const profile = await authApi.getMyProfile()
          set((state) => ({
            user: {
              ...state.user,
              ...profile,
            },
          }))
          return profile
        } catch (error) {
          // If token expired or invalid
          if (error.status === 401) {
            get().logout()
          }
          throw error
        }
      },
      //update access token after refreshing
      updateTokens: ({accessToken}) => {
        set({accessToken, isAuthenticated: Boolean(accessToken)});
      },

      /**
       * Clear state and log out
       */
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        localStorage.removeItem('moldy_admin_auth')
      },
      /**
       * Helper to check if current user is an Admin
       */
      isAdmin: () => {
        const roles = get().user?.roles || []
        return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
      },
    }),
    {
      name: 'moldy_admin_auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
)
