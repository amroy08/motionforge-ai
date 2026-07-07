"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageIcon, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/config/media";
import type { StudioSourceAsset } from "@/lib/studio/types";

interface UploadedAssetPickerProps {
  assets: StudioSourceAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (asset: StudioSourceAsset) => void;
}

export function UploadedAssetPicker({
  assets,
  selectedAssetId,
  onSelectAsset,
}: UploadedAssetPickerProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs" />}>
        <span>Choose from Library</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card border border-border/80 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-1.5">
            <ImageIcon className="h-4.5 w-4.5 text-primary" />
            <span>Select Source Image</span>
          </DialogTitle>
        </DialogHeader>

        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
            <div className="h-9 w-9 rounded-full bg-muted/40 flex items-center justify-center">
              <ImageIcon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium">No uploaded images found.</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Upload a source image using the dropzone first to add files here.
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-1 grid grid-cols-1 gap-2.5 my-2">
            {assets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              return (
                <DialogClose
                  key={asset.id}
                  render={
                    <button
                      type="button"
                      onClick={() => onSelectAsset(asset)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border/50 bg-muted/5 hover:bg-muted/10 hover:border-border"
                      }`}
                    />
                  }
                >
                  {/* Thumbnail */}
                  <div className="h-12 w-20 rounded bg-zinc-950 overflow-hidden shrink-0 border border-border/40 relative flex items-center justify-center">
                    <Image
                      src={asset.previewUrl}
                      alt={asset.originalFilename || "Source thumbnail"}
                      width={80}
                      height={48}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-0.5 overflow-hidden w-full">
                    <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                      {asset.originalFilename || "unnamed_asset"}
                    </h4>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span>{asset.width}x{asset.height} px</span>
                      <span>•</span>
                      <span>{formatBytes(asset.fileSizeBytes)}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground/80 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </DialogClose>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
