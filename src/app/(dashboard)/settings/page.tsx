import type { Metadata } from "next";
import { User, Shield, HelpCircle, Mail } from "lucide-react";

import { requireActiveUser, getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function SettingsPage() {
  const profile = await requireActiveUser(routes.settings);
  const user = await getCurrentUser();

  // Load name safely
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", profile.id)
    .single();

  return (
    <div className="space-y-6 text-left max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          View your database account details and system configurations.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Details */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center gap-2">
            <User className="h-4.5 w-4.5 text-primary shrink-0" />
            <CardTitle className="text-sm font-semibold">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 w-32">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Full Name:</span>
              </span>
              <span className="font-semibold text-foreground text-left w-full sm:text-right">
                {profileRow?.full_name || <span className="text-muted-foreground italic">None (Fallback)</span>}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/20 pt-4">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 w-32">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Email Address:</span>
              </span>
              <span className="font-semibold text-foreground text-left w-full sm:text-right truncate max-w-[280px]">
                {user?.email || "—"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/20 pt-4">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 w-32">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Role / Status:</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 sm:mt-0 sm:justify-end w-full">
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase border-primary/30 text-primary">
                  {profile.role}
                </Badge>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase border-emerald-500/30 text-emerald-400">
                  {profile.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl p-5 flex flex-col justify-between h-[180px]">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Editable Settings</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-normal mt-1">
              Editable profiles, email address changes, avatar picture uploads, password changes, and account deletions arrive in Phase 16.
            </p>
          </div>
          <div className="rounded border border-border/40 bg-muted/20 p-2 text-center text-[10px] text-muted-foreground">
            Account modification is not enabled yet.
          </div>
        </Card>
      </div>
    </div>
  );
}
