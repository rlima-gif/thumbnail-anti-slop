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
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      {/* Input Section */}
      <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-mono mb-1">
            MELHORAR UM PROMPT
          </h2>
          <p className="text-xs text-zinc-400">
            Cole um prompt cheio de efeitos e deixe o motor subtrair o slop, equilibrar a luz e restaurar o realismo fotográfico.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
            Cole Seu Prompt
          </label>
          <textarea
            rows={5}
            value={rawPrompt}
            onChange={e => setRawPrompt(e.target.value)}
            placeholder="Ex: Make an epic gaming thumbnail with neon lighting, dramatic glow, particles, excited man holding Legion Go with mouth wide open..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition resize-y font-mono leading-relaxed"
          />
        </div>

        <button
          type="button"
          onClick={handleImprove}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono font-bold text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>PURIFICANDO E REMOVENDO SLOP...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-zinc-950" />
              <span>REMOVER O SLOP</span>
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* O Que Mudei */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-mono">
                O QUE MUDEI ({result.changes.length} AJUSTES)
              </h3>
            </div>

            <ul className="space-y-2.5">
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
          </div>

          {/* Prompt Melhorado */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold block">
                  Prompt Melhorado
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Livre de clichês descartáveis, com iluminação motivada e separação óptica de planos
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0"
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

            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap select-all max-h-96 overflow-y-auto">
              {result.improvedPrompt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
