"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useImageUpload } from "@/hooks/use-image-upload";
import { formatBytes, mediaConfig } from "@/config/media";
import type { SafeAssetDetails } from "@/app/(dashboard)/create/upload-actions";

export function ImageUploadDropzone({
  onUploadComplete,
}: {
  onUploadComplete?: (asset: SafeAssetDetails) => void;
}) {
  const {
    file,
    previewUrl,
    stage,
    error,
    completedAsset,
    selectFile,
    startUpload,
    resetUpload,
    removeAsset,
  } = useImageUpload();

  useEffect(() => {
    if (stage === "complete" && completedAsset && onUploadComplete) {
      onUploadComplete(completedAsset);
    }
  }, [stage, completedAsset, onUploadComplete]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Drag over handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Drag leave handler
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      selectFile(droppedFile);
    }
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      selectFile(selectedFile);
    }
  };

  // Trigger file dialog
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerFileDialog();
    }
  };

  // Stage descriptive messaging
  const getStageMessage = () => {
    switch (stage) {
      case "preparing":
        return "Preparing upload parameters...";
      case "uploading":
        return "Uploading directly to storage...";
      case "validating":
        return "Inspecting formats & metadata...";
      case "complete":
        return "Upload and validation complete.";
      default:
        return "";
    }
  };

  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
      <CardContent className="p-6 space-y-6">
        
        {/* Error notification banner */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="text-left">
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Upload complete card detail view */}
        {stage === "complete" && completedAsset && (
          <div className="space-y-4">
            <div className="relative rounded-xl border border-emerald-500/30 overflow-hidden bg-emerald-500/5 p-4 flex flex-col sm:flex-row items-center gap-4 text-left">
              {/* Checkmark icon */}
              <div className="absolute top-3 right-3 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              
              {/* Preview Thumbnail */}
              {previewUrl && (
                <div className="h-24 w-24 rounded-lg overflow-hidden border border-border bg-zinc-950 shrink-0 relative flex items-center justify-center">
                  <Image
                    src={previewUrl}
                    alt={completedAsset.originalFilename || "Source thumbnail"}
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Asset Metadata Matrix */}
              <div className="space-y-1.5 w-full">
                <h4 className="text-sm font-bold text-foreground truncate max-w-[240px]">
                  {completedAsset.originalFilename || "unnamed_asset"}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground/80">Format:</span>{" "}
                    <span className="uppercase">{completedAsset.mimeType.split("/")[1]}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground/80">File Size:</span>{" "}
                    <span>{formatBytes(completedAsset.fileSizeBytes)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground/80">Dimensions:</span>{" "}
                    <span>{completedAsset.width} x {completedAsset.height} px</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground/80">ID:</span>{" "}
                    <span className="font-mono text-[9px] truncate inline-block max-w-[100px]">
                      {completedAsset.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetUpload}
                className="text-xs"
              >
                Upload New Image
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeAsset}
                className="text-xs"
              >
                Delete Asset
              </Button>
            </div>
          </div>
        )}

        {/* Drag & drop upload target workspace */}
        {stage !== "complete" && (
          <div className="space-y-4">
            
            {/* Visual drop target box */}
            {stage === "idle" || stage === "selected" || stage === "error" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileDialog}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Upload an image dropzone"
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer text-center transition-all duration-200 outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                  isDragOver
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/10"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={mediaConfig.allowedImageMimeTypes.join(",")}
                  className="hidden"
                />

                {previewUrl ? (
                  /* Selected image local preview */
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="h-32 w-32 rounded-lg overflow-hidden border border-border relative group bg-zinc-950 flex items-center justify-center">
                      <Image
                        src={previewUrl}
                        alt="Local upload preview"
                        width={128}
                        height={128}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetUpload();
                        }}
                        className="absolute -top-1.5 -right-1.5 bg-destructive hover:bg-destructive/95 text-destructive-foreground rounded-full p-1 shadow-md hover:scale-105 transition-transform"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1 text-left sm:text-center">
                      <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                        {file?.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {file ? formatBytes(file.size) : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Empty / prompt state */
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/20 text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">
                        Drag and drop or <span className="text-primary hover:underline font-medium">choose image</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        JPEG, PNG, or WebP formats (Max {formatBytes(mediaConfig.maxImageBytes)})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Upload progress view states */
              <div className="border border-border/50 rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-4">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                <div className="space-y-1.5 w-full max-w-xs">
                  <p className="text-xs font-semibold text-foreground">
                    {getStageMessage()}
                  </p>
                  <Progress value={stage === "uploading" ? 50 : stage === "validating" ? 75 : 10} className="h-1.5" />
                </div>
              </div>
            )}

            {/* Selection actions footer controls */}
            {stage === "selected" && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                  className="text-xs"
                >
                  Clear Selection
                </Button>
                <Button
                  size="sm"
                  onClick={startUpload}
                  className="text-xs shadow-sm gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upload & Verify Image</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
