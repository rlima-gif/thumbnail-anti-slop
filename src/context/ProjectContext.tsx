'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ProjectData,
  GenerationMode,
  PromptSource,
  PromptVersion,
  ThumbnailAIAnalysis,
  ThumbnailAIComparison,
  ReferenceLock,
  ReferenceRole,
  ExperimentEntry
} from '@/types';
import {
  loadAllProjects,
  saveAllProjects,
  getActiveProjectId,
  setActiveProjectId,
  createBlankProject,
  duplicateProjectData,
  exportProjectToJson,
  parseProjectJson
} from '@/lib/storage';
import { DEFAULT_PROJECT } from '@/data/defaultProject';

interface ProjectContextValue {
  currentProject: ProjectData;
  projectsList: ProjectData[];
  isLoaded: boolean;
  updateProject: (fields: Partial<ProjectData>) => void;
  switchProject: (id: string) => void;
  createNewProject: (name?: string) => void;
  duplicateCurrentProject: () => void;
  deleteCurrentProject: () => void;
  renameCurrentProject: (newName: string) => void;
  resetCurrentProject: () => void;
  exportCurrentProject: () => void;
  importProjectFromJson: (jsonStr: string) => boolean;
  addAntiSlopToAvoid: (itemName: string) => void;
  removeAntiSlopFromAvoid: (itemName: string) => void;
  toggleMode: (mode: GenerationMode) => void;
  toggleDiagnostic: (field: keyof ProjectData['diagnosticState']) => void;
  toggleChecklist: (itemId: string) => void;
  addPromptVersion: (prompt: string, reason: string, source: PromptSource, diffSummary?: string) => void;
  restorePromptVersion: (versionId: string) => void;
  saveAIAnalysis: (analysis: ThumbnailAIAnalysis) => void;
  saveAIComparison: (comparison: ThumbnailAIComparison) => void;
  toggleReferenceLock: (lock: ReferenceLock) => void;
  updateReferenceRoles: (refId: string, roles: ReferenceRole[]) => void;
  addExperimentEntry: (entry: Omit<ExperimentEntry, 'id' | 'createdAt'>) => void;
  updateExperimentEntry: (id: string, updates: Partial<ExperimentEntry>) => void;
  deleteExperimentEntry: (id: string) => void;
  applyAIProposedCorrection: (field: keyof ProjectData, value: unknown) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectsList, setProjectsList] = useState<ProjectData[]>(() => {
    return typeof window !== 'undefined' ? loadAllProjects() : [DEFAULT_PROJECT];
  });
  const [activeId, setActiveId] = useState<string>(() => {
    return typeof window !== 'undefined' ? getActiveProjectId(loadAllProjects()) : DEFAULT_PROJECT.id;
  });
  const [isLoaded] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const currentProject = projectsList.find(p => p.id === activeId) || projectsList[0] || DEFAULT_PROJECT;

  // Persist whenever projectsList updates
  const persist = useCallback((updatedList: ProjectData[], newActiveId?: string) => {
    setProjectsList(updatedList);
    saveAllProjects(updatedList);
    if (newActiveId) {
      setActiveId(newActiveId);
      setActiveProjectId(newActiveId);
    }
  }, []);

  const updateProject = useCallback((fields: Partial<ProjectData>) => {
    setProjectsList(prev => {
      const idx = prev.findIndex(p => p.id === activeId);
      if (idx === -1) return prev;
      const updated: ProjectData = {
        ...prev[idx],
        ...fields,
        updatedAt: new Date().toISOString()
      };
      const next = [...prev];
      next[idx] = updated;
      saveAllProjects(next);
      return next;
    });
  }, [activeId]);

  const switchProject = useCallback((id: string) => {
    if (projectsList.some(p => p.id === id)) {
      setActiveId(id);
      setActiveProjectId(id);
      showToast('Projeto alterado.');
    }
  }, [projectsList, showToast]);

  const createNewProject = useCallback((name?: string) => {
    const newProj = createBlankProject(name || `Novo Projeto (${projectsList.length + 1})`);
    const nextList = [newProj, ...projectsList];
    persist(nextList, newProj.id);
    showToast(`Projeto "${newProj.name}" criado com sucesso!`);
  }, [projectsList, persist, showToast]);

  const duplicateCurrentProject = useCallback(() => {
    const copy = duplicateProjectData(currentProject);
    const nextList = [copy, ...projectsList];
    persist(nextList, copy.id);
    showToast(`Projeto duplicado como "${copy.name}".`);
  }, [currentProject, projectsList, persist, showToast]);

  const deleteCurrentProject = useCallback(() => {
    if (projectsList.length <= 1) {
      // If deleting the only project, reset to default
      const resetList = [DEFAULT_PROJECT];
      persist(resetList, DEFAULT_PROJECT.id);
      showToast('Projeto resetado para o modelo padrão.');
      return;
    }
    const filtered = projectsList.filter(p => p.id !== activeId);
    const nextActive = filtered[0].id;
    persist(filtered, nextActive);
    showToast(`Projeto "${currentProject.name}" excluído.`);
  }, [projectsList, activeId, persist, currentProject.name, showToast]);

  const renameCurrentProject = useCallback((newName: string) => {
    if (!newName.trim()) return;
    updateProject({ name: newName.trim() });
    showToast(`Projeto renomeado para "${newName.trim()}".`);
  }, [updateProject, showToast]);

  const resetCurrentProject = useCallback(() => {
    const blank = createBlankProject(currentProject.name);
    updateProject({ ...blank, id: currentProject.id, name: currentProject.name });
    showToast('Projeto resetado.');
  }, [currentProject.name, currentProject.id, updateProject, showToast]);

  const exportCurrentProject = useCallback(() => {
    exportProjectToJson(currentProject);
    showToast(`Projeto "${currentProject.name}" exportado como JSON.`);
  }, [currentProject, showToast]);

  const importProjectFromJson = useCallback((jsonStr: string): boolean => {
    try {
      const imported = parseProjectJson(jsonStr);
      const nextList = [imported, ...projectsList];
      persist(nextList, imported.id);
      showToast(`Projeto "${imported.name}" importado com sucesso!`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao importar JSON.';
      showToast(`Erro na importação: ${msg}`);
      return false;
    }
  }, [projectsList, persist, showToast]);

  const addAntiSlopToAvoid = useCallback((itemName: string) => {
    const currentAvoid = currentProject.avoidList;
    if (!currentAvoid.includes(itemName)) {
      updateProject({
        avoidList: [...currentAvoid, itemName]
      });
      showToast(`"${itemName}" adicionado ao EVITAR.`);
    } else {
      showToast(`"${itemName}" já está na lista EVITAR.`);
    }
  }, [currentProject.avoidList, updateProject, showToast]);

  const removeAntiSlopFromAvoid = useCallback((itemName: string) => {
    updateProject({
      avoidList: currentProject.avoidList.filter(item => item !== itemName)
    });
    showToast(`"${itemName}" removido da lista EVITAR.`);
  }, [currentProject.avoidList, updateProject, showToast]);

  const toggleMode = useCallback((mode: GenerationMode) => {
    const modes = currentProject.activeModes;
    const exists = modes.includes(mode);
    const updated = exists ? modes.filter(m => m !== mode) : [...modes, mode];
    updateProject({ activeModes: updated });
    showToast(exists ? `Modo ${mode} desativado.` : `Modo ${mode} ativado!`);
  }, [currentProject.activeModes, updateProject, showToast]);

  const toggleDiagnostic = useCallback((field: keyof ProjectData['diagnosticState']) => {
    const current = currentProject.diagnosticState;
    updateProject({
      diagnosticState: {
        ...current,
        [field]: !current[field]
      }
    });
  }, [currentProject.diagnosticState, updateProject]);

  const toggleChecklist = useCallback((itemId: string) => {
    const cur = currentProject.checklistState;
    updateProject({
      checklistState: {
        ...cur,
        [itemId]: !cur[itemId]
      }
    });
  }, [currentProject.checklistState, updateProject]);

  const addPromptVersion = useCallback((prompt: string, reason: string, source: PromptSource, diffSummary?: string) => {
    const currentVersions = currentProject.promptVersions || [];
    const nextVersionNum = currentVersions.length > 0 ? Math.max(...currentVersions.map(v => v.versionNumber)) + 1 : 1;
    const newVersion: PromptVersion = {
      id: `pv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: nextVersionNum,
      timestamp: new Date().toISOString(),
      prompt,
      reason,
      source,
      diffSummary
    };
    updateProject({
      customPrompt: prompt,
      promptVersions: [newVersion, ...currentVersions]
    });
    showToast(`Versão v${nextVersionNum} do prompt salva no histórico.`);
  }, [currentProject.promptVersions, updateProject, showToast]);

  const restorePromptVersion = useCallback((versionId: string) => {
    const version = currentProject.promptVersions?.find(v => v.id === versionId);
    if (!version) return;
    updateProject({
      customPrompt: version.prompt
    });
    showToast(`Prompt restaurado para versão v${version.versionNumber}.`);
  }, [currentProject.promptVersions, updateProject, showToast]);

  const saveAIAnalysis = useCallback((analysis: ThumbnailAIAnalysis) => {
    const existing = currentProject.aiAnalyses || [];
    updateProject({
      aiAnalyses: [analysis, ...existing]
    });
    showToast('Análise de IA registrada.');
  }, [currentProject.aiAnalyses, updateProject, showToast]);

  const saveAIComparison = useCallback((comparison: ThumbnailAIComparison) => {
    const existing = currentProject.aiComparisons || [];
    updateProject({
      aiComparisons: [comparison, ...existing]
    });
    showToast('Comparação A × B registrada.');
  }, [currentProject.aiComparisons, updateProject, showToast]);

  const toggleReferenceLock = useCallback((lock: ReferenceLock) => {
    const currentLocks = currentProject.referenceLocks || [];
    const exists = currentLocks.includes(lock);
    const updated = exists ? currentLocks.filter(l => l !== lock) : [...currentLocks, lock];
    updateProject({ referenceLocks: updated });
    showToast(exists ? `Trava ${lock} desativada.` : `Trava ${lock} ativada no prompt!`);
  }, [currentProject.referenceLocks, updateProject, showToast]);

  const updateReferenceRoles = useCallback((refId: string, roles: ReferenceRole[]) => {
    const updatedRefs = currentProject.references.map(r => (r.id === refId ? { ...r, roles } : r));
    updateProject({ references: updatedRefs });
    showToast('Funções da referência atualizadas.');
  }, [currentProject.references, updateProject, showToast]);

  const addExperimentEntry = useCallback((entry: Omit<ExperimentEntry, 'id' | 'createdAt'>) => {
    const newEntry: ExperimentEntry = {
      ...entry,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const existing = currentProject.experimentJournal || [];
    updateProject({ experimentJournal: [newEntry, ...existing] });
    showToast('Novo experimento adicionado ao Diário.');
  }, [currentProject.experimentJournal, updateProject, showToast]);

  const updateExperimentEntry = useCallback((id: string, updates: Partial<ExperimentEntry>) => {
    const existing = currentProject.experimentJournal || [];
    const updated = existing.map(e => (e.id === id ? { ...e, ...updates } : e));
    updateProject({ experimentJournal: updated });
    showToast('Experimento atualizado.');
  }, [currentProject.experimentJournal, updateProject, showToast]);

  const deleteExperimentEntry = useCallback((id: string) => {
    const existing = currentProject.experimentJournal || [];
    updateProject({ experimentJournal: existing.filter(e => e.id !== id) });
    showToast('Experimento removido.');
  }, [currentProject.experimentJournal, updateProject, showToast]);

  const applyAIProposedCorrection = useCallback((field: keyof ProjectData, value: unknown) => {
    updateProject({ [field]: value });
    showToast(`Direção atualizada: "${String(field)}".`);
  }, [updateProject, showToast]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projectsList,
        isLoaded,
        updateProject,
        switchProject,
        createNewProject,
        duplicateCurrentProject,
        deleteCurrentProject,
        renameCurrentProject,
        resetCurrentProject,
        exportCurrentProject,
        importProjectFromJson,
        addAntiSlopToAvoid,
        removeAntiSlopFromAvoid,
        toggleMode,
        toggleDiagnostic,
        toggleChecklist,
        addPromptVersion,
        restorePromptVersion,
        saveAIAnalysis,
        saveAIComparison,
        toggleReferenceLock,
        updateReferenceRoles,
        addExperimentEntry,
        updateExperimentEntry,
        deleteExperimentEntry,
        applyAIProposedCorrection,
        toastMessage,
        showToast
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
