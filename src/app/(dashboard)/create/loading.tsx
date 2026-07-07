import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateStudioLoading() {
  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto py-4">
      {/* Title skeleton */}
      <div className="flex flex-col gap-1.5 max-w-xs">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column Skeletons */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Source upload skeleton */}
            <div className="space-y-3 flex flex-col h-full">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Card className="border-border/40 bg-card/20 flex-1 flex flex-col justify-between">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                  <Skeleton className="h-8 w-full rounded mt-4" />
                </CardContent>
              </Card>
            </div>

            {/* Model & details selector skeletons */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <div className="grid gap-3 grid-cols-2">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded" />
                <div className="grid gap-2 grid-cols-3">
                  <Skeleton className="h-9 rounded-lg" />
                  <Skeleton className="h-9 rounded-lg" />
                  <Skeleton className="h-9 rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Prompt editor skeleton */}
          <Card className="border-border/40 bg-card/20">
            <CardContent className="p-4.5 space-y-3">
              <Skeleton className="h-4 w-1/6 rounded" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Cost Panel skeleton */}
        <div className="lg:col-span-4">
          <Card className="border-border/40 bg-card/20">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-4 w-1/2 rounded border-b pb-2" />
              <div className="space-y-2">
                <div className="flex justify-between"><Skeleton className="h-4 w-1/4 rounded" /><Skeleton className="h-4 w-1/5 rounded" /></div>
                <div className="flex justify-between"><Skeleton className="h-4 w-1/3 rounded" /><Skeleton className="h-4 w-1/5 rounded" /></div>
                <div className="flex justify-between pt-2 border-t"><Skeleton className="h-4 w-1/2 rounded" /><Skeleton className="h-4 w-1/5 rounded" /></div>
              </div>
              <Skeleton className="h-8 w-full rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
