"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

type HeatmapData = {
  day: string;
  count: number;
};

export function SolveHeatmap({ data }: { data: HeatmapData[] }) {
  // We want to show the last 140 days (20 weeks)
  const daysToShow = 140;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToShow + 1);

  // Normalize data into a map for fast lookup
  const solvesMap = new Map<string, number>();
  data.forEach((d) => {
    // d.day might come as full ISO string or just date depending on SQL output
    const dateStr = new Date(d.day).toISOString().split("T")[0];
    solvesMap.set(dateStr, d.count);
  });

  // Generate the days array
  const daysArray = Array.from({ length: daysToShow }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      count: solvesMap.get(dateStr) || 0,
    };
  });

  // Calculate intensity based on solves
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-white/5 border border-white/10";
    if (count === 1) return "bg-emerald-900 border border-emerald-800/50";
    if (count <= 3) return "bg-emerald-700 border border-emerald-600/50";
    if (count <= 5) return "bg-emerald-500 border border-emerald-400";
    return "bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]";
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-emerald-500" /> Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
              {daysArray.map((day) => (
                <div
                  key={day.date}
                  title={`${day.count} solve${day.count === 1 ? '' : 's'} on ${day.date}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-1 hover:ring-offset-background cursor-pointer ${getIntensityClass(
                    day.count
                  )}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded-sm bg-white/5 border border-white/10" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-900 border border-emerald-800/50" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-700 border border-emerald-600/50" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-400" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
