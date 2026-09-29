import { ProjectData } from '@/types';
import { DEFAULT_PROJECT } from '@/data/defaultProject';

const STORAGE_KEY_PROJECTS = 'anti_slop_projects_v1';
const STORAGE_KEY_ACTIVE_ID = 'anti_slop_active_id_v1';

export function migrateProject(raw: unknown): ProjectData {
  if (!raw || typeof raw !== 'object') {
    return createBlankProject();
  }
  const r = raw as Record<string, unknown>;
  const base = createBlankProject(typeof r.name === 'string' ? r.name : 'Projeto Sem Título');

  const migrated: ProjectData = {
    ...base,
    ...(r as unknown as Partial<ProjectData>),
    schemaVersion: 2,
    activeModes: Array.isArray(r.activeModes) ? (r.activeModes as ProjectData['activeModes']) : [],
    references: Array.isArray(r.references)
      ? (r.references as Array<Record<string, unknown>>).map(ref => ({
          id: String(ref.id || `ref-${Date.now()}`),
          name: String(ref.name || 'Referência'),
          category: (ref.category as ProjectData['references'][0]['category']) || 'Composição',
          purpose: String(ref.purpose || ''),
          extractedDecision: String(ref.extractedDecision || ''),
          notes: ref.notes ? String(ref.notes) : undefined,
          sourceDomain: ref.sourceDomain ? String(ref.sourceDomain) : undefined,
          roles: Array.isArray(ref.roles) ? (ref.roles as ProjectData['references'][0]['roles']) : []
        }))
      : [],
    referenceLocks: Array.isArray(r.referenceLocks) ? (r.referenceLocks as ProjectData['referenceLocks']) : [],
    avoidList: Array.isArray(r.avoidList) ? (r.avoidList as string[]) : base.avoidList,
    diagnosticState: {
      ...base.diagnosticState,
      ...(r.diagnosticState as ProjectData['diagnosticState'] || {})
    },
    checklistState: {
      ...base.checklistState,
      ...(r.checklistState as Record<string, boolean> || {})
    },
    promptVersions: Array.isArray(r.promptVersions) ? (r.promptVersions as ProjectData['promptVersions']) : [],
    aiAnalyses: Array.isArray(r.aiAnalyses) ? (r.aiAnalyses as ProjectData['aiAnalyses']) : [],
    aiComparisons: Array.isArray(r.aiComparisons) ? (r.aiComparisons as ProjectData['aiComparisons']) : [],
    experimentJournal: Array.isArray(r.experimentJournal) ? (r.experimentJournal as ProjectData['experimentJournal']) : [],
    performanceSnapshots: Array.isArray(r.performanceSnapshots) ? (r.performanceSnapshots as ProjectData['performanceSnapshots']) : []
  };

  return migrated;
}

export function loadAllProjects(): ProjectData[] {
  if (typeof window === 'undefined') {
    return [DEFAULT_PROJECT];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      const initial = [DEFAULT_PROJECT];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, DEFAULT_PROJECT.id);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let needsResave = false;
      const migrated = parsed.map((p: unknown) => {
        const item = p as Record<string, unknown>;
        if (!item || !item.schemaVersion || (item.schemaVersion as number) < 2) {
          needsResave = true;
        }
        return migrateProject(item);
      });
      if (needsResave) {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(migrated));
      }
      return migrated;
    }
    return [DEFAULT_PROJECT];
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return [DEFAULT_PROJECT];
  }
}

export function saveAllProjects(projects: ProjectData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

export function getActiveProjectId(projects: ProjectData[]): string {
  if (typeof window === 'undefined') return DEFAULT_PROJECT.id;
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id && projects.some(p => p.id === id)) {
      return id;
    }
  } catch (err) {
    console.error('Failed to get active project ID:', err);
  }
  return projects[0]?.id || DEFAULT_PROJECT.id;
}

export function setActiveProjectId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to set active project ID:', err);
  }
}

export function createBlankProject(name = 'Novo Projeto de Thumbnail'): ProjectData {
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    videoTitle: '',
    videoDescription: '',
    niche: '',
    audience: '',
    perceptionGoal: '',
    protagonistType: 'Pessoa',
    viewerQuestion: '',
    titleExplains: '',
    visualPromise: '',
    protagonist: '',
    protagonistPresence: 60,
    secondarySubject: '',
    storyMoment: '',
    composition: 'Regra dos terços com espaço negativo preservado para respiro visual',
    camera: 'Lente prime 50mm no nível dos olhos, perspectiva natural sem distorção',
    expression: 'Expressão contextual autêntica e contida',
    lighting: 'Luz direcional motivada com fonte tangível na cena',
    palette: 'Fundo neutro com uma única cor de acento de impacto',
    background: 'Cenário subordinado com desfoque óptico gradual',
    depth: 'Profundidade com separação clara de primeiro, segundo plano e fundo',
    thumbnailText: '',
    channelIdentity: '',
    visualStyle: 'Fotografia editorial autêntica',
    activeModes: [],
    references: [],
    referenceLocks: [],
    avoidList: [
      'EXPRESSÃO DE CHOQUE GENÉRICA',
      'CONTORNO BRANCO AUTOMÁTICO',
      'RIM LIGHT IMPOSSÍVEL',
      'GLOW EM TODO OBJETO',
      'SETA VERMELHA SEM FUNÇÃO',
      'PARTÍCULAS GRATUITAS'
    ],
    uploadedImageUri: null,
    diagnosticState: {
      manyFocalPoints: false,
      excessiveText: false,
      duplicatedTitle: false,
      artificialGlow: false,
      excessiveSaturation: false,
      weakSeparation: false,
      genericReaction: false,
      backgroundTooDetailed: false,
      noSilentQuestion: false,
      disconnectedElements: false,
      unmotivatedLight: false,
      floatingLogos: false
    },
    oneSecondPerceptionNote: '',
    checklistState: {},
    promptVersions: [],
    aiAnalyses: [],
    aiComparisons: [],
    experimentJournal: [],
    performanceSnapshots: [],
    createdAt: now,
    updatedAt: now
  };
}

export function duplicateProjectData(source: ProjectData): ProjectData {
  const now = new Date().toISOString();
  return {
    ...JSON.parse(JSON.stringify(source)),
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: `${source.name} (Cópia)`,
    createdAt: now,
    updatedAt: now
  };
}

export function exportProjectToJson(project: ProjectData): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thumbnail-anti-slop-${project.name.toLowerCase().replace(/[^\w-]/g, '_')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseProjectJson(jsonContent: string): ProjectData {
  const parsed = JSON.parse(jsonContent);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Conteúdo JSON inválido.');
  }
  const migrated = migrateProject(parsed);
  const now = new Date().toISOString();
  return {
    ...migrated,
    id: `proj-import-${Date.now()}`,
    updatedAt: now
  };
}
