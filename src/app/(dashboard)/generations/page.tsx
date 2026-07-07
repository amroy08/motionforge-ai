import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle, AlertCircle, FileVideo } from "lucide-react";

import { requireActiveUser } from "@/lib/supabase/auth";
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Generations Library",
};

export default async function GenerationsPage() {
  const profile = await requireActiveUser(routes.generations);
  const overview = await getDashboardOverview(profile.id);

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/5 text-emerald-400 gap-1 text-[10px]">
            <CheckCircle2 className="h-3 w-3" />
            <span>Success</span>
          </Badge>
        );
      case "queued":
      case "processing":
        return (
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/5 text-blue-400 gap-1 text-[10px]">
            <Clock className="h-3 w-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="border-destructive/30 bg-destructive/5 text-destructive gap-1 text-[10px]">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="border-zinc-500/30 bg-zinc-500/5 text-zinc-400 gap-1 text-[10px]">
            <AlertCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-zinc-500/30 bg-zinc-500/5 text-zinc-400 text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  const hasGenerations = overview.recentGenerations.length > 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Generations Library
        </h1>
        <p className="text-xs text-muted-foreground">
          Your complete database history of AI generated images and video sequences.
        </p>
      </div>

      {/* Library list */}
      {!hasGenerations ? (
        <EmptyState
          title="No Creations Yet"
          description="Your generations library is currently empty. Go to the studio workspace to start creating."
          actionText="Create Video"
          actionHref="/create"
          variant="generations"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overview.recentGenerations.map((gen) => (
            <Card key={gen.id} className="border-border/50 bg-card/30 flex flex-col justify-between h-[180px] relative overflow-hidden">
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                    {gen.generation_type.replace(/_/g, " ")}
                  </span>
                  {getStatusBadge(gen.status)}
                </div>
                <p className="text-xs text-foreground line-clamp-3 leading-normal font-medium">
                  {gen.prompt || <span className="text-muted-foreground italic">No prompt provided</span>}
                </p>
              </div>

              <div className="px-4 pb-3 pt-2.5 border-t border-border/20 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileVideo className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{gen.duration_seconds || "—"}s</span>
                  <span>•</span>
                  <span>{gen.aspect_ratio || "—"}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {gen.credits_charged} credits
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Warning limitation notice */}
      <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center max-w-xl mx-auto">
        <p className="text-xs font-semibold text-foreground">Generations Library arrives in Phase 12</p>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
          Advanced searching, filtering options, pagination controls, history deletions, retries, and media asset preview downloads will be implemented in Phase 12.
        </p>
      </div>
    </div>
  );
}
