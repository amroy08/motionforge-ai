export type StudioModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  generationType: "image_to_video";
  baseCreditCost: string;
  creditCostPerSecond: string;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  supportsNegativePrompt: boolean;
  featured: boolean;
};

export type StudioSourceAsset = {
  id: string;
  originalFilename: string | null;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  previewUrl: string;
  previewExpiresAt: string;
  createdAt: string;
};

export type StudioDataResult =
  | {
      status: "ready";
      walletBalance: string;
      models: StudioModel[];
      assets: StudioSourceAsset[];
    }
  | {
      status: "configuration_error";
      code: string;
      message: string;
    };
