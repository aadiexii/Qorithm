import { Skeleton } from "@/components/molecules/skeleton";
import { Card, CardContent, CardHeader } from "@/components/molecules/card";

export default function OASectionLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      {/* Back link */}
      <Skeleton className="h-5 w-28" />
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Table card */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
