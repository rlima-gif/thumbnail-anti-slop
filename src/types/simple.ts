export type SimpleReferenceRole =
  | 'PESSOA'
  | 'PRODUTO'
  | 'CENÁRIO'
  | 'ESTILO'
  | 'COMPOSIÇÃO'
  | 'TIPOGRAFIA'
  | 'OUTRA';

export interface SimpleReference {
  id: string;
  url: string;
  name: string;
  role: SimpleReferenceRole;
}

export type TargetModel = 'GERAL' | 'OPENAI' | 'GEMINI' | 'MIDJOURNEY' | 'FLUX';

export type TextTreatment = 'AUTO' | 'USAR_REFERENCIA' | 'RENDER_IN_IMAGE' | 'SEM_TEXTO';
export type ReservedSpacePosition = 'ESQUERDA' | 'DIREITA' | 'SUPERIOR' | 'INFERIOR';

export interface CreateThumbnailInput {
  videoTitle: string;
  ideaDescription: string;
  thumbnailText?: string;
  textTreatment?: TextTreatment;
  fontName?: string;
  reserveSpaceForText?: boolean;
  reservedSpacePosition?: ReservedSpacePosition;
  references: SimpleReference[];
  targetModel: TargetModel;
  aspectRatio: '16:9' | '9:16';
  stylePreset: 'Natural' | 'Cinematográfico' | 'Editorial' | 'Fotojornalismo';
  realismLevel: 'Alto' | 'Estilizado';
  preserveFace: boolean;
  preserveProduct: boolean;
  extraInstructions?: string;
  approachIndex?: number;
}

export interface VisualDirectionOutput {
  ideia: string;
  foco: string;
  composicao: string;
  expressao: string;
  visual: string;
}

export interface CreateThumbnailResult {
  direction: VisualDirectionOutput;
  finalPrompt: string;
  approachTitle: string;
  approachIndex: number;
  typographyPlan?: string;
}

export interface ImprovePromptInput {
  rawPrompt: string;
  targetModel?: TargetModel;
}

export interface ImprovePromptResult {
  changes: string[];
  improvedPrompt: string;
}

export interface AnalyzeThumbnailSimpleResult {
  functioning: string[];
  aiLooking: string[];
  topProblem: string;
  fixPrompt: string;
}

export interface SimpleHistoryItem {
  id: string;
  timestamp: string;
  mode: 'CRIAR' | 'MELHORAR' | 'ANALISAR';
  title: string;
  previewSummary: string;
  data: CreateThumbnailResult | ImprovePromptResult | AnalyzeThumbnailSimpleResult;
}
