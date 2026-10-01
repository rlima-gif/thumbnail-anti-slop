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
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Brand & Status Pill */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black tracking-wider uppercase text-zinc-100 font-mono">
                THUMBNAIL ANTI-SLOP
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                  aiConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700/80'
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
                    <span>IA Nuvem</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-2.5 h-2.5 text-zinc-400" />
                    <span>Local</span>
                  </>
                )}
              </span>
            </div>

            {/* History on mobile (visible on top-right of mobile header) */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono border border-zinc-800 transition"
              >
                <History className="w-3.5 h-3.5 text-zinc-400" />
                <span>Histórico</span>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-zinc-800 text-zinc-300 font-bold">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3 Tool Tabs (Sleek Creative Segmented Pill) */}
          <nav className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 w-full sm:w-auto justify-center gap-1">
            <button
              type="button"
              onClick={() => onSelectMode('CRIAR')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all ${
                currentMode === 'CRIAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              CRIAR
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('MELHORAR')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all ${
                currentMode === 'MELHORAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              MELHORAR PROMPT
            </button>
            <button
              type="button"
              onClick={() => onSelectMode('ANALISAR')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all ${
                currentMode === 'ANALISAR'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              ANALISAR THUMBNAIL
            </button>
          </nav>

          {/* History Button (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono border border-zinc-800/80 transition"
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
      </div>
    </header>
  );
}
