import React from 'react'
import { BrowserRouter } from 'react-router'
import QueryProvider from '@/app/providers/QueryProvider'
import AppRoutes from '@/app/router/AppRoutes'

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryProvider>
  )
}
