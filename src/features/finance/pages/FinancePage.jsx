import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Platform Revenue & Payouts
        </h1>
        <p className="text-sm text-muted-foreground">
          Review seller withdrawal requests, platform commission receipts, and buyer refund processing.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-muted-foreground" />
            Finance & Withdrawals Queue
          </CardTitle>
          <CardDescription>
            Connected to endpoints: <code>/api/v1/withdrawals/*</code> & <code>/api/v1/refunds/*</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Financial Operations Ready</p>
            <p className="text-xs mt-1">Approve, Complete, Reject withdrawal payouts in Phase 5.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
