import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Dispute Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Adjudicate disputes between buyers and sellers, review image evidence, and issue refund decisions.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Adjudication Center
          </CardTitle>
          <CardDescription>
            Connected to endpoints: <code>/api/v1/disputes/admin/*</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Dispute Adjudication Ready</p>
            <p className="text-xs mt-1">Approve / Reject review decisions with Escrow auto-trigger in Phase 4.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
