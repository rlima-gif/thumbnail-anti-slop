'use client';

import React from 'react';
import { History, Sparkles, Cpu } from 'lucide-react';

interface HeaderProps {
  currentMode: 'CRIAR' | 'MELHORAR' | 'ANALISAR';
  onSelectMode: (mode: 'CRIAR' | 'MELHORAR' | 'ANALISAR') => void;
  onOpenHistory: () => void;
  historyCount: number;
  aiConfigured: boolean;
}

export function SimpleHeader({
  currentMode,
  onSelectMode,
  onOpenHistory,
  historyCount,
  aiConfigured
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-base font-black tracking-wider uppercase text-zinc-100 font-mono">
              THUMBNAIL ANTI-SLOP
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                aiConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700'
              }`}
              title={
                aiConfigured
                  ? 'OpenAI Vision & Text configurados no servidor'
                  : 'Operando no modo local com motor determinístico anti-slop'
              }
            >
              {aiConfigured ? (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  <span>IA Nuvem Ativa</span>
                </>
              ) : (
                <>
                  <Cpu className="w-2.5 h-2.5 text-zinc-400" />
                  <span>Motor Local Anti-Slop</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Crie prompts de thumbnail que parecem dirigidos por uma pessoa — não por uma IA genérica.
          </p>
        </div>

        {/* Action: History Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono border border-zinc-800 transition"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>Histórico</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-zinc-800 text-zinc-300 font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3 Main Modes Navigation Bar */}
      <div className="border-t border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center sm:justify-start gap-1 py-2">
            <button
              type="button"
              onClick={() => onSelectMode('CRIAR')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 ${
                currentMode === 'CRIAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              CRIAR
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('MELHORAR')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 ${
                currentMode === 'MELHORAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              MELHORAR PROMPT
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('ANALISAR')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition flex items-center gap-2 ${
                currentMode === 'ANALISAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              ANALISAR THUMBNAIL
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
