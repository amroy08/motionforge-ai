"use client";

import Link from "next/link";
import { Settings, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/(auth)/actions";
import { routes } from "@/config/navigation";

interface DashboardUserMenuProps {
  user: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: "user" | "admin";
  };
}

export function DashboardUserMenu({ user }: DashboardUserMenuProps) {
  // Initials generator
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none flex items-center gap-2 hover:opacity-95 transition-opacity">
        <Avatar className="h-8 w-8 border border-border/60 shadow-sm cursor-pointer select-none">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName || "User Avatar"} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold leading-none">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border/50 bg-popover/95 backdrop-blur-xl shadow-lg">
        <DropdownMenuLabel className="flex flex-col gap-0.5 text-left font-normal py-2 px-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground truncate max-w-[120px]">
              {user.fullName || "MotionForge Creator"}
            </span>
            {user.role === "admin" && (
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/20 bg-primary/5 text-primary tracking-wide font-bold">
                Admin
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        
        <DropdownMenuItem
          render={<Link href={routes.settings} />}
          className="cursor-pointer text-xs flex items-center py-2 px-2.5 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Account Settings</span>
        </DropdownMenuItem>

        {user.role === "admin" && (
          <DropdownMenuItem
            render={<Link href="/admin" />}
            className="cursor-pointer text-xs flex items-center py-2 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Admin Console</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem className="cursor-pointer text-xs py-2 px-2.5" onSelect={() => {}}>
          <form action={logoutAction} className="w-full">
            <button type="submit" className="w-full flex items-center gap-2 text-destructive hover:text-destructive focus:outline-none bg-transparent border-none p-0 cursor-pointer">
              <LogOut className="h-4 w-4 shrink-0 text-destructive" />
              <span>Log Out</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
