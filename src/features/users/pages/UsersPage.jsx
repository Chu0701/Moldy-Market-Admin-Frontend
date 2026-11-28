import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users as UsersIcon } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Users Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View user accounts, verify roles, inspect trust points, and lock/unlock accounts.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5 text-muted-foreground" />
            Users Directory
          </CardTitle>
          <CardDescription>
            Module connected to backend API: <code>/api/v1/users</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            <p className="font-medium text-foreground">User Management Table Ready for Phase 2</p>
            <p className="text-xs mt-1">Data fetching and status toggle actions will be wired up next.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
