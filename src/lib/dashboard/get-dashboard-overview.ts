import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface DashboardGeneration {
  id: string;
  prompt: string | null;
  status: "draft" | "queued" | "processing" | "completed" | "failed" | "cancelled";
  generation_type: "text_to_image" | "image_to_image" | "text_to_video" | "image_to_video";
  aspect_ratio: string | null;
  duration_seconds: number | null;
  credits_charged: number;
  created_at: string;
  completed_at: string | null;
  model_name: string | null;
}

export interface DashboardOverview {
  schemaPending: boolean;
  errorCategory: "missing_environment" | "schema_missing" | "permission_denied" | "temporary_failure" | null;
  wallet: {
    balance: number;
  } | null;
  subscription: {
    status: string;
    billingCycle: string;
    currentPeriodEnd: string | null;
    plan: {
      name: string;
      slug: string;
    } | null;
  } | null;
  generationCounts: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
  };
  recentGenerations: DashboardGeneration[];
  dailyActivity: {
    date: string;
    count: number;
  }[];
}

/**
 * Safe conversion of Postgres bigint values to JavaScript numbers.
 * Enforces Number.MAX_SAFE_INTEGER safety check.
 */
function toSafeCreditNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  if (isNaN(num)) return 0;
  if (num > Number.MAX_SAFE_INTEGER) {
    return Number.MAX_SAFE_INTEGER;
  }
  return num;
}

/**
 * Fetch overview metrics and history for the authenticated user.
 * Error-safe: catches missing-table exceptions (Postgres code 42P01) to support
 * graceful degradation when Phase 3 migrations are not yet deployed.
 */
export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const supabase = await createClient();

  let schemaPending = false;
  let errorCategory: DashboardOverview["errorCategory"] = null;
  let walletData: DashboardOverview["wallet"] = null;
  let subscriptionData: DashboardOverview["subscription"] = null;
  
  const generationCounts = {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  };
  let recentGenerations: DashboardGeneration[] = [];
  const dailyActivity: DashboardOverview["dailyActivity"] = [];

  try {
    // 1. Query wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from("credit_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (walletError) {
      if (walletError.code === "42P01" || walletError.message?.includes("relation")) {
        schemaPending = true;
        errorCategory = "schema_missing";
      } else if (walletError.code === "PGRST116") {
        // Wallet row missing for user
        walletData = null;
      } else {
        errorCategory = "temporary_failure";
      }
    } else if (wallet) {
      walletData = {
        balance: toSafeCreditNumber(wallet.balance),
      };
    }

    // 2. Query subscription and joined plan
    if (!schemaPending) {
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .select(`
          status,
          billing_cycle,
          current_period_end,
          plans (
            name,
            slug
          )
        `)
        .eq("user_id", userId)
        .in("status", ["pending", "trialing", "active", "past_due", "paused"])
        .maybeSingle();

      if (subError) {
        if (subError.code === "42P01" || subError.message?.includes("relation")) {
          schemaPending = true;
          errorCategory = "schema_missing";
        }
      } else if (sub) {
        const planObj = sub.plans as unknown as { name: string; slug: string } | null;
        subscriptionData = {
          status: sub.status,
          billingCycle: sub.billing_cycle,
          currentPeriodEnd: sub.current_period_end,
          plan: planObj
            ? {
                name: planObj.name,
                slug: planObj.slug,
              }
            : null,
        };
      }
    }

    // 3. Query generation counts and list
    if (!schemaPending) {
      const { data: gens, error: gensError } = await supabase
        .from("generations")
        .select(`
          id,
          prompt,
          status,
          generation_type,
          aspect_ratio,
          duration_seconds,
          credits_charged,
          created_at,
          completed_at,
          ai_models (
            name
          )
        `)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .not("status", "eq", "draft")
        .order("created_at", { ascending: false });

      if (gensError) {
        if (gensError.code === "42P01" || gensError.message?.includes("relation")) {
          schemaPending = true;
          errorCategory = "schema_missing";
        }
      } else if (gens) {
        gens.forEach((gen) => {
          generationCounts.total++;
          if (gen.status === "completed") {
            generationCounts.completed++;
          } else if (gen.status === "queued" || gen.status === "processing") {
            generationCounts.processing++;
          } else if (gen.status === "failed") {
            generationCounts.failed++;
          }
        });

        // Slice for recent (max 6)
        recentGenerations = gens.slice(0, 6).map((gen) => {
          const modelObj = gen.ai_models as unknown as { name: string } | null;
          return {
            id: gen.id,
            prompt: gen.prompt,
            status: gen.status as DashboardGeneration["status"],
            generation_type: gen.generation_type as DashboardGeneration["generation_type"],
            aspect_ratio: gen.aspect_ratio,
            duration_seconds: gen.duration_seconds,
            credits_charged: toSafeCreditNumber(gen.credits_charged),
            created_at: gen.created_at,
            completed_at: gen.completed_at,
            model_name: modelObj ? modelObj.name : null,
          };
        });

        // 4. Generate 7-day activity metrics (Mon-Sun activity counts)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d;
        }).reverse();

        last7Days.forEach((date) => {
          const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
          const matchCount = gens.filter((gen) => {
            const genDate = new Date(gen.created_at);
            return genDate.toDateString() === date.toDateString();
          }).length;

          dailyActivity.push({
            date: dateStr,
            count: matchCount,
          });
        });
      }
    }

  } catch {
    schemaPending = true;
    errorCategory = "schema_missing";
  }

  return {
    schemaPending,
    errorCategory,
    wallet: walletData,
    subscription: subscriptionData,
    generationCounts,
    recentGenerations,
    dailyActivity,
  };
}
