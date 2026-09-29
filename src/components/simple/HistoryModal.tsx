'use client';

import React, { useState } from 'react';
import { X, Trash2, Clock, Copy, Check } from 'lucide-react';
import { SimpleHistoryItem } from '@/types/simple';
import { deleteSimpleHistoryItem, clearSimpleHistory } from '@/lib/simpleEngine/history';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SimpleHistoryItem[];
  onUpdateItems: (items: SimpleHistoryItem[]) => void;
  onNotify: (msg: string) => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  items,
  onUpdateItems,
  onNotify
}: HistoryModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSimpleHistoryItem(id);
    onUpdateItems(updated);
    onNotify('Item removido do histórico.');
  };

  const handleClearAll = () => {
    if (confirm('Deseja realmente limpar todo o histórico local?')) {
      clearSimpleHistory();
      onUpdateItems([]);
      onNotify('Histórico limpo com sucesso.');
    }
  };

  const handleCopyPrompt = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight font-mono">
              Histórico de Criações Locais ({items.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-mono text-zinc-500 hover:text-rose-400 px-2 py-1 rounded transition"
              >
                Limpar Tudo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-mono">
              Nenhuma criação no histórico recente.
            </div>
          ) : (
            items.map(item => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });

              let promptToCopy = '';
              const itemData = (item.data && typeof item.data === 'object' ? item.data : null) as Record<string, unknown> | null;
              if (item.mode === 'CRIAR' && itemData && typeof itemData.finalPrompt === 'string') {
                promptToCopy = itemData.finalPrompt;
              } else if (item.mode === 'MELHORAR' && itemData && typeof itemData.improvedPrompt === 'string') {
                promptToCopy = itemData.improvedPrompt;
              } else if (item.mode === 'ANALISAR' && itemData && typeof itemData.fixPrompt === 'string') {
                promptToCopy = itemData.fixPrompt;
              }

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-2xl space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.mode === 'CRIAR'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : item.mode === 'MELHORAR'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.mode}
                      </span>
                      <span className="text-xs font-bold text-zinc-200 truncate max-w-xs font-sans">
                        {item.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans leading-relaxed">
                    {item.previewSummary}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                    {promptToCopy ? (
                      <button
                        type="button"
                        onClick={e => handleCopyPrompt(item.id, promptToCopy, e)}
                        className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Prompt Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Prompt Salvo</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={e => handleDelete(item.id, e)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
