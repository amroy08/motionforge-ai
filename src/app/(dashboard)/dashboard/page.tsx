import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Coins,
  Video,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileVideo,
  ArrowUpRight,
} from "lucide-react";

import { requireActiveUser } from "@/lib/supabase/auth";
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfigurationWarning } from "@/components/dashboard/configuration-warning";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Dashboard Overview",
};

export default async function DashboardPage() {
  const profile = await requireActiveUser(routes.dashboard);
  const overview = await getDashboardOverview(profile.id);

  // Status mapping colors & icons
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

  // Safe credit formats
  const formattedBalance = overview.wallet ? overview.wallet.balance.toLocaleString() : "—";
  const planName = overview.subscription?.plan ? overview.subscription.plan.name : "Free";

  // Max value for CSS activity bars
  const maxActivity = Math.max(...overview.dailyActivity.map((d) => d.count), 1);

  return (
    <div className="space-y-6 text-left">
      {/* Configuration Precondition Warning Alert */}
      {overview.schemaPending && (
        <ConfigurationWarning category={overview.errorCategory} />
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitor your credit allocations, subscription plan features, and AI generation history.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Available Credits"
          value={formattedBalance}
          description="Used to run AI generation requests"
          icon={Coins}
        />
        <MetricCard
          title="Current Plan"
          value={planName}
          description={
            overview.subscription?.currentPeriodEnd
              ? `Renews ${new Date(overview.subscription.currentPeriodEnd).toLocaleDateString()}`
              : "Free Tier Plan"
          }
          icon={Sparkles}
        />
        <MetricCard
          title="Total Generations"
          value={overview.generationCounts.total}
          description="All time requests excluding drafts"
          icon={Video}
        />
        <MetricCard
          title="Successful Generations"
          value={overview.generationCounts.completed}
          description="Successfully compiled sequences"
          icon={CheckCircle2}
        />
      </div>

      {/* Middle grid: 7-day activity & Subscription Upgrade Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* CSS-based Activity Bar Graph */}
        <Card className="border-border/50 bg-card/30 lg:col-span-2 flex flex-col justify-between h-[280px]">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-col gap-0.5">
            <CardTitle className="text-sm font-semibold">Generation Activity</CardTitle>
            <CardDescription className="text-[10px]">Requests count for the last 7 calendar days (UTC)</CardDescription>
          </CardHeader>
          <CardContent className="pb-4 pt-2 px-4 flex items-end justify-between h-[180px] gap-3">
            {overview.dailyActivity.map((day) => {
              const pct = (day.count / maxActivity) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                  <div className="relative w-full flex flex-col justify-end h-[110px]">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border/80 text-[10px] px-1.5 py-0.5 rounded text-foreground font-semibold shrink-0 z-10 whitespace-nowrap shadow-sm pointer-events-none">
                      {day.count} {day.count === 1 ? "gen" : "gens"}
                    </div>
                    {/* CSS Bar */}
                    <div
                      className="w-full bg-primary/20 group-hover:bg-primary/40 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upgrade Card / Details */}
        <Card className="border-border/50 bg-card/30 flex flex-col justify-between p-4 h-[280px] relative overflow-hidden">
          {/* Subtle decoration gradient */}
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-3 text-left">
            <Badge variant="outline" className="text-[9px] uppercase border-primary/30 text-primary bg-primary/5 font-bold">
              Account Summary
            </Badge>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Scale your video creations
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock concurrent GPU rendering channels, priority processing queues, and higher credit allocations.
            </p>
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between text-xs border-t border-border/20 pt-3">
              <span className="text-muted-foreground">Plan Level:</span>
              <span className="font-semibold text-foreground">{planName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Simultaneous Limits:</span>
              <span className="font-semibold text-foreground">
                {planName.toLowerCase() === "free" ? "1 GPU thread" : "Priority channel"}
              </span>
            </div>
          </div>

          <Link
            href="/billing"
            className="mt-4 flex items-center justify-center gap-1.5 w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 px-3 rounded-lg text-xs transition-colors"
          >
            <span>Manage Billing</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Recent Generations Area */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Recent Generations
          </h2>
          {overview.recentGenerations.length > 0 && (
            <Link href="/generations" className="text-xs text-primary hover:underline font-medium">
              View library →
            </Link>
          )}
        </div>

        {overview.recentGenerations.length === 0 ? (
          <EmptyState
            title="No Generations Found"
            description="You haven't generated any AI video sequences yet. Hop into the studio to create your first video."
            actionText="Start Creating"
            actionHref="/create"
            variant="generations"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {overview.recentGenerations.map((gen) => (
              <Card key={gen.id} className="border-border/50 bg-card/30 flex flex-col justify-between h-[175px] relative overflow-hidden group hover:border-primary/20 transition-colors">
                <div className="p-4 space-y-2.5 text-left">
                  {/* Status header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                      {gen.generation_type.replace(/_/g, " ")}
                    </span>
                    {getStatusBadge(gen.status)}
                  </div>
                  {/* Prompt preview */}
                  <p className="text-xs text-foreground line-clamp-3 leading-normal font-medium pr-1">
                    {gen.prompt || <span className="text-muted-foreground italic">No prompt provided</span>}
                  </p>
                </div>

                <div className="px-4 pb-3 pt-2.5 border-t border-border/20 bg-muted/10 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileVideo className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
      </div>
    </div>
  );
}
