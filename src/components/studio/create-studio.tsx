"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUploadDropzone } from "@/components/media/image-upload-dropzone";
import { ModelSelector } from "./model-selector";
import { PromptEditor } from "./prompt-editor";
import { NegativePromptField } from "./negative-prompt-field";
import { DurationSelector } from "./duration-selector";
import { AspectRatioSelector } from "./aspect-ratio-selector";
import { CreditEstimateCard } from "./credit-estimate-card";
import { GenerationReviewCard } from "./generation-review-card";
import { UploadedAssetPicker } from "./uploaded-asset-picker";
import { calculateGenerationCreditCost } from "@/lib/studio/calculate-credit-cost";
import { reviewGenerationSettingsAction } from "@/app/(dashboard)/create/actions";
import type { SafeAssetDetails } from "@/app/(dashboard)/create/upload-actions";
import { formatBytes } from "@/config/media";
import type { StudioModel, StudioSourceAsset } from "@/lib/studio/types";

interface CreateStudioProps {
  initialAssets: StudioSourceAsset[];
  models: StudioModel[];
  walletBalance: string;
}

export function CreateStudio({
  initialAssets,
  models,
  walletBalance,
}: CreateStudioProps) {
  const [isPending, startTransition] = useTransition();

  // Assets list (can be updated when new uploads complete)
  const [assets, setAssets] = useState<StudioSourceAsset[]>(initialAssets);

  // Selected config state
  const [selectedAsset, setSelectedAsset] = useState<StudioSourceAsset | null>(
    initialAssets[0] || null
  );

  // Initialize selected model: prefer featured or fallback to first active
  const [selectedModel, setSelectedModel] = useState<StudioModel | null>(() => {
    if (models.length === 0) return null;
    return models.find((m) => m.featured) || models[0];
  });

  // Form inputs initialized from the initially selected model
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [duration, setDuration] = useState<number | null>(() => {
    if (models.length === 0) return null;
    const initialModel = models.find((m) => m.featured) || models[0];
    return initialModel.supportedDurations[0] || 5;
  });
  const [aspectRatio, setAspectRatio] = useState<string | null>(() => {
    if (models.length === 0) return null;
    const initialModel = models.find((m) => m.featured) || models[0];
    return initialModel.supportedAspectRatios[0] || "16:9";
  });

  // Action review state
  const [review, setReview] = useState<Extract<
    import("@/app/(dashboard)/create/actions").GenerationReviewResult,
    { status: "reviewed" }
  >["review"] | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleModelChange = (model: StudioModel) => {
    setSelectedModel(model);
    const defaultDuration = model.supportedDurations[0] || 5;
    const defaultRatio = model.supportedAspectRatios[0] || "16:9";
    setDuration(defaultDuration);
    setAspectRatio(defaultRatio);
    if (!model.supportsNegativePrompt) {
      setNegativePrompt("");
    }
    setReview(null);
    setServerError(null);
    setValidationErrors({});
  };

  // Invalidate review when settings are modified
  const handlePromptChange = (val: string) => {
    setPrompt(val);
    setReview(null);
    setServerError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.prompt;
      return copy;
    });
  };

  const handleNegativePromptChange = (val: string) => {
    setNegativePrompt(val);
    setReview(null);
    setServerError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.negativePrompt;
      return copy;
    });
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    setReview(null);
    setServerError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.durationSeconds;
      return copy;
    });
  };

  const handleRatioChange = (val: string) => {
    setAspectRatio(val);
    setReview(null);
    setServerError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.aspectRatio;
      return copy;
    });
  };

  const handleAssetSelect = (asset: StudioSourceAsset) => {
    setSelectedAsset(asset);
    setReview(null);
    setServerError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.sourceAssetId;
      return copy;
    });
  };

  // Add new uploads dynamically to list
  const handleUploadComplete = (newAsset: SafeAssetDetails) => {
    const formattedAsset: StudioSourceAsset = {
      id: newAsset.id,
      originalFilename: newAsset.originalFilename,
      mimeType: newAsset.mimeType,
      fileSizeBytes: newAsset.fileSizeBytes,
      width: newAsset.width,
      height: newAsset.height,
      previewUrl: newAsset.previewUrl,
      previewExpiresAt: newAsset.previewExpiresAt,
      createdAt: new Date().toISOString(),
    };

    setAssets((prev) => [formattedAsset, ...prev]);
    setSelectedAsset(formattedAsset);
    setReview(null);
    setServerError(null);
  };

  // Submit settings review Server Action
  const handleReviewSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !selectedModel || duration === null || aspectRatio === null) {
      setServerError("Please select a source image, model, duration, and aspect ratio before reviewing.");
      return;
    }

    setServerError(null);
    setValidationErrors({});

    const formData = new FormData();
    formData.append("sourceAssetId", selectedAsset.id);
    formData.append("modelId", selectedModel.id);
    formData.append("prompt", prompt);
    formData.append("negativePrompt", negativePrompt);
    formData.append("durationSeconds", duration.toString());
    formData.append("aspectRatio", aspectRatio);

    startTransition(async () => {
      const res = await reviewGenerationSettingsAction(formData);

      if (res.status === "invalid") {
        setServerError(res.message);
        if (res.fieldErrors) {
          setValidationErrors(res.fieldErrors);
        }
      } else if (res.status === "configuration_error") {
        setServerError(res.message);
      } else if (res.status === "reviewed") {
        setReview(res.review);
        // Scroll to cost estimation/review layout target on success
        document.getElementById("studio-review-target")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  };

  // Compute live local estimated credit cost for preview card
  const getLiveEstimatedCost = () => {
    if (!selectedModel || duration === null) return "0";
    try {
      return calculateGenerationCreditCost({
        baseCreditCost: selectedModel.baseCreditCost,
        creditCostPerSecond: selectedModel.creditCostPerSecond,
        durationSeconds: duration,
      });
    } catch {
      return "0";
    }
  };

  const hasNoModels = models.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start max-w-6xl mx-auto py-2">
      {/* Left Workspace Columns (Image Source Upload & Parameters Configuration) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Error notification header */}
        {serverError && (
          <Alert variant="destructive" className="animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="text-left">
              <AlertTitle>Review Verification Failed</AlertTitle>
              <AlertDescription className="text-xs">{serverError}</AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleReviewSettings} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* 1. Source Image Workspace */}
            <div className="space-y-3 flex flex-col h-full text-left">
              <label className="text-xs font-semibold text-foreground/90 flex items-center justify-between">
                <span>Source Image</span>
                {selectedAsset && (
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    {selectedAsset.mimeType.split("/")[1]}
                  </span>
                )}
              </label>

              {selectedAsset ? (
                /* Asset selected detail card */
                <Card className="border-border/50 bg-card/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between flex-1">
                  <div className="aspect-video w-full overflow-hidden bg-zinc-950 border-b border-border/30 relative flex items-center justify-center">
                    <Image
                      src={selectedAsset.previewUrl}
                      alt={selectedAsset.originalFilename || "Source preview"}
                      width={320}
                      height={180}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground truncate" title={selectedAsset.originalFilename || "Source Asset"}>
                        {selectedAsset.originalFilename || "unnamed_asset"}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground/80">Dimensions:</span>{" "}
                          <span>{selectedAsset.width} x {selectedAsset.height} px</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground/80">File Size:</span>{" "}
                          <span>{formatBytes(selectedAsset.fileSizeBytes)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2.5 border-t border-border/10">
                      <UploadedAssetPicker
                        assets={assets}
                        selectedAssetId={selectedAsset.id}
                        onSelectAsset={handleAssetSelect}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAsset(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Upload New
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* File Dropzone area */
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="flex-1 flex flex-col justify-center">
                    <ImageUploadDropzone onUploadComplete={handleUploadComplete} />
                  </div>
                  {assets.length > 0 && (
                    <div className="flex justify-start">
                      <UploadedAssetPicker
                        assets={assets}
                        selectedAssetId={null}
                        onSelectAsset={handleAssetSelect}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Parameters Configuration Workspace */}
            <div className="space-y-5 flex flex-col justify-between">
              {/* AI Model selector */}
              <ModelSelector
                models={models}
                selectedModelId={selectedModel?.id || null}
                onSelectModel={handleModelChange}
              />

              {/* Aspect Ratio selector */}
              <AspectRatioSelector
                ratios={selectedModel?.supportedAspectRatios || []}
                selectedRatio={aspectRatio}
                onSelectRatio={handleRatioChange}
                disabled={hasNoModels}
              />

              {/* Video Duration selector */}
              <DurationSelector
                durations={selectedModel?.supportedDurations || []}
                selectedDuration={duration}
                onSelectDuration={handleDurationChange}
                disabled={hasNoModels}
              />
            </div>
          </div>

          {/* 3. Text Prompt & Negative Prompt Editors */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
            <CardContent className="p-4.5 space-y-4">
              <PromptEditor
                prompt={prompt}
                onChangePrompt={handlePromptChange}
                error={validationErrors.prompt?.[0]}
              />

              {selectedModel?.supportsNegativePrompt && (
                <NegativePromptField
                  negativePrompt={negativePrompt}
                  onChangeNegativePrompt={handleNegativePromptChange}
                  error={validationErrors.negativePrompt?.[0]}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Submit Action (Disabled when models are unavailable) */}
          {!review && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending || hasNoModels || !selectedAsset}
                className="w-full sm:w-auto text-xs font-semibold cursor-pointer shadow-sm gap-1.5"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Verifying Settings...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Review Settings</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Right Column: Costs & Validation Reviews Summary Panel */}
      <div id="studio-review-target" className="lg:col-span-4 space-y-6">
        {review ? (
          <GenerationReviewCard
            review={review}
            onEdit={() => setReview(null)}
          />
        ) : (
          <CreditEstimateCard
            estimatedCost={getLiveEstimatedCost()}
            walletBalance={walletBalance}
            disabled={hasNoModels}
          />
        )}

        {/* Development informational guidance notice */}
        <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center text-[10px] text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-1">Local Draft Status</p>
          <p>
            Prompts and settings are in-memory drafts only. Page refreshes will clear configuration choices. Video generation rows will be implemented in subsequent phases.
          </p>
        </div>
      </div>
    </div>
  );
}
