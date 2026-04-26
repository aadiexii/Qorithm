import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8 animate-pulse">
      {/* Back Link Skeleton */}
      <div className="h-5 w-24 rounded bg-white/10" />

      {/* Header Block Skeleton */}
      <div className="space-y-4">
        <div className="h-10 w-64 rounded-lg bg-white/10 sm:w-96" />
        <div className="h-6 w-full max-w-3xl rounded bg-white/5" />
        <div className="h-6 w-3/4 max-w-2xl rounded bg-white/5" />

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-6">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-1.5 w-full max-w-xs rounded-full bg-white/10" />
        </div>
      </div>

      {/* Problem Table Skeleton */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <div className="h-6 w-48 rounded bg-white/10" />
          <div className="h-4 w-72 rounded bg-white/5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header mock */}
            <div className="flex h-10 w-full rounded bg-white/5" />
            {/* Table Rows mock */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex h-14 w-full rounded bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
