import React from 'react'
import { Link } from 'react-router'
import {
  TrendingUp,
  Users,
  Store,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Platform Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time business performance and pending administrative actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">
              <ShoppingBag className="size-3.5 mr-1" /> View Shipping Orders
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/disputes">
              <AlertTriangle className="size-3.5 mr-1" /> Review Disputes
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform Revenue */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Est. Platform Commission
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₫ 12,450,000</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-medium">
              <ArrowUpRight className="size-3" />
              <span>+14.2%</span>
              <span className="text-muted-foreground font-normal">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Active Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,280</div>
            <p className="text-xs text-muted-foreground mt-1">
              98 verified accounts this week
            </p>
          </CardContent>
        </Card>

        {/* Stores */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Stores
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Store className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">342</div>
            <p className="text-xs text-muted-foreground mt-1">
              12 pending approval
            </p>
          </CardContent>
        </Card>

        {/* Active Disputes */}
        <Card className="border-border shadow-xs border-amber-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Open Disputes
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires admin adjudication
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Revenue & Pending Admin Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Escrow Health */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Escrow & Settlement</CardTitle>
                <CardDescription>
                  Real-time status of funds held in escrow and marketplace transactions
                </CardDescription>
              </div>
              <Badge variant="outline">Escrow Protection Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <div>
                <span className="text-xs text-muted-foreground">Escrow Balance Held</span>
                <p className="text-lg font-bold text-foreground mt-0.5">₫ 48,200,000</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Settled to Sellers</span>
                <p className="text-lg font-bold text-foreground mt-0.5">₫ 182,340,000</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Commission Rate</span>
                <p className="text-lg font-bold text-foreground mt-0.5">5.0%</p>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administrative Shortcuts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button variant="outline" className="justify-start text-xs h-auto py-2" asChild>
                  <Link to="/products">
                    <Package className="size-3.5 mr-2 text-muted-foreground" />
                    Moderate Products
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start text-xs h-auto py-2" asChild>
                  <Link to="/users">
                    <Users className="size-3.5 mr-2 text-muted-foreground" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start text-xs h-auto py-2" asChild>
                  <Link to="/finance">
                    <ShieldAlert className="size-3.5 mr-2 text-muted-foreground" />
                    Review Withdrawals
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Action Queue */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Pending Actions
            </CardTitle>
            <CardDescription>
              High-priority items awaiting admin review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between p-3 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Dispute #ORD-9821</p>
                <p className="text-[11px] text-muted-foreground">Reason: ITEM_NOT_RECEIVED</p>
              </div>
              <Badge variant="warning">Review</Badge>
            </div>

            <div className="flex items-start justify-between p-3 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Withdrawal #WD-104</p>
                <p className="text-[11px] text-muted-foreground">₫ 2,500,000 · Store: TechVibe</p>
              </div>
              <Badge variant="info">Pending Payout</Badge>
            </div>

            <div className="flex items-start justify-between p-3 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">Order #ORD-9810</p>
                <p className="text-[11px] text-muted-foreground">Ready to start shipping</p>
              </div>
              <Badge variant="secondary">Dispatch</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
