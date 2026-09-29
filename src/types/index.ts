export type ProtagonistType =
  | 'Pessoa'
  | 'Produto'
  | 'Personagem'
  | 'Objeto'
  | 'Tela/interface'
  | 'Cena'
  | 'Antes/depois'
  | 'Resultado'
  | 'Mistério';

export type DeltaState = 'REDUNDANTE' | 'COMPLEMENTAR' | 'DESCONECTADO';

export type ComplexityState = 'LOW' | 'BALANCED' | 'BUSY' | 'SLOP RISK';

export type SlopRiskState = 'BAIXO' | 'ATENÇÃO' | 'ALTO';

export type ChecklistStatus = 'AINDA CONFUSA' | 'FUNCIONA' | 'FORTE' | 'DIREÇÃO CONSISTENTE';

export type ReferenceCategory =
  | 'Composição'
  | 'Enquadramento'
  | 'Expressão'
  | 'Luz'
  | 'Cor'
  | 'Profundidade'
  | 'Tipografia'
  | 'Escala'
  | 'Narrativa'
  | 'Textura'
  | 'Separação figura/fundo'
  | 'Identidade do canal';

export type ReferenceRole =
  | 'IDENTIDADE'
  | 'PRODUTO / HARDWARE'
  | 'COMPOSIÇÃO'
  | 'LUZ'
  | 'COR'
  | 'ESTILO'
  | 'AMBIENTE'
  | 'TEXTURA'
  | 'EXPRESSÃO';

export type ReferenceLock =
  | 'LOCK_FACE'
  | 'LOCK_HAIR'
  | 'LOCK_BEARD'
  | 'LOCK_AGE'
  | 'LOCK_CLOTHING'
  | 'LOCK_POSE'
  | 'LOCK_PRODUCT_GEOMETRY'
  | 'LOCK_SCREEN_ASPECT'
  | 'LOCK_CONTROLLER_LAYOUT'
  | 'LOCK_COMPOSITION'
  | 'LOCK_BACKGROUND';

export interface ReferenceItem {
  id: string;
  name: string;
  category: ReferenceCategory;
  purpose: string;
  extractedDecision: string;
  notes?: string;
  sourceDomain?: string;
  roles?: ReferenceRole[];
}

export interface AntiSlopItem {
  id: string;
  name: string;
  category: 'Expressão & Rosto' | 'Efeitos & Iluminação' | 'Composição & Elementos' | 'Tipografia' | 'Render & IA';
  explanation: string;
  whyItHappens: string;
  whyItHarms: string;
  whenItMayBeIntentional: string;
  promptAvoidKeywords: string[];
}

export interface AiArtifactSignal {
  id: string;
  title: string;
  signal: string;
  whyItHappens: string;
  howToDirectAgainst: string;
}

export interface AnatomyConcept {
  id: string;
  title: string;
  summary: string;
  description: string;
  thumbnailImpact: string;
  commonError: string;
  layerKey: 'focalPrimary' | 'focalSecondary' | 'negativeSpace' | 'eyeVector' | 'contrast' | 'silhouette' | 'leadingLines';
}

export interface ChecklistItemDef {
  id: string;
  text: string;
  category: 'Leitura & Foco' | 'Narrativa & Título' | 'Luz & Realismo' | 'Subtração & Anti-Slop';
}

export type GenerationMode = 'SEM_TEXTO' | 'ROSTO_REAL' | 'GAMING' | 'TECH' | 'BEFORE_AFTER';

export interface DiagnosticConditions {
  manyFocalPoints: boolean;
  excessiveText: boolean;
  duplicatedTitle: boolean;
  artificialGlow: boolean;
  excessiveSaturation: boolean;
  weakSeparation: boolean;
  genericReaction: boolean;
  backgroundTooDetailed: boolean;
  noSilentQuestion: boolean;
  disconnectedElements: boolean;
  unmotivatedLight: boolean;
  floatingLogos: boolean;
}

export interface ABVariant {
  id: 'A' | 'B' | 'C';
  type: 'PERSONAGEM' | 'OBJETO' | 'SITUAÇÃO';
  hypothesis: string;
  viewerQuestion: string;
  protagonist: string;
  composition: string;
  contrast: string;
  whatChanges: string;
  whatRemains: string;
  prompt: string;
}

export interface GlossaryTerm {
  term: string;
  translationEn?: string;
  category: 'Composição & Espaço' | 'Luz & Cor' | 'Narrativa & CTR' | 'Óptica & Câmera';
  definition: string;
  thumbnailRelevance: string;
  proTip: string;
}

