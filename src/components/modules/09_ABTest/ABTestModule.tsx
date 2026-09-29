'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { generateABVariants, checkABVariantDiversity } from '@/lib/abGenerator';
import { Copy, Check, User, Box, Compass, AlertTriangle } from 'lucide-react';

export function ABTestModule() {
  const { currentProject, showToast } = useProject();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const variants = generateABVariants(currentProject);
  const diversity = checkABVariantDiversity(variants);

  const handleCopyVariantPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    showToast(`Prompt da Hipótese ${id} copiado!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="ab-test" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 09 • Teste de Hipóteses
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Gerador de 3 Hipóteses A/B
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Testar A/B não é trocar a cor da camiseta do criador. É testar se a história funciona melhor por um Rosto, por um Objeto ou por uma Situação.&rdquo;
        </p>
      </div>

      {/* DIVERSITY WARNING BANNER */}
      {!diversity.isDiverse && diversity.warning && (
        <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            Alerta de Diversidade de Hipóteses
          </div>
          <p className="text-xs leading-relaxed">{diversity.warning}</p>
          {diversity.reasons.length > 0 && (
            <ul className="list-disc list-inside text-[11px] text-amber-300/80 space-y-0.5">
              {diversity.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* THREE CONCEPTUAL VARIANTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {variants.map(variant => {
          const Icon =
            variant.type === 'PERSONAGEM' ? User : variant.type === 'OBJETO' ? Box : Compass;

          return (
            <div
              key={variant.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 flex flex-col justify-between transition shadow-xl"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                      {variant.id}
                    </span>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        HIPÓTESE {variant.id}
                      </h4>
                      <div className="text-sm font-black text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-amber-400" />
                        {variant.type}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    Conceito Puro
                  </span>
                </div>

                {/* Narrative Breakdown */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-mono text-amber-400 uppercase text-[10px] font-bold block mb-0.5">
                      Tese do Clique:
                    </span>
                    <p className="text-zinc-200 leading-relaxed">{variant.hypothesis}</p>
                  </div>

                  <div>
                    <span className="font-mono text-zinc-400 uppercase text-[10px] font-bold block mb-0.5">
                      Pergunta Silenciosa:
                    </span>
                    <p className="text-amber-300 font-serif italic">{variant.viewerQuestion}</p>
                  </div>

                  <div>
                    <span className="font-mono text-zinc-400 uppercase text-[10px] font-bold block mb-0.5">
                      Protagonista Proposto:
                    </span>
                    <p className="text-zinc-300">{variant.protagonist}</p>
                  </div>

                  <div>
                    <span className="font-mono text-zinc-400 uppercase text-[10px] font-bold block mb-0.5">
                      Composição & Contraste:
                    </span>
                    <p className="text-zinc-400 leading-relaxed">
                      {variant.composition} {variant.contrast}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                    <div>
                      <span className="text-emerald-400 font-bold block">O que muda:</span>
                      <span className="text-zinc-400">{variant.whatChanges}</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-bold block">O que permanece:</span>
                      <span className="text-zinc-400">{variant.whatRemains}</span>
                    </div>
                  </div>
                </div>

                {/* Prompt Preview */}
                <div className="pt-2">
                  <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block mb-1">
                    Prompt Especializado:
                  </span>
                  <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/90 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {variant.prompt}
                  </pre>
                </div>
              </div>

              {/* Copy Action */}
              <div className="mt-5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleCopyVariantPrompt(variant.id, variant.prompt)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-amber-500 text-zinc-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition"
                >
                  {copiedId === variant.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Prompt Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copiar Prompt da Hipótese {variant.id}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
