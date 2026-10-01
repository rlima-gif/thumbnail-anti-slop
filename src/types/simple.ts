export type SimpleReferenceRole =
  | 'PESSOA'
  | 'PRODUTO'
  | 'CENÁRIO'
  | 'ESTILO'
  | 'COMPOSIÇÃO'
  | 'TIPOGRAFIA'
  | 'IMAGEM_ALVO'
  | 'OUTRA';

export type ScenarioInterpretation = 'MEU_AMBIENTE' | 'REFERENCIA_AMBIENTE';

export interface SimpleReference {
  id: string;
  url: string;
  name: string;
  role: SimpleReferenceRole;
  isTarget?: boolean;
  scenarioMode?: ScenarioInterpretation;
}

export type TargetModel =
  | 'GERAL'
  | 'OPENAI_GPT_IMAGE_2_5_SUNBURST'
  | 'OPENAI_GPT_IMAGE_2_5_FLARE'
  | 'GEMINI'
  | 'MIDJOURNEY'
  | 'FLUX'
  | 'OPENAI'; // Deprecated legacy alias for backward compatibility

export type OpenAIImageQuality = 'auto' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface ImageOutputMetadata {
  modelId: 'gpt-image-2.5-sunburst' | 'gpt-image-2.5-flare' | string;
  targetModel: TargetModel;
  aspectRatioHint: string;
  quality: OpenAIImageQuality | string;
  supportedQualities?: OpenAIImageQuality[];
}

export interface TargetModelConfig {
  id: TargetModel;
  apiModelId?: string;
  displayName: string;
  description: string;
  aspectRatio16_9Hint?: string;
  aspectRatio9_16Hint?: string;
  supportedQualities?: OpenAIImageQuality[];
  defaultQuality?: OpenAIImageQuality;
}

export function normalizeTargetModel(model?: string | null): TargetModel {
  if (!model) return 'GERAL';
  if (model === 'OPENAI') return 'OPENAI_GPT_IMAGE_2_5_SUNBURST';
  const valid: TargetModel[] = [
    'GERAL',
    'OPENAI_GPT_IMAGE_2_5_SUNBURST',
    'OPENAI_GPT_IMAGE_2_5_FLARE',
    'GEMINI',
    'MIDJOURNEY',
    'FLUX'
  ];
  if (valid.includes(model as TargetModel)) return model as TargetModel;
  return 'GERAL';
}

export const TARGET_MODEL_CONFIGS: Record<TargetModel, TargetModelConfig> = {
  GERAL: {
    id: 'GERAL',
    displayName: 'Geral (Compatível com todos)',
    description: 'Prompt limpo e agnóstico de provedor para qualquer gerador moderno.'
  },
  OPENAI_GPT_IMAGE_2_5_SUNBURST: {
    id: 'OPENAI_GPT_IMAGE_2_5_SUNBURST',
    apiModelId: 'gpt-image-2.5-sunburst',
    displayName: 'OpenAI — GPT Image 2.5 Sunburst',
    description: 'Máxima fidelidade para thumbnails exigentes, preservação estrita de identidade, produtos e edições precisas.',
    aspectRatio16_9Hint: '3840x2160',
    aspectRatio9_16Hint: '2160x3840',
    supportedQualities: ['auto', 'low', 'medium', 'high', 'xhigh', 'max'],
    defaultQuality: 'high'
  },
  OPENAI_GPT_IMAGE_2_5_FLARE: {
    id: 'OPENAI_GPT_IMAGE_2_5_FLARE',
    apiModelId: 'gpt-image-2.5-flare',
    displayName: 'OpenAI — GPT Image 2.5 Flare',
    description: 'Geração rápida e eficiente para thumbnails diárias e experimentação iterativa.',
    aspectRatio16_9Hint: '2048x1152',
    aspectRatio9_16Hint: '1152x2048',
    supportedQualities: ['auto', 'low', 'medium', 'high', 'xhigh'],
    defaultQuality: 'auto'
  },
  GEMINI: {
    id: 'GEMINI',
    displayName: 'Google Gemini Image',
    description: 'Otimizado para fidelidade física, perspectiva óptica natural e zero plastificação.'
  },
  MIDJOURNEY: {
    id: 'MIDJOURNEY',
    displayName: 'Midjourney',
    description: 'Com parâmetros de proporção (--ar) e --style raw sob demanda.'
  },
  FLUX: {
    id: 'FLUX',
    displayName: 'FLUX',
    description: 'Otimizado para textura tátil profissional e perspectiva óptica 35mm.'
  },
  OPENAI: {
    id: 'OPENAI',
    apiModelId: 'gpt-image-2.5-sunburst',
    displayName: 'OpenAI (Legado)',
    description: 'Redirecionado automaticamente para GPT Image 2.5 Sunburst.',
    aspectRatio16_9Hint: '3840x2160',
    aspectRatio9_16Hint: '2160x3840',
    supportedQualities: ['auto', 'low', 'medium', 'high', 'xhigh', 'max'],
    defaultQuality: 'high'
  }
};

