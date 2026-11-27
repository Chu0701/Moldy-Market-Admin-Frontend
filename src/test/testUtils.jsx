import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { MemoryRouter, Route, Routes } from 'react-router'

import i18n from '@/i18n'

/**
 * Renders a component with fresh QueryClient, MemoryRouter, and i18n providers.
 * @param {import('react').ReactElement} ui
 * @param {{ route?: string, path?: string }} [options]
 */
export function renderWithProviders(ui, { route = '/', path } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const content = path ? (
    <Routes>
      <Route path={path} element={ui} />
    </Routes>
  ) : (
    ui
  )

  return {
    queryClient,
    ...render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
        </QueryClientProvider>
      </I18nextProvider>,
    ),
  }
}
