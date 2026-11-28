import { Outlet } from 'react-router'
import { ShieldCheck } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Moldy Market Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Management Portal for C2C Second-hand Marketplace
          </p>
        </div>

        <Outlet />

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Moldy Market. All rights reserved.
        </div>
      </div>
    </div>
  )
}