export type TextTreatment = 'AUTO' | 'USAR_REFERENCIA' | 'RENDER_IN_IMAGE' | 'SEM_TEXTO';
export type ReservedSpacePosition = 'ESQUERDA' | 'DIREITA' | 'SUPERIOR' | 'INFERIOR';

export type TaskType =
  | 'CREATE_NEW_SCENE'
  | 'EDIT_EXISTING_IMAGE'
  | 'IDENTITY_TRANSFER'
  | 'REPLACE_OBJECT'
  | 'CHANGE_ENVIRONMENT'
  | 'CHANGE_APPEARANCE'
  | 'STYLE_TRANSFER'
  | 'COMPOSITION_TRANSFER'
  | 'MIXED_EDIT';

export type AttributeOwner =
  | 'USER'
  | 'TARGET'
  | 'PERSON_REF'
  | 'PRODUCT_REF'
  | 'SCENARIO_REF'
  | 'STYLE_REF'
  | 'COMPOSITION_REF'
  | 'ADAPTED'
  | 'INFERRED'
  | 'NONE';

export type ProvenanceOrigin =
  | 'USER_EXPLICIT'
  | 'TARGET_IMAGE'
  | 'PERSON_REFERENCE'
  | 'PRODUCT_REFERENCE'
  | 'SCENARIO_REFERENCE'
  | 'STYLE_REFERENCE'
  | 'COMPOSITION_REFERENCE'
  | 'NECESSARY_ADAPTATION'
  | 'JUSTIFIED_INFERENCE'
  | 'UNSUPPORTED_DEFAULT';

export interface ScenePlan {
  taskType: TaskType;
  primarySubject: string;
  secondarySubject?: string;
  targetImage?: SimpleReference;
  identitySource?: SimpleReference;
  productSource?: SimpleReference;
  environmentSource?: SimpleReference;
  styleSource?: SimpleReference;
  compositionSource?: SimpleReference;
  // Ownership
  faceOwner: AttributeOwner;
  hairOwner: AttributeOwner;
  beardOwner: AttributeOwner;
  bodyOwner: AttributeOwner;
  poseOwner: AttributeOwner;
  headAngleOwner: AttributeOwner;
  clothingOwner: AttributeOwner;
  armorOwner?: AttributeOwner;
  propsOwner?: AttributeOwner;
  handsOwner: AttributeOwner;
  productOwner: AttributeOwner;
  environmentOwner: AttributeOwner;
  lightingOwner: AttributeOwner;
  compositionOwner: AttributeOwner;
  styleOwner: AttributeOwner;
  // Details
  camera?: string;
  pose?: string;
  expression?: string;
  environment?: string;
  lighting?: string;
  background?: string;
  text?: string;
  change: string[];
  preserve: string[];
  avoid: string[];
  provenanceMap: Record<string, ProvenanceOrigin>;
  unsupportedDetailsRemoved?: string[];
}

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
  scenePlan?: ScenePlan;
  outputMetadata?: ImageOutputMetadata;
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
