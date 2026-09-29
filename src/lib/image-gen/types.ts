export interface ImageGenStatus {
  configured: boolean;
  provider: string;
  model: string;
}

export interface GenerateImageInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '1:1';
}

export interface EditImageInput {
  baseImage: string;
  patchPrompt: string;
  preservedRegions?: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface GeneratedImageOutput {
  imageUrl: string;
  seed?: number;
  revisedPrompt?: string;
}

export interface ImageGenProvider {
  readonly name: string;
  getStatus(): Promise<ImageGenStatus>;
  generateThumbnail(input: GenerateImageInput): Promise<GeneratedImageOutput>;
  editThumbnail(input: EditImageInput): Promise<GeneratedImageOutput>;
  generateVariant(input: GenerateImageInput): Promise<GeneratedImageOutput>;
}
