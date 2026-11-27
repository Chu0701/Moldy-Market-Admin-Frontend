import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '@/state/authStore'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, logout } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/40">
        <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl p-6 text-center space-y-4 shadow-sm">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            Your account is authenticated, but you do not hold Administrator privileges for Moldy Market.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
          >
            Sign in with another account
          </Button>
        </div>
      </div>
    )
  }

  return children
}
