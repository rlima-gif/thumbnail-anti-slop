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

export interface ReferenceItem {
  id: string;
  name: string;
  category: ReferenceCategory;
  purpose: string;
  extractedDecision: string;
  notes?: string;
  sourceDomain?: string;
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

export interface ProjectData {
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

  // 02 - Referências
  references: ReferenceItem[];

  // 04 - Anti-Slop Avoid List
  avoidList: string[]; // List of anti-slop item names or custom negative tokens

  // 06 - Laboratório
  uploadedImageUri: string | null;
  diagnosticState: DiagnosticConditions;
  oneSecondPerceptionNote: string;

  // 07 - Checklist
  checklistState: Record<string, boolean>;

  createdAt: string;
  updatedAt: string;
}
