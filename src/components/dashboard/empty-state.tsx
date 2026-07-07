"use client";

import Link from "next/link";
import { type LucideIcon, FileQuestion, Sparkles, FolderClosed, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  variant?: "generations" | "assets" | "subscription" | "database";
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  variant = "generations",
}: EmptyStateProps) {
  
  // Icon selector based on variant
  let Icon: LucideIcon = FileQuestion;
  let iconClass = "bg-primary/10 text-primary border-primary/20";
  
  if (variant === "generations") {
    Icon = Sparkles;
    iconClass = "bg-violet-500/10 text-violet-400 border-violet-500/20";
  } else if (variant === "assets") {
    Icon = FolderClosed;
    iconClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  } else if (variant === "database") {
    Icon = ShieldAlert;
    iconClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border/60 rounded-xl bg-card/10 backdrop-blur-sm min-h-[220px]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full border mb-4 ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed mx-auto">
        {description}
      </p>
      {actionText && actionHref && (
        <Button
          size="sm"
          className="mt-4"
          render={<Link href={actionHref} />}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
