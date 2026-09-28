'use client';

import React, { useState, useMemo } from 'react';
import { GLOSSARY_TERMS } from '@/data/glossary';
import { Search, Lightbulb } from 'lucide-react';

const CATEGORIES = [
  'Todos',
  'Composição & Espaço',
  'Luz & Cor',
  'Narrativa & CTR',
  'Óptica & Câmera'
] as const;

export function GlossarioModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        (item.translationEn && item.translationEn.toLowerCase().includes(q)) ||
        item.definition.toLowerCase().includes(q) ||
        item.thumbnailRelevance.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <section id="glossario" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Referência Técnica • Dicionário Visual
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Glossário de Direção de Arte
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Vocabulário técnico transforma pedidos vagos em comandos precisos de iluminação, enquadramento e óptica.&rdquo;
        </p>
      </div>

      {/* SEARCH AND CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar termo técnico (ex: silhueta, luz motivada, delta)..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
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
      </div>

      {/* TERMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTerms.map((t, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 uppercase">
                  {t.category}
                </span>
                {t.translationEn && (
                  <span className="text-[10px] font-mono text-amber-500/80">
                    {t.translationEn}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-tight mb-2">
                {t.term}
              </h4>

              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                {t.definition}
              </p>

              <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] space-y-1 mb-2">
                <span className="text-amber-400 font-bold font-mono block text-[10px] uppercase">
                  Por que importa na Thumbnail:
                </span>
                <p className="text-zinc-300">{t.thumbnailRelevance}</p>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-zinc-400 italic flex items-start gap-1.5 border-t border-zinc-800/60">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Dica de Direção: {t.proTip}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
