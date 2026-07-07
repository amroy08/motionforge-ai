"use client";

import React from "react";
import Image from "next/image";
import { Edit2, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewDetails {
  sourceAssetId: string;
  sourcePreviewUrl: string;
  modelId: string;
  modelName: string;
  prompt: string;
  negativePrompt: string | null;
  durationSeconds: number;
  aspectRatio: string;
  estimatedCredits: string;
  walletBalance: string;
  estimatedRemainingBalance: string;
  hasSufficientCredits: boolean;
}

interface GenerationReviewCardProps {
  review: ReviewDetails;
  onEdit: () => void;
}

export function GenerationReviewCard({
  review,
  onEdit,
}: GenerationReviewCardProps) {
  return (
    <Card className="border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Decorative vertical stripe */}
      <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-emerald-500" />

      <CardContent className="p-4 space-y-4">
        {/* Header confirmation banner */}
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-foreground">Settings Validated & Ready</h4>
            <p className="text-[9px] text-emerald-400/80">Authoritative server review check complete.</p>
          </div>
        </div>

        {/* Overview Layout Grid */}
        <div className="flex flex-col sm:flex-row gap-4 border-y border-border/10 py-3 text-left">
          {/* Left: Refreshed preview thumbnail */}
          <div className="h-28 w-44 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-border/40 relative flex items-center justify-center mx-auto sm:mx-0">
            <Image
              src={review.sourcePreviewUrl}
              alt="Validated image preview"
              width={176}
              height={112}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right: Technical specifications summary details */}
          <div className="space-y-2 flex-1 w-full text-xs">
            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-[10px]">
              <div>
                <span className="text-muted-foreground">Model:</span>{" "}
                <span className="font-semibold text-foreground truncate block max-w-[120px]">{review.modelName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Aspect Ratio:</span>{" "}
                <span className="font-semibold text-foreground block">{review.aspectRatio}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>{" "}
                <span className="font-semibold text-foreground block">{review.durationSeconds} seconds</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Cost:</span>{" "}
                <span className="font-bold text-foreground block">{review.estimatedCredits} credits</span>
              </div>
            </div>

            {/* Prompt details */}
            <div className="border-t border-border/5 pt-1.5 space-y-1">
              <span className="text-[9px] text-muted-foreground block font-medium">Prompt:</span>
              <p className="text-[10px] text-foreground leading-normal line-clamp-3 italic bg-zinc-950/40 p-2 rounded border border-border/5">
                &ldquo;{review.prompt}&rdquo;
              </p>
            </div>

            {/* Negative prompt details if present */}
            {review.negativePrompt && (
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground block font-medium">Negative Prompt:</span>
                <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2 italic bg-zinc-950/40 p-1.5 rounded border border-border/5">
                  &ldquo;{review.negativePrompt}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status explanation note */}
        <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-left space-y-1">
          <p className="text-[10px] font-semibold text-foreground">Next Phase Notice</p>
          <p className="text-[9px] text-muted-foreground leading-normal">
            Your settings are valid and ready. Generation submission and secure credit charging will be enabled in the next implementation phases.
          </p>
        </div>

        {/* Buttons footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs w-full sm:w-auto gap-1 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Settings</span>
          </Button>

          {/* Locked Generation submit button */}
          <div className="flex flex-col sm:items-end w-full sm:w-auto">
            <Button
              type="button"
              disabled
              size="sm"
              className="text-xs gap-1.5 w-full sm:w-auto justify-center bg-primary/20 text-muted-foreground border border-primary/25 cursor-not-allowed select-none opacity-80"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Generate Video (Pipeline Locked)</span>
            </Button>
            <span className="text-[8px] text-muted-foreground/80 mt-1 block text-center sm:text-right">
              Arriving in Phase 8/9 pipeline execution
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