// --- V2 EXTENSIONS ---

export type PromptSource = 'LOCAL_GENERATOR' | 'AI_REFINEMENT' | 'MANUAL_EDIT' | 'AI_PATCH';

export interface PromptVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  prompt: string;
  reason: string;
  source: PromptSource;
  diffSummary?: string;
}

export type UncertaintyLevel = 'CONFIDENT' | 'LIKELY' | 'UNCERTAIN';

export interface AnalysisRegion {
  id: string;
  type: string;
  label: string;
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
  width: number; // 0 to 1 normalized
  height: number; // 0 to 1 normalized
  visibleEvidence: string;
  interpretation: string;
  uncertainty: UncertaintyLevel;
  suggestedAntiSlopTerm?: string;
  patchProposal?: {
    field?: keyof ProjectData;
    currentValue?: string;
    proposedValue?: string;
    actionLabel: string;
  };
}

export interface ThumbnailAIAnalysis {
  id: string;
  timestamp: string;
  fingerprint?: string;
  summary: string;
  primaryFocalPoint: {
    evidence: string;
    interpretation: string;
    uncertainty: UncertaintyLevel;
  };
  secondaryFocalPoints: Array<{
    description: string;
    uncertainty: UncertaintyLevel;
  }>;
  visualHierarchy: string;
  mobileReadability: string;
  subjectBackgroundSeparation: string;
  facialNaturalness?: string;
  lightingCoherence: string;
  perspectiveCoherence: string;
  hardwareFidelity?: string;
  textLegibility: string;
  titleThumbnailRelationship: string;
  aiArtifactSignals: string[];
  slopSignals: string[];
  unnecessaryElements: string[];
  successfulElements: string[];
  highestImpactChange: string;
  uncertainty: string[];
  regions: AnalysisRegion[];
}

export interface ThumbnailAIComparison {
  id: string;
  timestamp: string;
  aEnfatiza: string;
  bEnfatiza: string;
  diferencasHierarquia: string;
  diferencasLegibilidade: string;
  diferencasCuriosidade: string;
  diferencasArtificialidade: string;
  riscosA: string[];
  riscosB: string[];
  oQueEsteTesteEstaRealmenteTestando: string;
}

export interface PerformanceSnapshot {
  impressions: number;
  thumbnailCtr: number;
  views: number;
  watchTimeHours: number;
  averageViewDurationSeconds: number;
  snapshotAt: string;
}

export interface ExperimentEntry {
  id: string;
  createdAt: string;
  hypothesis: string;
  primaryVariable: string;
  secondaryVariables?: string;
  variantA: string;
  variantB: string;
  variantC?: string;
  videoId?: string;
  notes?: string;
  result?: string;
  snapshots?: PerformanceSnapshot[];
}

export interface ChannelVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  associatedProjectId?: string;
  performance?: PerformanceSnapshot;
}

export interface ChannelProfile {
  channelId: string;
  channelTitle: string;
  customUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  connectedAt?: string;
  recentVideos?: ChannelVideo[];
}

export interface ProjectData {
  schemaVersion: number; // 1 for original, 2 for current
  id: string;
  name: string;
  videoTitle: string;
  videoDescription: string;
  niche: string;
  audience: string;

  // 01 - Clique
  perceptionGoal: string; // O que perceber em 0.5-1s
  protagonistType: ProtagonistType;
  viewerQuestion: string;
  titleExplains: string;

  // 03 - Direção
  visualPromise: string;
  protagonist: string;
  protagonistPresence: number; // 10% - 90%
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

  // Modes
  activeModes: GenerationMode[];

  // 02 - Referências & Locks
  references: ReferenceItem[];
  referenceLocks?: ReferenceLock[];

  // 04 - Anti-Slop Avoid List
  avoidList: string[]; // List of anti-slop item names or custom negative tokens

  // 06 - Laboratório
  uploadedImageUri: string | null;
  diagnosticState: DiagnosticConditions;
  oneSecondPerceptionNote: string;

  // 07 - Checklist
  checklistState: Record<string, boolean>;

  // V2 Extensions
  customPrompt?: string;
  promptVersions?: PromptVersion[];
  aiAnalyses?: ThumbnailAIAnalysis[];
  aiComparisons?: ThumbnailAIComparison[];
  experimentJournal?: ExperimentEntry[];
  associatedVideoId?: string;
  performanceSnapshots?: PerformanceSnapshot[];

  createdAt: string;
  updatedAt: string;
}
