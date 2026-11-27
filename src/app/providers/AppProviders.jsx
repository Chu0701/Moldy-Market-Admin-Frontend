import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'

import { queryClient } from '@/app/providers/queryClient'
import i18n from '@/i18n'

/** @param {{ children: import('react').ReactNode }} props */
export function AppProviders({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  )
}
