'use client';

import React, { useState, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  FolderOpen,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Edit2,
  Check,
  ChevronDown
} from 'lucide-react';

export function Header() {
  const {
    currentProject,
    projectsList,
    switchProject,
    createNewProject,
    duplicateCurrentProject,
    deleteCurrentProject,
    renameCurrentProject,
    resetCurrentProject,
    exportCurrentProject,
    importProjectFromJson,
    toastMessage
  } = useProject();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(currentProject.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = () => {
    setRenameValue(currentProject.name);
    setIsRenaming(true);
    setIsDropdownOpen(false);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      renameCurrentProject(renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importProjectFromJson(content);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono font-bold text-sm">
              TAS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 uppercase">
                  Thumbnail Anti-Slop
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
                  v1.0 • Direção Visual
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Direção visual para thumbnails que parecem dirigidas por uma pessoa — não montadas por IA.
              </p>
            </div>
          </div>

          {/* Project Management Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Switcher Dropdown */}
            <div className="relative">
              {isRenaming ? (
                <form onSubmit={handleSaveRename} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="bg-zinc-900 border border-amber-500 text-zinc-100 text-xs rounded px-2.5 py-1.5 focus:outline-none w-48 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded bg-amber-500 text-zinc-950 hover:bg-amber-400 transition"
                    title="Confirmar nome"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-medium transition"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span className="max-w-[160px] truncate">{currentProject.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400 border-b border-zinc-800">
                    Projetos Locais ({projectsList.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    {projectsList.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          switchProject(proj.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                          proj.id === currentProject.id
                            ? 'bg-amber-500/10 text-amber-400 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        {proj.id === currentProject.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-zinc-800 pt-1 mt-1">
                    <button
                      onClick={() => {
                        createNewProject();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      Novo Projeto
                    </button>
                    <button
                      onClick={handleStartRename}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      Renomear Atual
                    </button>
                    <button
                      onClick={() => {
                        duplicateCurrentProject();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      Duplicar Atual
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o projeto "${currentProject.name}"?`)) {
                          deleteCurrentProject();
                          setIsDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir Atual
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={exportCurrentProject}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition"
                title="Exportar Projeto como JSON"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition"
                title="Importar Projeto JSON"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Importar</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Deseja resetar os campos do projeto atual para os valores em branco?')) {
                    resetCurrentProject();
                  }
                }}
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs transition"
                title="Resetar Projeto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in bg-zinc-900 border border-amber-500/50 text-zinc-100 text-xs font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {toastMessage}
        </div>
      )}
    </header>
  );
}
