'use client';

import React, { useState } from 'react';
import { ANATOMY_CONCEPTS, READING_ORDER } from '@/data/anatomyConcepts';
import { Layers } from 'lucide-react';

export function AnatomiaModule() {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    focalPrimary: true,
    focalSecondary: true,
    negativeSpace: false,
    eyeVector: false,
    contrast: false,
    silhouette: false,
    leadingLines: false
  });

  const toggleLayer = (key: string) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="anatomia" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 05 • Gramática da Atenção
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Anatomia da Imagem
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Se tudo tem contraste, nada tem contraste. O cérebro humano decodifica formas e conflito em três etapas sucessivas.&rdquo;
        </p>
      </div>

      {/* READING ORDER STRIP */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {READING_ORDER.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-500 font-bold">{item.step}</span>
              <span className="text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded">{item.timing}</span>
            </div>
            <h4 className="text-sm font-bold text-zinc-100">{item.role}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">{item.description}</p>
            <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 italic font-serif">
              Regra: {item.rule}
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE VISUALIZER */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Visualizador Interativo de Camadas Anatômicas
            </h3>
            <p className="text-xs text-zinc-400">
              Ative ou desative as diretrizes visuais para inspecionar a física do olhar sobre o quadro 16:9.
            </p>
          </div>

          {/* Layer toggles */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => toggleLayer('focalPrimary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.focalPrimary
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Foco Primário
            </button>
            <button
              onClick={() => toggleLayer('focalSecondary')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.focalSecondary
                  ? 'bg-blue-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Foco Secundário
            </button>
            <button
              onClick={() => toggleLayer('negativeSpace')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.negativeSpace
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Espaço Negativo
            </button>
            <button
              onClick={() => toggleLayer('eyeVector')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.eyeVector
                  ? 'bg-rose-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Vetor do Olhar
            </button>
            <button
              onClick={() => toggleLayer('contrast')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.contrast
                  ? 'bg-purple-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Mapa de Contraste
            </button>
            <button
              onClick={() => toggleLayer('leadingLines')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                activeLayers.leadingLines
                  ? 'bg-cyan-500 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
              }`}
            >
              Linhas de Força
            </button>
          </div>
        </div>

        {/* 16:9 Canvas */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700 shadow-2xl flex items-center justify-center select-none">
          {/* Base Mock Composition */}
          <div className="absolute inset-0 bg-[#090a0d] flex items-center justify-between p-12">
            {/* Protagonist Mockup (Left 2/3) */}
            <div className="relative w-72 h-56 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
              <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                <span>PROTAGONISTA</span>
                <span className="text-amber-400">PRESENÇA 65%</span>
              </div>
              <div>
                <div className="w-20 h-1.5 bg-amber-500 rounded mb-2" />
                <div className="text-base font-bold text-zinc-100">SUJEITO PRINCIPAL</div>
                <div className="text-xs text-zinc-400">Silhueta nítida & Iluminação motivada</div>
              </div>
              <div className="text-[10px] font-mono text-zinc-500">Lente 85mm • Foco crítico</div>
            </div>

            {/* Subordinate Secondary Object (Right 1/3) */}
            <div className="w-48 h-36 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-blue-400 font-bold">OBJETO NARRATIVO</span>
              <div className="text-xs font-semibold text-zinc-300">Consequência / Mistério</div>
              <span className="text-[10px] font-mono text-zinc-500">Subordinado em escala</span>
            </div>
          </div>

          {/* OVERLAY: Focal Primary Target */}
          {activeLayers.focalPrimary && (
            <div className="absolute left-[28%] top-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-500 animate-spin-slow bg-amber-500/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
              </div>
              <span className="mt-2 text-[10px] font-mono font-bold bg-amber-500 text-zinc-950 px-2 py-0.5 rounded shadow">
                1º PONTO FOCAL (0 — 250ms)
              </span>
            </div>
          )}

          {/* OVERLAY: Focal Secondary Target */}
          {activeLayers.focalSecondary && (
            <div className="absolute right-[22%] top-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-dashed border-blue-400 bg-blue-500/10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
              </div>
              <span className="mt-2 text-[10px] font-mono font-bold bg-blue-500 text-zinc-950 px-2 py-0.5 rounded shadow">
                2º PONTO FOCAL (250 — 600ms)
              </span>
            </div>
          )}

          {/* OVERLAY: Negative Space Mask */}
          {activeLayers.negativeSpace && (
            <div className="absolute inset-0 pointer-events-none flex">
              <div className="w-1/2 h-full border-r border-dashed border-emerald-500/40" />
              <div className="w-1/2 h-full bg-emerald-500/10 border-l border-emerald-500/30 flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  ZONA DE RESPIRAÇÃO / ESPAÇO NEGATIVO
                </span>
              </div>
            </div>
          )}

          {/* OVERLAY: Eye Direction Vector */}
          {activeLayers.eyeVector && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 1000 562">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#f43f5e" />
                  </marker>
                </defs>
                <line
                  x1="320"
                  y1="250"
                  x2="720"
                  y2="310"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  markerEnd="url(#arrowhead)"
                />
                <text x="440" y="260" fill="#f43f5e" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  VETOR DO OLHAR: CONDUÇÃO NATURAL
                </text>
              </svg>
            </div>
          )}

          {/* OVERLAY: Contrast Heatmap */}
          {activeLayers.contrast && (
            <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-r from-purple-600/30 via-transparent to-transparent flex items-end p-6">
              <span className="text-[11px] font-mono text-purple-300 bg-zinc-950/80 px-3 py-1 rounded border border-purple-500/30">
                PICO DE CONTRASTE DE LUMINÂNCIA (KEY LIGHT EM 45º)
              </span>
            </div>
          )}

          {/* OVERLAY: Leading Lines */}
          {activeLayers.leadingLines && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-60" viewBox="0 0 1000 562">
                <line x1="0" y1="562" x2="320" y2="280" stroke="#06b6d4" strokeWidth="2" />
                <line x1="1000" y1="562" x2="320" y2="280" stroke="#06b6d4" strokeWidth="2" />
                <line x1="1000" y1="0" x2="320" y2="280" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="320" cy="280" r="8" fill="#06b6d4" />
                <text x="340" y="275" fill="#06b6d4" fontSize="12" fontFamily="monospace">
                  PONTO DE FUGA CENTRAL
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Anatomical Principles Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ANATOMY_CONCEPTS.map(concept => (
            <div
              key={concept.id}
              className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1.5"
            >
              <h5 className="text-xs font-bold text-zinc-200 uppercase font-mono">
                {concept.title}
              </h5>
              <p className="text-[11px] text-zinc-400">{concept.description}</p>
              <div className="pt-2 text-[10px] text-amber-400/90 font-mono">
                Impacto no clique: {concept.thumbnailImpact}
              </div>
              <div className="text-[10px] text-rose-400/90 font-mono">
                Erro comum: {concept.commonError}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
