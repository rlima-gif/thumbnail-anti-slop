'use client';

import React from 'react';
import { Type, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TextDensityWidgetProps {
  text: string;
}

export function TextDensityWidget({ text }: TextDensityWidgetProps) {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordsCount = words.length;
  const charsCount = clean.length;

  let state: 'NONE' | 'IDEAL' | 'WARNING' | 'DENSE' = 'NONE';
  let label = 'Sem Texto (100% Visual)';
  let advice = 'Ideal para narrativa visual pura onde a imagem carrega o mistério e o título explica o contexto.';

  if (wordsCount > 0 && wordsCount <= 3) {
    state = 'IDEAL';
    label = 'Texto Curto (Ideal)';
    advice = 'Perfeito para leitura relâmpago no feed mobile (<100ms). Palavras curtas ancoram o olhar sem poluir a imagem.';
  } else if (wordsCount >= 4 && wordsCount <= 6) {
    state = 'WARNING';
    label = 'Atenção (Limite Mobile)';
    advice = 'No limite da legibilidade em telas pequenas de 120px. Certifique-se de usar fonte sem serifa pesada e fundo escurecido sob o texto.';
  } else if (wordsCount > 6) {
    state = 'DENSE';
    label = 'Texto Denso / Risco de Slop';
    advice = 'Frases longas na miniatura transformam a imagem em cartaz poluído. O espectador ignora textos com mais de 6 palavras no feed rápido.';
  }

  const badgeColor =
    state === 'IDEAL'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : state === 'WARNING'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : state === 'DENSE'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  const Icon =
    state === 'IDEAL'
      ? CheckCircle2
      : state === 'WARNING'
      ? AlertTriangle
      : state === 'DENSE'
      ? AlertCircle
      : Type;

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-300">
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Teste de Densidade de Texto</span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 ${badgeColor}`}>
          <Icon className="w-3 h-3" />
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Palavras</span>
          <span className="text-sm font-bold font-mono text-zinc-100">{wordsCount}</span>
        </div>
        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Caracteres</span>
          <span className="text-sm font-bold font-mono text-zinc-100">{charsCount}</span>
        </div>
        <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] font-mono text-zinc-500 uppercase block">Linhas Estim.</span>
          <span className="text-sm font-bold font-mono text-zinc-100">{wordsCount === 0 ? 0 : wordsCount > 4 ? 2 : 1}</span>
        </div>
      </div>

      {clean ? (
        <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-200 truncate">
          &ldquo;{clean}&rdquo;
        </div>
      ) : (
        <div className="p-2.5 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-xs font-mono text-zinc-500 italic">
          Nenhum texto definido na miniatura.
        </div>
      )}

      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
        {advice}
      </p>
    </div>
  );
}
