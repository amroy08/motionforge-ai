import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Terminal, HelpCircle } from "lucide-react";
import { requireActiveUser } from "@/lib/supabase/auth";
import { getStudioData } from "@/lib/studio/get-studio-data";
import { CreateStudio } from "@/components/studio/create-studio";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "AI Studio — Create Video",
  description: "Configure source image and motion parameters for AI video generation.",
};

export default async function CreatePage() {
  // Authorize user
  await requireActiveUser(routes.create);
  
  // Bootstrap data on the server side
  const res = await getStudioData();

  if (res.status === "configuration_error") {
    const isDbMissing = res.code === "database_not_configured";
    
    return (
      <div className="space-y-6 text-left max-w-xl mx-auto py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Studio Setup Required
          </h1>
          <p className="text-xs text-muted-foreground">
            The studio workspace is currently unavailable due to system setup constraints.
          </p>
        </div>

        <Alert variant="destructive" className="border-amber-500/20 bg-amber-500/5 text-amber-500">
          <AlertCircle className="h-4.5 w-4.5 text-amber-500" />
          <div className="text-left">
            <AlertTitle className="text-amber-500 font-bold">
              {isDbMissing ? "Database Migrations Pending" : "Configuration Error"}
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-500/90 mt-1 leading-normal">
              {res.message}
            </AlertDescription>
          </div>
        </Alert>

        {isDbMissing ? (
          <div className="rounded-xl border border-border/40 bg-card/40 p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <Terminal className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-foreground">Developer Quickstart Guide</p>
                <p className="text-muted-foreground leading-normal">
                  To initialize tables and RLS security policies locally, launch your Docker daemon and execute the following commands in your workspace root:
                </p>
              </div>
            </div>

            <pre className="text-[10px] text-muted-foreground font-mono bg-zinc-950/80 p-3 rounded-lg border border-border/20 overflow-x-auto leading-relaxed select-all">
              {`# 1. Start local Supabase containers
npx supabase start

# 2. Reset database schema and seed models
npx supabase db reset`}
            </pre>

            <div className="pt-2 border-t border-border/10 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                render={<Link href={routes.dashboard} />}
              >
                Back to Overview
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 bg-card/40 p-5 space-y-4 text-center">
            <p className="text-xs text-muted-foreground leading-normal">
              Ensure you have run migrations and seeded initial models. If this issue persists, contact the system administrator.
            </p>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                render={<Link href={routes.dashboard} />}
              >
                Back to Overview
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render main coordinator component
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create AI Video
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure image guides, prompts, and motion durations.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/40 px-2 py-0.5 rounded text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-fit">
          <HelpCircle className="h-3 w-3 text-primary shrink-0" />
          <span>Studio Setup Mode</span>
        </div>
      </div>

      <CreateStudio
        initialAssets={res.assets}
        models={res.models}
        walletBalance={res.walletBalance}
      />
    </div>
  );
}
