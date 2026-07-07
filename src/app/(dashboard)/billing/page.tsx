import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { requireActiveUser } from "@/lib/supabase/auth";
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Billing & Plans",
};

export default async function BillingPage() {
  const profile = await requireActiveUser(routes.billing);
  const overview = await getDashboardOverview(profile.id);

  const planName = overview.subscription?.plan ? overview.subscription.plan.name : "Free";
  const creditBalance = overview.wallet ? overview.wallet.balance : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Billing & Subscription
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your subscription plans, credits usage logs, and billing invoice details.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Plan Overview */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl md:col-span-2 flex flex-col justify-between p-5 text-left h-[200px]">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Active Tier
              </span>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[10px] font-bold">
                {planName}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {planName} Subscription Plan
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm leading-normal">
              {planName.toLowerCase() === "free"
                ? "You are using the default evaluation plan level. Credits are one-time welcome allocations only."
                : "Your paid subscription details are actively synchronized with our payment gateways."}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border/20 pt-4 text-xs">
            <span className="text-muted-foreground">Credits Remaining:</span>
            <span className="font-bold text-foreground">{creditBalance.toLocaleString()} credits</span>
          </div>
        </Card>

        {/* Informational warning */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl p-5 flex flex-col justify-between h-[200px]">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Billing Settings</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-normal mt-1">
              Razorpay payment forms, transaction listings, invoice downloads, plan level upgrades, and downgrade cancellations arrive in Phase 14.
            </p>
          </div>
          <div className="rounded border border-border/40 bg-muted/20 p-2 text-center text-[10px] text-muted-foreground">
            Billing management is not enabled yet.
          </div>
        </Card>
      </div>

      {/* Plans catalog list (locked mockups) */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Available Subscriptions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Free", "Starter", "Creator"].map((name) => (
            <Card key={name} className="border-border/50 bg-card/20 p-4 opacity-50 relative select-none pointer-events-none text-left flex flex-col justify-between h-[180px]">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-foreground">{name} Plan</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-3">
                  {name === "Free" && "Welcome credits to get started with image and video generations."}
                  {name === "Starter" && "For creators getting started. Regular credit allocation and priority queues."}
                  {name === "Creator" && "For professional scaling. Highest concurrent GPU rendering slots."}
                </p>
              </div>
              <div className="border-t border-border/20 pt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {name === "Free" ? "Free" : "Pricing TBD"}
                </span>
                {planName === name && (
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[9px] py-0 px-1">
                    Active
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
