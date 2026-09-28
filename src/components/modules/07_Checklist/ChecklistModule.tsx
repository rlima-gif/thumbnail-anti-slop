'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { CHECKLIST_ITEMS } from '@/data/checklistItems';
import { evaluateChecklistStatus } from '@/lib/heuristics';
import { CheckSquare, Square, CheckCheck, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Leitura & Foco',
  'Narrativa & Título',
  'Luz & Realismo',
  'Subtração & Anti-Slop'
] as const;

export function ChecklistModule() {
  const { currentProject, toggleChecklist, updateProject, showToast } = useProject();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const checklistState = currentProject.checklistState || {};
  const { status, completed, total, percentage } = evaluateChecklistStatus(checklistState);

  const filteredItems = CHECKLIST_ITEMS.filter(item => {
    return selectedCategory === 'Todos' || item.category === selectedCategory;
  });

  const handleSelectAll = () => {
    const nextState: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach(item => {
      nextState[item.id] = true;
    });
    updateProject({ checklistState: nextState });
    showToast('Todos os critérios marcados como atendidos.');
  };

  const handleClearAll = () => {
    updateProject({ checklistState: {} });
    showToast('Checklist limpo.');
  };

  return (
    <section id="checklist" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 07 • Checklist de Controle de Qualidade
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Checklist Anti-Slop
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;O objetivo não é parecer uma thumbnail. É parecer uma cena que merece ser clicada.&rdquo;
        </p>
      </div>

      {/* OVERALL STATUS BANNER */}
      <div className="mb-8 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
            Status da Direção de Arte:
          </span>
          <div className="flex items-center gap-3">
            <span
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight uppercase ${
                status === 'DIREÇÃO CONSISTENTE'
                  ? 'text-emerald-400'
                  : status === 'FORTE'
                  ? 'text-amber-400'
                  : status === 'FUNCIONA'
                  ? 'text-blue-400'
                  : 'text-zinc-400'
              }`}
            >
              {status}
            </span>
            <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
              {completed} de {total} itens ({percentage}%)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            Marcar Todos
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-rose-500 text-zinc-400 hover:text-rose-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* PROGRESS TRACK */}
      <div className="w-full bg-zinc-950 rounded-full h-2 mb-8 overflow-hidden border border-zinc-800">
        <div
          className={`h-full transition-all duration-500 ${
            status === 'DIREÇÃO CONSISTENTE'
              ? 'bg-emerald-500'
              : status === 'FORTE'
              ? 'bg-amber-500'
              : status === 'FUNCIONA'
              ? 'bg-blue-500'
              : 'bg-zinc-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* CATEGORY FILTERS */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CHECKLIST ITEMS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map(item => {
          const isChecked = !!checklistState[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleChecklist(item.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer select-none flex items-start gap-3.5 ${
                isChecked
                  ? 'bg-zinc-900/90 border-amber-500/40 text-zinc-100'
                  : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="pt-0.5">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block mb-0.5 uppercase">
                  {item.category}
                </span>
                <p className={`text-xs leading-relaxed ${isChecked ? 'text-zinc-200 font-medium' : 'text-zinc-400'}`}>
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
