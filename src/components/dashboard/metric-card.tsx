"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  loading = false,
}: MetricCardProps) {
  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-xl relative overflow-hidden h-[115px] flex flex-col justify-between">
      {loading ? (
        <CardContent className="p-4 space-y-2.5">
          <Skeleton className="h-4 w-24 bg-muted/40" />
          <Skeleton className="h-7 w-16 bg-muted/40" />
          <Skeleton className="h-3 w-32 bg-muted/40" />
        </CardContent>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="pb-4 pt-1 px-4 text-left">
            <div className="text-2xl font-bold text-foreground leading-none">
              {value}
            </div>
            {description && (
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">
                {description}
              </p>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
