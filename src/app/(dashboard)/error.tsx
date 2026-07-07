"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  React.useEffect(() => {
    // Log sanitized error trace internally in development context
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard Boundary Error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5 backdrop-blur-xl relative overflow-hidden">
        {/* Glowing red accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-destructive" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 text-center">
          <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
            An unexpected error occurred while loading your dashboard resources. Please try again.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              size="sm"
              onClick={reset}
              className="shadow-sm gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              render={<Link href={routes.home} />}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Go Home</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
