'use client';

import React, { useState, useMemo } from 'react';
import { useProject } from '@/context/ProjectContext';
import { ANTI_SLOP_CATALOG } from '@/data/antiSlopCatalog';
import { AI_ARTIFACT_SIGNALS } from '@/data/aiArtifactSignals';
import {
  ShieldAlert,
  Search,
  Plus,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Expressão & Rosto',
  'Efeitos & Iluminação',
  'Composição & Elementos',
  'Tipografia',
  'Render & IA'
] as const;

export function AntiSlopModule() {
  const { currentProject, addAntiSlopToAvoid, removeAntiSlopFromAvoid } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [expandedSignals, setExpandedSignals] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    return ANTI_SLOP_CATALOG.filter(item => {
      const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.whyItHarms.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleSignal = (id: string) => {
    setExpandedSignals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="anti-slop" className="scroll-mt-24 py-12 border-b border-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 04 • Defesa Visual & Blindagem
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Catálogo Anti-Slop
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Subtrair antes de decorar. Cada efeito dispensável removido é uma dose extra de autoridade que você devolve à imagem.&rdquo;
        </p>
      </div>

      {/* ACTIVE AVOID LIST TRAY */}
      <div className="mb-8 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Lista Ativa no Projeto &quot;EVITAR&quot; ({currentProject.avoidList.length} itens)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Injetados no Negative Prompt
          </span>
        </div>

        {currentProject.avoidList.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">
            Nenhum item adicionado à lista de exclusão. Navegue pelo catálogo abaixo e clique em &quot;Adicionar ao EVITAR&quot;.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentProject.avoidList.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeAntiSlopFromAvoid(item)}
                  className="hover:text-rose-100 p-0.5 rounded transition"
                  title="Remover da lista EVITAR"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar clichê visual (ex: contorno branco, glow, fogo)..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CATALOG GRID OF THE 29 ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isAlreadyInAvoid = currentProject.avoidList.some(
            a => a.toLowerCase() === item.name.toLowerCase()
          );

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isAlreadyInAvoid
                  ? 'bg-zinc-950/80 border-rose-500/30'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                    {item.category}
                  </span>
                  {isAlreadyInAvoid && (
                    <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> NO EVITAR
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-black text-zinc-100 tracking-tight uppercase mb-2">
                  {item.name}
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  {item.explanation}
                </p>

                <div className="space-y-2 text-[11px] border-t border-zinc-800/80 pt-2.5">
                  <div>
                    <span className="text-amber-400 font-bold block">Por que acontece:</span>
                    <span className="text-zinc-400">{item.whyItHappens}</span>
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold block">Por que prejudica:</span>
                    <span className="text-zinc-400">{item.whyItHarms}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-bold block">Quando pode ser intencional:</span>
                    <span className="text-zinc-500">{item.whenItMayBeIntentional}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800">
                {isAlreadyInAvoid ? (
                  <button
                    type="button"
                    onClick={() => removeAntiSlopFromAvoid(item.name)}
                    className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500 text-rose-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover do EVITAR
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addAntiSlopToAvoid(item.name)}
                    className="w-full py-1.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar ao EVITAR
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODULE 11 — AI ARTIFACT SIGNALS SECTION */}
      <div className="mt-14 bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Módulo 11 • Anatomia dos Artefatos
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 uppercase tracking-tight">
              O Que Faz uma Thumbnail Parecer Gerada por IA?
            </h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm">
            Painéis educativos para identificar os 16 gatilhos que denunciam amadorismo de render.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {AI_ARTIFACT_SIGNALS.map(signal => {
            const isExpanded = !!expandedSignals[signal.id];
            return (
              <div
                key={signal.id}
                className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 transition hover:border-zinc-700"
              >
                <div
                  onClick={() => toggleSignal(signal.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <h5 className="text-xs sm:text-sm font-bold text-zinc-200">
                      {signal.title}
                    </h5>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {signal.signal}
                </p>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold block mb-0.5">
                        Por que os modelos geram isso:
                      </span>
                      <p className="text-zinc-300">{signal.whyItHappens}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 uppercase font-bold block mb-0.5">
                        Como blindar no prompt:
                      </span>
                      <p className="text-zinc-200 font-mono text-[11px] bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                        {signal.howToDirectAgainst}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
