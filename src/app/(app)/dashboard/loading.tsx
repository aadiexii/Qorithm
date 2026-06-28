import { Card, CardContent, CardHeader } from "@/components/molecules/card";
import { Skeleton } from "@/components/molecules/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr_256px] lg:items-start">
        {/* Left rail skeleton */}
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="bg-border/40 h-px" />
          <div className="space-y-2.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="bg-border/40 h-px" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="bg-border/40 h-px" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Center skeleton */}
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="bg-card/80 border-border/60">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-1 h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full rounded-xl" />
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail skeleton */}
        <div className="flex flex-col gap-4">
          <Card className="bg-card/80 border-border/60">
            <CardHeader className="pb-4">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
              <div className="mt-3 flex justify-end gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/80 border-border/60">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="mt-1 h-3.5 w-16" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
