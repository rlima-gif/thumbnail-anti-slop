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

export type TargetModel = 'GERAL' | 'OPENAI' | 'GEMINI' | 'MIDJOURNEY' | 'FLUX';

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
