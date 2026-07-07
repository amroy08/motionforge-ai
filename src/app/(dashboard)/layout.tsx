import "server-only";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requireActiveUser, getCurrentUser } from "@/lib/supabase/auth";
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authoritative Server-side Authorization Check
  const profile = await requireActiveUser(routes.dashboard);
  const user = await getCurrentUser();

  // 2. Fetch profile full name and avatar safely
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", profile.id)
    .single();

  // 3. Load Dashboard overview metrics safely for Header & Sidebar context
  const overview = await getDashboardOverview(profile.id);

  // Safe dashboard user contract structure (exposes no raw session secrets)
  const safeUser = {
    id: profile.id,
    email: user?.email || profile.id, 
    fullName: profileRow?.full_name || null,
    avatarUrl: profileRow?.avatar_url || null,
    role: profile.role,
  };

  // Resolve additional metadata if database profile is fully populated
  const creditBalance = overview.wallet ? overview.wallet.balance : null;
  const planName = overview.subscription?.plan ? overview.subscription.plan.name : "Free";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Collage App Sidebar */}
        <AppSidebar
          user={safeUser}
          creditBalance={creditBalance}
          planName={planName}
        />

        {/* Outer content container */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Dashboard top header */}
          <DashboardHeader
            user={safeUser}
            creditBalance={creditBalance}
          />

          {/* Inner content viewport */}
          <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
