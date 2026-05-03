import { getAdminAnalytics } from "@/features/admin/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CheckCircle, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

function TrendBadge({ trend }: { trend: number }) {
  const isPositive = trend >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(trend).toFixed(1)}%
    </div>
  );
}

export default async function AdminPage() {
  const data = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Platform key performance indicators and growth metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Signups */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSignups.toLocaleString()}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendBadge trend={data.signupsTrend} />
              <span>vs previous 7 days ({data.signups7d} new)</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Users */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers7d.toLocaleString()}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{data.activeUsers30d.toLocaleString()}</span>
              <span>active in last 30d</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Solved */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSolved.toLocaleString()}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendBadge trend={data.solvesTrend} />
              <span>vs previous 7 days ({data.solves7d} new)</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Solve Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completionRate}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {data.totalAttempted.toLocaleString()} total problem attempts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
