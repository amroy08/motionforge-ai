"use client";

import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditBalancePillProps {
  balance: number | null;
  className?: string;
  hideIcon?: boolean;
}

export function CreditBalancePill({
  balance,
  className,
  hideIcon = false,
}: CreditBalancePillProps) {
  // Format the balance with standard thousands separator
  const formattedBalance = balance !== null ? balance.toLocaleString() : "—";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge
              variant="outline"
              className={`border-primary/20 bg-primary/5 text-primary text-[10px] tracking-wide font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-help hover:bg-primary/10 transition-colors ${className}`}
            >
              {!hideIcon && <Coins className="h-3 w-3 text-primary shrink-0" />}
              <span>{formattedBalance} credits</span>
            </Badge>
          }
        />
        <TooltipContent className="bg-popover border border-border/60 text-xs py-1 px-2.5 rounded text-foreground font-medium shadow-md">
          {balance !== null
            ? `You have ${balance.toLocaleString()} generation credits available.`
            : "Credit information is currently unavailable."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
