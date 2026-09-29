'use client';

import React, { useState, useRef } from 'react';
import { ThumbnailAIComparison } from '@/types';
import {
  X,
  Upload,
  Split,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface ABCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  onSaveComparison: (comp: ThumbnailAIComparison) => void;
  showToast: (msg: string) => void;
}

export function ABCompareModal({
  isOpen,
  onClose,
  videoTitle,
  onSaveComparison,
  showToast
}: ABCompareModalProps) {
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [hypothesisA, setHypothesisA] = useState('Enfoque na vulnerabilidade humana e no olhar do criador');
  const [hypothesisB, setHypothesisB] = useState('Enfoque no objeto heroico / fetiche tátil de hardware');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ThumbnailAIComparison | null>(null);
  const [unconfiguredError, setUnconfiguredError] = useState(false);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (uri: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor envie um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const uri = ev.target?.result as string;
      if (uri) setter(uri);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleRunComparison = async () => {
    if (!imageA || !imageB) {
      showToast('Carregue as duas miniaturas (Variante A e Variante B) para comparar.');
      return;
    }

    setIsComparing(true);
    setUnconfiguredError(false);

    try {
      const res = await fetch('/api/ai/compare-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUriA: imageA,
          imageUriB: imageB,
          videoTitle: videoTitle || 'Vídeo Editorial',
          hypothesisA,
          hypothesisB
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setUnconfiguredError(true);
          showToast('ANÁLISE POR IA NÃO CONFIGURADA. Configure OPENAI_API_KEY no servidor.');
        } else {
          showToast(data.error || 'Erro na comparação de miniaturas.');
        }
        return;
      }

      setComparisonResult(data.comparison);
      onSaveComparison(data.comparison);
      showToast('Comparação A × B realizada com sucesso!');
    } catch {
      showToast('Falha na conexão com o servidor para comparação.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Split className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
                Comparador Multimodal A × B
              </h3>
              <p className="text-xs text-zinc-400">
                Avaliação objetiva de hipóteses visuais sem adivinhação de CTR.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Image Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variant A */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Variante A
              </span>
              <button
                type="button"
                onClick={() => fileInputARef.current?.click()}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                {imageA ? 'Trocar Imagem' : 'Carregar Imagem A'}
              </button>
              <input
                ref={fileInputARef}
                type="file"
                accept="image/*"
                onChange={e => handleUpload(e, setImageA)}
                className="hidden"
              />
            </div>

            <div className="aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              {imageA ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageA} alt="Variante A" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 space-y-1">
                  <Upload className="w-6 h-6 text-zinc-600 mx-auto" />
                  <span className="text-[10px] font-mono text-zinc-500 block">Nenhuma imagem carregada</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                Hipótese Narrativa A:
              </label>
              <input
                type="text"
                value={hypothesisA}
                onChange={e => setHypothesisA(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Variant B */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Variante B
              </span>
              <button
                type="button"
                onClick={() => fileInputBRef.current?.click()}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Upload className="w-3 h-3 text-amber-400" />
                {imageB ? 'Trocar Imagem' : 'Carregar Imagem B'}
              </button>
              <input
                ref={fileInputBRef}
                type="file"
                accept="image/*"
                onChange={e => handleUpload(e, setImageB)}
                className="hidden"
              />
            </div>

            <div className="aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
              {imageB ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageB} alt="Variante B" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 space-y-1">
                  <Upload className="w-6 h-6 text-zinc-600 mx-auto" />
                  <span className="text-[10px] font-mono text-zinc-500 block">Nenhuma imagem carregada</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                Hipótese Narrativa B:
              </label>
              <input
                type="text"
                value={hypothesisB}
                onChange={e => setHypothesisB(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleRunComparison}
            disabled={isComparing || !imageA || !imageB}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isComparing ? 'COMPARANDO COM IA...' : 'COMPARAR HIPÓTESES A × B COM IA'}</span>
          </button>
        </div>

        {/* UNCONFIGURED BANNER */}
        {unconfiguredError && (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/40 text-xs text-zinc-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold uppercase">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              ANÁLISE POR IA NÃO CONFIGURADA
            </div>
            <p className="leading-relaxed">
              Configure <code className="text-amber-300 font-mono px-1 py-0.5 bg-zinc-950 rounded">OPENAI_API_KEY</code> no servidor para comparar duas imagens via visão computacional.
            </p>
          </div>
        )}

        {/* COMPARISON RESULTS */}
        {comparisonResult && (
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            {/* O que este teste está realmente testando */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                O Que Este Teste Está Realmente Testando:
              </span>
              <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                {comparisonResult.oQueEsteTesteEstaRealmenteTestando}
              </p>
            </div>

            {/* A Enfatiza vs B Enfatiza */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase block">
                  Variante A Enfatiza:
                </span>
                <p className="text-zinc-200">{comparisonResult.aEnfatiza}</p>
                {comparisonResult.riscosA && comparisonResult.riscosA.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-mono text-rose-400 block mb-0.5">Riscos de A:</span>
                    <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                      {comparisonResult.riscosA.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-2">
                <span className="font-mono font-bold text-amber-400 uppercase block">
                  Variante B Enfatiza:
                </span>
                <p className="text-zinc-200">{comparisonResult.bEnfatiza}</p>
                {comparisonResult.riscosB && comparisonResult.riscosB.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] font-mono text-rose-400 block mb-0.5">Riscos de B:</span>
                    <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                      {comparisonResult.riscosB.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Analytical Differences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Hierarquia
                </span>
                <p className="text-zinc-300">{comparisonResult.diferencasHierarquia}</p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Legibilidade Mobile
                </span>
                <p className="text-zinc-300">{comparisonResult.diferencasLegibilidade}</p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Curiosidade / Intriga
                </span>
                <p className="text-zinc-300">{comparisonResult.diferencasCuriosidade}</p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                  Artificialidade / Slop
                </span>
                <p className="text-zinc-300">{comparisonResult.diferencasArtificialidade}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
