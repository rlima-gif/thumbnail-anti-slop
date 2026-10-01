'use client';

import React, { useState, useEffect } from 'react';
import { SimpleHeader } from '@/components/simple/Header';
import { ModeCreate } from '@/components/simple/ModeCreate';
import { ModeImprove } from '@/components/simple/ModeImprove';
import { ModeAnalyze } from '@/components/simple/ModeAnalyze';
import { HistoryModal } from '@/components/simple/HistoryModal';
import { getSimpleHistory } from '@/lib/simpleEngine/history';
import { SimpleHistoryItem } from '@/types/simple';

export default function Home() {
  const [currentMode, setCurrentMode] = useState<'CRIAR' | 'MELHORAR' | 'ANALISAR'>('CRIAR');
  const [historyItems, setHistoryItems] = useState<SimpleHistoryItem[]>(() => {
    return typeof window !== 'undefined' ? getSimpleHistory() : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState(false);

  // Check server AI status on mount
  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.configured) {
          setAiConfigured(true);
        }
      })
      .catch(() => {
        setAiConfigured(false);
      });
  }, []);

  const refreshHistory = () => {
    setHistoryItems(getSimpleHistory());
  };

  const handleNotify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0d] text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      {/* 1. Header with 3 Modes and History */}
      <SimpleHeader
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenHistory={() => setShowHistory(true)}
        historyCount={historyItems.length}
        aiConfigured={aiConfigured}
      />

      {/* 2. Main Work Area (Pure & Simple, Spacious Creative Canvas) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentMode === 'CRIAR' && (
          <ModeCreate
            onNotify={handleNotify}
            onRefreshHistoryCount={refreshHistory}
          />
        )}

        {currentMode === 'MELHORAR' && (
          <ModeImprove
            onNotify={handleNotify}
            onRefreshHistoryCount={refreshHistory}
          />
        )}

        {currentMode === 'ANALISAR' && (
          <ModeAnalyze
            onNotify={handleNotify}
            onRefreshHistoryCount={refreshHistory}
          />
        )}
      </main>

      {/* 3. Subtle Editorial Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/70 py-6 mt-16 text-center text-xs font-mono text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-semibold text-zinc-400">THUMBNAIL ANTI-SLOP</span>
          <span className="text-zinc-600 font-sans text-xs">Subtrair antes de decorar • Menos efeitos, mais decisões</span>
          <span className="text-zinc-500">100% Privado & Local</span>
        </div>
      </footer>

      {/* 4. History Modal */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        items={historyItems}
        onUpdateItems={setHistoryItems}
        onNotify={handleNotify}
      />

      {/* 5. Minimalist Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-amber-500/40 text-amber-300 px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-mono font-medium backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
