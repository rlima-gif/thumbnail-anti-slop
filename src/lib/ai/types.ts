import {
  ThumbnailAIAnalysis,
  ThumbnailAIComparison,
  ProjectData
} from '@/types';

export interface AnalyzeThumbnailInput {
  imageBase64OrUrl: string;
  videoTitle: string;
  videoDescription?: string;
  visualPromise?: string;
  viewerQuestion?: string;
  thumbnailText?: string;
  activeModes?: string[];
  avoidList?: string[];
  channelIdentity?: string;
}

export interface CompareThumbnailsInput {
  imageA: string;
  imageB: string;
  videoTitle: string;
  videoDescription?: string;
  visualPromise?: string;
}

export interface GenerateDirectionInput {
  videoTitle: string;
  videoDescription?: string;
  visualPromise?: string;
  protagonist?: string;
  availableReferences?: string[];
}

export interface SuggestedDirectionOutput {
  visualPromise: string;
  viewerQuestion: string;
  protagonist: string;
  protagonistType: ProjectData['protagonistType'];
  protagonistPresence: number;
  secondarySubject: string;
  storyMoment: string;
  composition: string;
  camera: string;
  expression: string;
  lighting: string;
  palette: string;
  background: string;
  depth: string;
  thumbnailText: string;
  channelIdentity: string;
  visualStyle: string;
}

export interface RefinePromptInput {
  currentPrompt: string;
  avoidList?: string[];
  referenceLocks?: string[];
  channelIdentity?: string;
  visualStyle?: string;
}

export interface RefinePromptOutput {
  refinedPrompt: string;
  diffSummary: string;
  whatChanged: string[];
}

export interface AIProviderStatus {
  configured: boolean;
  provider: string;
  model: string;
  supportsVision: boolean;
}

export interface AIProvider {
  readonly name: string;
  getStatus(): Promise<AIProviderStatus>;
  analyzeThumbnail(input: AnalyzeThumbnailInput): Promise<ThumbnailAIAnalysis>;
  compareThumbnails(input: CompareThumbnailsInput): Promise<ThumbnailAIComparison>;
  generateDirection(input: GenerateDirectionInput): Promise<SuggestedDirectionOutput>;
  refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput>;
}
