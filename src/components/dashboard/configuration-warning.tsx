"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConfigurationWarningProps {
  category: "missing_environment" | "schema_missing" | "permission_denied" | "temporary_failure" | null;
}

export function ConfigurationWarning({ category }: ConfigurationWarningProps) {
  const isDev = process.env.NODE_ENV === "development";

  if (!category) return null;

  // Show detailed checklist only in development mode
  if (isDev) {
    return (
      <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10 text-amber-500 mb-6 text-left">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <AlertTitle className="text-amber-500 font-bold">Local Database Precondition Warning</AlertTitle>
          <AlertDescription className="text-amber-400/90 text-xs space-y-1 leading-normal">
            <p>The dashboard is loading in <strong>degraded mode</strong> because the required database tables do not exist or are unqueryable.</p>
            <p className="font-semibold mt-2">Next Steps for Developer:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure the Docker daemon is running on your machine.</li>
              <li>Execute <code>npx supabase start</code> to launch the local containers.</li>
              <li>Run <code>npx supabase db reset</code> to apply all Phase 3 & 4 migrations and seed data.</li>
              <li>Confirm the <code>credit_wallets</code>, <code>profiles</code>, and <code>generations</code> tables are successfully created.</li>
            </ul>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  // Generic messaging for production
  return (
    <Alert variant="destructive" className="border-border/30 bg-card/20 text-muted-foreground mb-6 text-left">
      <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="space-y-1">
        <AlertTitle className="text-foreground">Service Under Maintenance</AlertTitle>
        <AlertDescription className="text-xs">
          The dashboard metrics service is currently unavailable. Our engineers have been notified. Please try again later.
        </AlertDescription>
      </div>
    </Alert>
  );
}
