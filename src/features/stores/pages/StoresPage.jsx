import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Store } from 'lucide-react'

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Store Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor marketplace shops, verify seller details, and manage store statuses.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5 text-muted-foreground" />
            Registered Stores
          </CardTitle>
          <CardDescription>
            Connected to endpoint: <code>/api/v1/stores</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Store Management Module Ready</p>
            <p className="text-xs mt-1">Status management (ACTIVE / BLOCKED) will be wired in Phase 2.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
