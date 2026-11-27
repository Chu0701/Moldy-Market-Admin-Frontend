import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = error?.status
          if (status === 401 || status === 403 || status === 404) return false
          return failureCount < 1
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
