"use client";

import React from "react";
import Link from "next/link";
import { Coins, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/navigation";

interface CreditEstimateCardProps {
  estimatedCost: string;
  walletBalance: string;
  disabled?: boolean;
}

export function CreditEstimateCard({
  estimatedCost,
  walletBalance,
  disabled = false,
}: CreditEstimateCardProps) {
  const balance = BigInt(walletBalance);
  const cost = BigInt(estimatedCost);
  const hasSufficient = balance >= cost;
  const remaining = hasSufficient ? balance - cost : BigInt(0);

  return (
    <Card className="border-border/50 bg-card/20 backdrop-blur-md overflow-hidden relative">
      {/* Decorative vertical colored stripe */}
      <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${hasSufficient ? "bg-primary" : "bg-destructive"}`} />
      
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs border-b border-border/10 pb-2">
          <Coins className="h-4 w-4 text-primary shrink-0" />
          <span>Estimated Credits Breakdown</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Estimated Cost:</span>
            <span className="font-bold text-foreground">{estimatedCost} credits</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span>Your Balance:</span>
            <span className="font-semibold text-foreground">{walletBalance} credits</span>
          </div>

          <div className="flex justify-between items-center border-t border-border/10 pt-2 text-muted-foreground font-medium">
            <span>Estimated Remaining:</span>
            <span className={`font-bold ${hasSufficient ? "text-emerald-400" : "text-destructive"}`}>
              {remaining.toString()} credits
            </span>
          </div>
        </div>

        {/* Insufficient balance message */}
        {!hasSufficient && !disabled && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex gap-2 text-left text-[10px] text-destructive leading-normal">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Insufficient Credit Balance</p>
              <p className="text-muted-foreground">
                You need { (cost - balance).toString() } more credits. Top up your wallet in the billing section to continue.
              </p>
              <Button
                variant="link"
                size="xs"
                className="text-destructive font-bold hover:underline p-0 h-auto text-[9px] mt-1"
                render={<Link href={routes.billing} />}
              >
                Go to Billing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
