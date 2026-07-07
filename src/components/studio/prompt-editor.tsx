"use client";

import React from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PromptEditorProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  error?: string;
}

const PROMPT_EXAMPLES = [
  "Slow cinematic camera push-in with subtle natural movement",
  "Gentle breeze moving the subject and surrounding environment",
  "Dynamic commercial-style motion with smooth parallax",
  "Soft handheld documentary movement with realistic lighting",
];

export function PromptEditor({
  prompt,
  onChangePrompt,
  error,
}: PromptEditorProps) {
  const maxCharacters = 2000;
  const characterCount = prompt.length;

  const handleSelectExample = (example: string) => {
    // Append or set if empty
    if (!prompt.trim()) {
      onChangePrompt(example);
    } else {
      onChangePrompt(`${prompt.trim()} ${example}`);
    }
  };

  const handleClear = () => {
    onChangePrompt("");
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex justify-between items-end">
        <label htmlFor="studio-prompt" className="text-xs font-semibold text-foreground/90">
          Video Prompt
        </label>
        <span className={`text-[10px] ${characterCount > maxCharacters ? "text-destructive font-bold" : "text-muted-foreground"}`}>
          {characterCount} / {maxCharacters} chars
        </span>
      </div>

      <div className="relative">
        <Textarea
          id="studio-prompt"
          placeholder="Describe how you want your source image to animate..."
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          rows={3}
          className={`text-xs resize-none pr-8 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        
        {prompt && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Clear prompt"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-[10px] font-medium text-destructive">{error}</p>
      )}

      {/* Example Prompt Chips */}
      <div className="space-y-1 pt-1">
        <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-primary" />
          <span>Quick suggestion chips (click to add):</span>
        </span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {PROMPT_EXAMPLES.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectExample(example)}
              className="text-[9px] px-2 py-0.5 rounded-full border border-border/40 bg-muted/10 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-left cursor-pointer"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
