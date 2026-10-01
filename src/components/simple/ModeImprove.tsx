'use client';

import React, { useState } from 'react';
import { Wand2, Copy, Check, Sparkles, CheckCircle2 } from 'lucide-react';
import { ImprovePromptResult } from '@/types/simple';
import { improvePrompt } from '@/lib/simpleEngine/engine';
import { saveSimpleHistoryItem } from '@/lib/simpleEngine/history';

interface ModeImproveProps {
  onNotify: (msg: string) => void;
  onRefreshHistoryCount: () => void;
}

export function ModeImprove({ onNotify, onRefreshHistoryCount }: ModeImproveProps) {
  const [rawPrompt, setRawPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImprovePromptResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!rawPrompt.trim()) {
      onNotify('Cole o prompt que você deseja purificar.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/simple-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawPrompt })
      });

      let data: ImprovePromptResult;

      if (res.ok) {
        data = await res.json();
      } else {
        data = improvePrompt({ rawPrompt });
      }

      setResult(data);

      saveSimpleHistoryItem({
        mode: 'MELHORAR',
        title: rawPrompt.slice(0, 45) || 'Prompt Melhorado',
        previewSummary: data.changes[0] || 'Prompt purificado de AI slop',
        data
      });
      onRefreshHistoryCount();

      onNotify('Slop removido com sucesso!');
    } catch {
      const fallback = improvePrompt({ rawPrompt });
      setResult(fallback);
      onNotify('Prompt purificado pelo motor local.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improvedPrompt);
    setCopied(true);
    onNotify('Prompt melhorado copiado!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 sm:py-4">
      {/* Top Header / Intro */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
          MELHORAR PROMPT
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Cole um prompt carregado de clichês e deixe o motor subtrair o slop, equilibrar a luz e restaurar o realismo fotográfico.
        </p>
      </div>

      {/* Input Composer */}
      <div className="bg-zinc-900/80 border border-zinc-800 focus-within:border-amber-500/80 rounded-2xl p-4 sm:p-5 transition shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Prompt Original
          </label>
          <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
            Identifica e remove termos genéricos como neon, rim light forçada e poses exageradas
          </span>
        </div>

        <textarea
          rows={5}
          value={rawPrompt}
          onChange={e => setRawPrompt(e.target.value)}
          placeholder="Ex: Make an epic gaming thumbnail with neon lighting, dramatic glow, particles, excited man holding Legion Go with mouth wide open..."
          className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/80 transition resize-y leading-relaxed"
        />

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleImprove}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>REMOVENDO SLOP...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-zinc-950" />
                <span>REMOVER O SLOP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section (Side-by-Side Desktop ANTES | DEPOIS) */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-zinc-800/80 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: ANTES & O QUE MUDEI */}
            <div className="space-y-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
                      O QUE MUDEI ({result.changes.length} AJUSTES)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-emerald-500/30">
                    PURIFICADO
                  </span>
                </div>

                {/* List of changes */}
                <ul className="space-y-2">
                  {result.changes.map((change, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-sans leading-relaxed">{change}</span>
                    </li>
                  ))}
                </ul>

                {/* Original prompt recap */}
                <div className="pt-2 border-t border-zinc-800/60">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                    Original Enviado
                  </span>
                  <p className="text-[11px] font-mono text-zinc-400 line-clamp-3 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/60">
                    {rawPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: DEPOIS / PROMPT MELHORADO */}
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold block">
                      PROMPT MELHORADO
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                      Livre de artificialidade, com iluminação motivada e planos críveis
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-zinc-950" />
                        <span>COPIADO!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-950" />
                        <span>COPIAR</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap select-all max-h-[28rem] overflow-y-auto">
                  {result.improvedPrompt}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
