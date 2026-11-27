import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Order Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Track fulfillment progress: Shipping orders, Delivered confirmations, and COD collections.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-muted-foreground" />
            Fulfillment & Operations
          </CardTitle>
          <CardDescription>
            Connected to endpoints: <code>/api/v1/orders/admin/*</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Order Operations Ready</p>
            <p className="text-xs mt-1">Start Shipping, Mark Delivered, and COD Collection triggers in Phase 4.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
