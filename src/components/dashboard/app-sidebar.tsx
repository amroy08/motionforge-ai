"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { CreditBalancePill } from "./credit-balance-pill";
import { DashboardUserMenu } from "./dashboard-user-menu";
import { dashboardNavigation } from "@/config/dashboard-navigation";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: "user" | "admin";
  };
  creditBalance: number | null;
  planName: string | null;
}

export function AppSidebar({ user, creditBalance, planName }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-zinc-950/80 backdrop-blur-xl">
      {/* Sidebar Header: Logo */}
      <SidebarHeader className="flex h-14 items-center justify-between px-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/10">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              {siteConfig.name}
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Sidebar Content: Navigation Links */}
      <SidebarContent className="px-2 py-4 flex flex-col gap-6">
        <SidebarMenu className="gap-1">
          {dashboardNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.title}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 select-none ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Dynamic usage statistics/upgrade cards when sidebar is expanded */}
        {!isCollapsed && (
          <div className="mt-auto px-2 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/30 p-3.5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Current Plan
                </span>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-primary/20 bg-primary/5 text-primary">
                  {planName || "Free"}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground leading-normal">Credits Remaining:</p>
                <div className="flex items-center">
                  <CreditBalancePill balance={creditBalance} hideIcon />
                </div>
              </div>
              {(!planName || planName.toLowerCase() === "free") && (
                <Link
                  href="/billing"
                  className="block text-center text-[10px] font-bold text-primary hover:underline"
                >
                  Upgrade to Starter →
                </Link>
              )}
            </div>
          </div>
        )}
      </SidebarContent>

      {/* Sidebar Footer: User profile widget */}
      <SidebarFooter className="p-3 border-t border-border/40 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 truncate">
          <DashboardUserMenu user={user} />
          {!isCollapsed && (
            <div className="flex flex-col text-left truncate max-w-[110px]">
              <span className="text-xs font-semibold text-foreground truncate">
                {user.fullName || "Creator"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
