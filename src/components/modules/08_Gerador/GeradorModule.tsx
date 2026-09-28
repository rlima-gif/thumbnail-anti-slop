'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  generateDirectionSummary,
  generateFinalPrompt
} from '@/lib/promptGenerator';
import { runPromptConsistencyCheck } from '@/lib/heuristics';
import {
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';

export function GeradorModule() {
  const { currentProject, showToast } = useProject();

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const directionSummary = generateDirectionSummary(currentProject);
  const { promptText, negativeDirection } = generateFinalPrompt(currentProject);
  const warnings = runPromptConsistencyCheck(currentProject);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    showToast('Prompt principal em inglês copiado para a área de transferência!');
    setTimeout(() => setCopiedPrompt(false), 2800);
  };

  const handleCopyNegative = () => {
    navigator.clipboard.writeText(negativeDirection);
    setCopiedNegative(true);
    showToast('Negative direction (Avoid) copiada!');
    setTimeout(() => setCopiedNegative(false), 2800);
  };

  return (
    <section id="gerador" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 08 • Síntese & Prompt Art-Directed
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Gerador de Prompt Final
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Primeiro escolha a ideia. Depois escolha os efeitos. Decidir primeiro, promptar depois.&rdquo;
        </p>
      </div>

      {/* CONSISTENCY CHECK WARNINGS (Module 21) */}
      {warnings.length > 0 && (
        <div className="mb-8 p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Verificação de Consistência Pré-Geração ({warnings.length} observações)
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Checagem Determinística
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {warnings.map(warn => (
              <div
                key={warn.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-300">
                    {warn.title}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                    {warn.severity}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{warn.message}</p>
                <p className="text-[11px] text-zinc-400 font-mono italic pt-1">
                  💡 Sugestão: {warn.fixHint}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERMEDIATE DIRECTION SUMMARY (Module 19) */}
      <div className="mb-8 p-6 sm:p-7 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block mb-0.5">
              Etapa Intermediária Obrigatória
            </span>
            <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Resumo de Direção: Decidir Primeiro, Promptar Depois
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
            Filtro de Intenção Humana
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block">
              01 • CONCEITO
            </span>
            <p className="text-zinc-200">{directionSummary.conceito}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block">
              02 • PERGUNTA
            </span>
            <p className="text-amber-300 font-serif italic">{directionSummary.pergunta}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block">
              03 • PROTAGONISTA
            </span>
            <p className="text-zinc-200">{directionSummary.protagonista}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block">
              04 • COMPOSIÇÃO
            </span>
            <p className="text-zinc-200">{directionSummary.composicao}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-zinc-500 uppercase text-[10px] font-bold block">
              05 • CONTRASTE
            </span>
            <p className="text-zinc-200">{directionSummary.contraste}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span className="font-mono text-rose-400 uppercase text-[10px] font-bold block">
              06 • O QUE NÃO MOSTRAR
            </span>
            <p className="text-rose-300 truncate">
              {directionSummary.oQueNaoMostrar.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* FINAL STRUCTURED ENGLISH IMAGE PROMPT (Module 20) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
                Prompt Fotográfico Completo (English by Default)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                17 Blocos Estruturados
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight mt-0.5">
              Pronto para Midjourney, FLUX, Stable Diffusion ou Gemini Imagen
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyNegative}
              className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
            >
              {copiedNegative ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Negativo Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar Negative Direction</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>Prompt Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-950" />
                  <span>COPIAR PROMPT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Code Display */}
        <div className="relative">
          <pre className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800/90 text-xs font-mono text-zinc-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
            {promptText}
          </pre>
        </div>

        {/* Negative Direction Quick View */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
            Negative Direction / Negative Prompt Embutido:
          </span>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            {negativeDirection}
          </p>
        </div>
      </div>
    </section>
  );
}
