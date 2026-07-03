import { getAdminAnalytics } from "@/components/actions/admin-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import {
  Users,
  Activity,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function TrendBadge({ trend }: { trend: number }) {
  const isPositive = trend >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-amber-400" : "text-slate-400"}`}
    >
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
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalSignups.toLocaleString()}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
              <TrendBadge trend={data.signupsTrend} />
              <span>vs previous 7 days ({data.signups7d} new)</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activeUsers7d.toLocaleString()}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
              <span className="text-foreground font-medium">
                {data.activeUsers30d.toLocaleString()}
              </span>
              <span>active in last 30d</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Solved */}
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalSolved.toLocaleString()}
            </div>
            <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
              <TrendBadge trend={data.solvesTrend} />
              <span>vs previous 7 days ({data.solves7d} new)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
