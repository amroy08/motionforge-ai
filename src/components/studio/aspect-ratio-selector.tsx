"use client";

import React from "react";
import { Maximize2 } from "lucide-react";

interface AspectRatioSelectorProps {
  ratios: string[];
  selectedRatio: string | null;
  onSelectRatio: (ratio: string) => void;
  disabled?: boolean;
}

interface RatioDetails {
  label: string;
  sub: string;
  widthClass: string;
  heightClass: string;
}

const RATIO_MAP: Record<string, RatioDetails> = {
  "16:9": { label: "16:9", sub: "Landscape", widthClass: "w-7", heightClass: "h-4" },
  "9:16": { label: "9:16", sub: "Portrait", widthClass: "w-4", heightClass: "h-7" },
  "1:1": { label: "1:1", sub: "Square", widthClass: "w-5", heightClass: "h-5" },
  "4:3": { label: "4:3", sub: "Standard", widthClass: "w-6", heightClass: "h-4.5" },
  "3:4": { label: "3:4", sub: "Standard tall", widthClass: "w-4.5", heightClass: "h-6" },
};

export function AspectRatioSelector({
  ratios,
  selectedRatio,
  onSelectRatio,
  disabled = false,
}: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
        <Maximize2 className="h-3.5 w-3.5 text-primary" />
        <span>Aspect Ratio</span>
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ratios.map((ratio) => {
          const isSelected = selectedRatio === ratio;
          const details = RATIO_MAP[ratio] || {
            label: ratio,
            sub: "Custom",
            widthClass: "w-5",
            heightClass: "h-5",
          };

          return (
            <button
              key={ratio}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRatio(ratio)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border/60 hover:border-primary/30 hover:bg-muted/10 text-muted-foreground hover:text-foreground"
              } ${disabled ? "opacity-40 cursor-not-allowed select-none pointer-events-none" : ""}`}
            >
              {/* Aspect Ratio Box Representation */}
              <div className="h-9 w-9 bg-zinc-950/60 rounded flex items-center justify-center shrink-0 border border-border/20">
                <div className={`border border-current rounded-xs ${details.widthClass} ${details.heightClass} transition-all opacity-85`} />
              </div>

              {/* Text */}
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold leading-none">{details.label}</p>
                <p className="text-[8px] text-muted-foreground truncate mt-0.5">{details.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
