"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreditBalancePill } from "./credit-balance-pill";
import { DashboardUserMenu } from "./dashboard-user-menu";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: "user" | "admin";
  };
  creditBalance: number | null;
}

export function DashboardHeader({ user, creditBalance }: DashboardHeaderProps) {
  const pathname = usePathname();

  // Determine breadcrumb labels based on current path
  let currentSegment = "Overview";
  if (pathname.startsWith("/create")) {
    currentSegment = "Create";
  } else if (pathname.startsWith("/generations")) {
    currentSegment = "Generations";
  } else if (pathname.startsWith("/assets")) {
    currentSegment = "Assets";
  } else if (pathname.startsWith("/billing")) {
    currentSegment = "Billing";
  } else if (pathname.startsWith("/settings")) {
    currentSegment = "Settings";
  } else if (pathname.startsWith("/admin")) {
    currentSegment = "Admin Console";
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Left side: Menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 focus:outline-none" />
        
        <Breadcrumb className="hidden sm:inline-block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                MotionForge
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentSegment}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: Credits + Create quick CTA + User menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Credit pill */}
        <CreditBalancePill balance={creditBalance} />

        {/* Create quick button */}
        {pathname !== "/create" && (
          <Button
            size="xs"
            className="shadow-sm shadow-primary/10 gap-1.5 hidden xs:inline-flex"
            render={<Link href="/create" />}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create</span>
          </Button>
        )}

        {/* User menu avatar */}
        <DashboardUserMenu user={user} />
      </div>
    </header>
  );
}
