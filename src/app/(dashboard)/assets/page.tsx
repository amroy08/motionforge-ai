import type { Metadata } from "next";
import Image from "next/image";
import { Trash2, Calendar, AlertTriangle } from "lucide-react";

import { requireActiveUser } from "@/lib/supabase/auth";
import { getUserInputAssets } from "@/lib/media/get-user-input-assets";
import { removeInputImageAction } from "@/app/(dashboard)/create/upload-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatBytes } from "@/config/media";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Media Assets",
};

export default async function AssetsPage() {
  const profile = await requireActiveUser(routes.assets);
  const result = await getUserInputAssets(profile.id);

  const hasAssets = result.assets && result.assets.length > 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Media Assets
        </h1>
        <p className="text-xs text-muted-foreground">
          View your uploaded images. Only unlinked files can be deleted.
        </p>
      </div>

      {/* Database/Configuration warning banner */}
      {result.error && (
        <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Database Connection Warning</AlertTitle>
          <AlertDescription className="text-amber-400/90 text-xs">
            {result.error} Ensure local containers are launched and migrations are reset.
          </AlertDescription>
        </Alert>
      )}

      {/* Assets Grid */}
      {!hasAssets ? (
        <EmptyState
          title="No Source Images Found"
          description="You haven't uploaded any source images yet. Go to the studio workspace to start uploading."
          actionText="Upload Source Image"
          actionHref="/create"
          variant="assets"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.assets.map((asset) => (
            <Card key={asset.id} className="border-border/50 bg-card/30 flex flex-col justify-between overflow-hidden relative group hover:border-primary/20 transition-all duration-200">
              
              {/* Thumbnail Area */}
              <div className="aspect-video w-full overflow-hidden bg-zinc-950 border-b border-border/30 relative flex items-center justify-center">
                <Image
                  src={asset.previewUrl}
                  alt={asset.originalFilename || "Source image"}
                  width={320}
                  height={180}
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Asset Details */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground truncate" title={asset.originalFilename || "Unnamed"}>
                    {asset.originalFilename || "unnamed_asset"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Uploaded {new Date(asset.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/20 pt-2.5">
                  <div>
                    <span className="font-semibold text-foreground/80">Dimensions:</span>{" "}
                    <span>{asset.width} x {asset.height} px</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground/80">Size:</span>{" "}
                    <span>{formatBytes(asset.fileSizeBytes)}</span>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="flex justify-between items-center border-t border-border/20 pt-3">
                  <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/20 bg-primary/5 text-primary uppercase font-bold">
                    {asset.mimeType.split("/")[1]}
                  </Badge>

                  <form action={async (formData: FormData) => {
                    "use server";
                    await removeInputImageAction(formData);
                  }}>
                    <input type="hidden" name="assetId" value={asset.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label="Delete input image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Studio details locked notice */}
      <div className="rounded-lg border border-border/30 bg-muted/10 p-4 text-center max-w-xl mx-auto">
        <p className="text-xs font-semibold text-foreground">Media Library arrives in Phase 13</p>
        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
          Advanced tag searchings, folder organization systems, download managers, and community sharing channels will be fully constructed in Phase 13.
        </p>
      </div>
    </div>
  );
}
