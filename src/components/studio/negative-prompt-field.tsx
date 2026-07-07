"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NegativePromptFieldProps {
  negativePrompt: string;
  onChangeNegativePrompt: (val: string) => void;
  error?: string;
}

export function NegativePromptField({
  negativePrompt,
  onChangeNegativePrompt,
  error,
}: NegativePromptFieldProps) {
  const maxCharacters = 1000;
  const characterCount = negativePrompt.length;

  return (
    <div className="space-y-2 text-left animate-in fade-in duration-200">
      <div className="flex justify-between items-end">
        <div>
          <label htmlFor="studio-negative-prompt" className="text-xs font-semibold text-foreground/90">
            Negative Prompt <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <p className="text-[9px] text-muted-foreground">Describe what to exclude or restrict in motion frames.</p>
        </div>
        <span className={`text-[10px] ${characterCount > maxCharacters ? "text-destructive font-bold" : "text-muted-foreground"}`}>
          {characterCount} / {maxCharacters} chars
        </span>
      </div>

      <Textarea
        id="studio-negative-prompt"
        placeholder="blurry, distorted motion, flickering, warped details, static elements..."
        value={negativePrompt}
        onChange={(e) => onChangeNegativePrompt(e.target.value)}
        rows={2}
        className={`text-xs resize-none ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />

      {error && (
        <p className="text-[10px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
