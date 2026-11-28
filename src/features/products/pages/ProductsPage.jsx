import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Product Post Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review C2C second-hand listings, verify item condition, and remove violating posts.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5 text-muted-foreground" />
            Product Moderation Queue
          </CardTitle>
          <CardDescription>
            Connected to endpoint: <code>/api/v1/products</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">Product Moderation Ready</p>
            <p className="text-xs mt-1">Actions: Remove with reason & Restore will be connected in Phase 3.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
