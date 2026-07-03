import { Skeleton } from "@/components/molecules/skeleton";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 flex flex-col items-stretch gap-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="text-center flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* POTD Card skeleton */}
      <Card className="bg-card/80 border-border/60">
        <CardHeader className="pb-3 flex flex-col items-start">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1.5 h-3.5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Card 1 */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-lg">
          <Skeleton className="h-3.5 w-24" />
          <div className="mt-3 mb-5">
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="mt-auto h-8 w-full rounded-lg" />
        </div>
        {/* Card 2 */}
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-lg">
          <Skeleton className="h-3.5 w-24" />
          <div className="mt-3 mb-5">
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="mt-auto h-8 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
