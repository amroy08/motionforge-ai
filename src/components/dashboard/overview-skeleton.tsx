"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome header skeleton */}
      <div className="space-y-2 text-left">
        <Skeleton className="h-6 w-56 bg-muted/40" />
        <Skeleton className="h-4 w-72 bg-muted/40" />
      </div>

      {/* Metrics Cards Grid (4 columns) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/50 bg-card/30 h-[115px] flex flex-col justify-between">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20 bg-muted/40" />
              <Skeleton className="h-7 w-12 bg-muted/40" />
              <Skeleton className="h-3.5 w-32 bg-muted/40" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart + Plan overview panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity skeleton */}
        <Card className="border-border/50 bg-card/30 lg:col-span-2 h-[260px] flex flex-col justify-between">
          <CardHeader className="pb-2 pt-4 px-4">
            <Skeleton className="h-4 w-32 bg-muted/40" />
          </CardHeader>
          <CardContent className="pb-4 pt-2 px-4 flex items-end justify-between h-[180px] gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton
                  className="w-full bg-muted/40 rounded-t"
                  style={{
                    height: `${[20, 60, 40, 80, 50, 10, 30][i]}px`,
                  }}
                />
                <Skeleton className="h-3 w-8 bg-muted/40" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upgrade/Plan skeleton */}
        <Card className="border-border/50 bg-card/30 h-[260px] flex flex-col justify-between p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-muted/40" />
            <Skeleton className="h-7 w-48 bg-muted/40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-muted/40" />
            <Skeleton className="h-3 w-5/6 bg-muted/40" />
            <Skeleton className="h-3 w-4/6 bg-muted/40" />
          </div>
          <Skeleton className="h-8.5 w-full bg-muted/40 rounded-lg" />
        </Card>
      </div>

      {/* Recent Generations Grid */}
      <div className="space-y-4 text-left">
        <Skeleton className="h-5 w-40 bg-muted/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/30 h-[160px] flex flex-col justify-between p-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full bg-muted/40" />
                <Skeleton className="h-3.5 w-3/4 bg-muted/40" />
              </div>
              <div className="flex items-center justify-between border-t border-border/20 pt-3">
                <Skeleton className="h-4 w-16 bg-muted/40" />
                <Skeleton className="h-3 w-20 bg-muted/40" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
