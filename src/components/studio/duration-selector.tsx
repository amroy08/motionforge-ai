"use client";

import React from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DurationSelectorProps {
  durations: number[];
  selectedDuration: number | null;
  onSelectDuration: (duration: number) => void;
  disabled?: boolean;
}

export function DurationSelector({
  durations,
  selectedDuration,
  onSelectDuration,
  disabled = false,
}: DurationSelectorProps) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
        <Timer className="h-3.5 w-3.5 text-primary" />
        <span>Video Duration</span>
      </label>
      
      <div className="flex gap-2">
        {durations.map((duration) => {
          const isSelected = selectedDuration === duration;
          return (
            <Button
              key={duration}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => onSelectDuration(duration)}
              className="text-xs font-medium min-w-[70px] cursor-pointer"
            >
              {duration} sec
            </Button>
          );
        })}
      </div>
    </div>
  );
}
