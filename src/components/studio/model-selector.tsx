"use client";

import React from "react";
import { Sparkles, Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateGenerationCreditCost } from "@/lib/studio/calculate-credit-cost";
import type { StudioModel } from "@/lib/studio/types";

interface ModelSelectorProps {
  models: StudioModel[];
  selectedModelId: string | null;
  onSelectModel: (model: StudioModel) => void;
}

export function ModelSelector({
  models,
  selectedModelId,
  onSelectModel,
}: ModelSelectorProps) {
  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <Info className="h-4.5 w-4.5" />
          <h4 className="text-sm font-semibold">Video generation is temporarily unavailable.</h4>
        </div>
        <p className="text-xs text-muted-foreground leading-normal">
          No generation models are currently available. An administrator must configure and activate an image-to-video model before video creations can be enabled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-foreground/90">
        AI Generation Model
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {models.map((model) => {
          const isSelected = selectedModelId === model.id;
          
          // Calculate starting estimate using shortest duration
          const minDuration = model.supportedDurations[0] || 5;
          const startingCost = calculateGenerationCreditCost({
            baseCreditCost: model.baseCreditCost,
            creditCostPerSecond: model.creditCostPerSecond,
            durationSeconds: minDuration,
          });

          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectModel(model)}
              className={`group text-left border rounded-xl p-3.5 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/60 hover:border-primary/40 hover:bg-muted/10"
              }`}
            >
              {/* Highlight background glow for active selection */}
              {isSelected && (
                <div className="absolute top-0 right-0 h-10 w-10 bg-primary/10 rounded-bl-full flex items-center justify-center pl-2 pb-2 text-primary">
                  <Check className="h-4.5 w-4.5" />
                </div>
              )}

              <div className="space-y-1.5 w-full pr-6">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {model.name}
                  </h4>
                  {model.featured && (
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/20 bg-primary/5 text-primary uppercase font-bold tracking-wider">
                      <Sparkles className="h-2 w-2 mr-0.5 shrink-0" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                  {model.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/10 flex justify-between items-center text-[9px] text-muted-foreground w-full">
                <div>
                  <span className="font-semibold text-foreground/80">Starts from:</span>{" "}
                  <span className="font-bold text-foreground text-xs">{startingCost}</span>
                  <span className="ml-0.5">credits</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="bg-muted/40 px-1 rounded">{model.supportedDurations.join("/")}s</span>
                  <span className="bg-muted/40 px-1 rounded">{model.supportedAspectRatios.length} Ratios</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
