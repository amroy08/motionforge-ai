"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { routes } from "@/config/navigation";

export default function CreateStudioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized warning to dev console
    console.error("AI Create Studio error bound:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center p-4">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            An unexpected error occurred while loading the AI Studio workspace.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          <p className="text-[10px] text-muted-foreground font-mono bg-zinc-950/40 p-2.5 rounded border border-border/10 max-h-24 overflow-y-auto">
            {error.message || "Unknown error category"}
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-xs gap-1.5"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
            <Button
              size="sm"
              className="text-xs gap-1.5"
              render={<Link href={routes.dashboard} />}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Go to Overview</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
