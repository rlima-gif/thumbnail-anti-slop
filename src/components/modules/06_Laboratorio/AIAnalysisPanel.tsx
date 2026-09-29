'use client';

import React, { useState } from 'react';
import {
  ThumbnailAIAnalysis,
  AnalysisRegion,
  UncertaintyLevel,
  ProjectData
} from '@/types';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Target,
  Wand2
} from 'lucide-react';

interface AIAnalysisPanelProps {
  analysis: ThumbnailAIAnalysis | null;
  isAnalyzing: boolean;
  unconfiguredError: boolean;
  onAnalyze: () => void;
  showRegions: boolean;
  onToggleRegions: () => void;
  onAddAvoid: (item: string) => void;
  onApplyCorrection: (field: keyof ProjectData, value: unknown) => void;
  hasImage: boolean;
}

export function AIAnalysisPanel({
  analysis,
  isAnalyzing,
  unconfiguredError,
  onAnalyze,
  showRegions,
  onToggleRegions,
  onAddAvoid,
  onApplyCorrection,
  hasImage
}: AIAnalysisPanelProps) {
  const [selectedRegion, setSelectedRegion] = useState<AnalysisRegion | null>(null);
  const [generatedPatchPrompt, setGeneratedPatchPrompt] = useState<string | null>(null);
  const [copiedPatch, setCopiedPatch] = useState(false);

  const getUncertaintyBadge = (level: UncertaintyLevel) => {
    switch (level) {
      case 'CONFIDENT':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            CONFIDENT
          </span>
        );
      case 'LIKELY':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            LIKELY
          </span>
        );
      case 'UNCERTAIN':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            UNCERTAIN
          </span>
        );
    }
  };

  const handleGeneratePatchPrompt = (region: AnalysisRegion) => {
    const patch = [
      `[TARGETED CORRECTION PATCH — REGION: "${region.label}"]`,
      `VISIBLE EVIDENCE: ${region.visibleEvidence}`,
      `DETECTED PROBLEM: ${region.interpretation}`,
      `PRESERVATION MANDATE: Lock all other composition, subject silhouette and camera settings exactly as is. Only modify the localized area specified.`,
      `REQUIRED RECTIFICATION: Replace artificial/unmotivated artifact in region [x:${Math.round(region.x*100)}%, y:${Math.round(region.y*100)}%, w:${Math.round(region.width*100)}%, h:${Math.round(region.height*100)}%] with authentic photographic falloff, motivated light or natural material texture.`,
      `AVOID: Reinterpreting facial structure, moving the protagonist or introducing generic neon graphics.`
    ].join('\n\n');

    setGeneratedPatchPrompt(patch);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
              Crítica Multimodal com IA (OpenAI Vision)
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Separação estrita entre evidência física visível e interpretação de hipóteses com níveis explícitos de incerteza.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {analysis && (
            <button
              type="button"
              onClick={onToggleRegions}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition ${
                showRegions
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{showRegions ? 'Ocultar Marcações' : 'Mostrar Marcações'} ({analysis.regions.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !hasImage}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'ANALISANDO COM IA...' : 'ANALISAR COM IA'}</span>
          </button>
        </div>
      </div>

      {/* UNCONFIGURED BANNER (Module Requirement) */}
      {unconfiguredError && (
        <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-amber-500/50 space-y-2 text-zinc-300">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            ANÁLISE POR IA NÃO CONFIGURADA
          </div>
          <p className="text-xs leading-relaxed">
            A análise multimodal de imagens requer a definição da variável <code className="text-amber-300 font-mono px-1 py-0.5 bg-zinc-900 rounded">OPENAI_API_KEY</code> no arquivo de variáveis de ambiente do servidor (<code className="text-amber-300 font-mono px-1 py-0.5 bg-zinc-900 rounded">.env.local</code>).
          </p>
          <p className="text-[11px] text-zinc-400 font-mono">
            ℹ️ Todos os testes manuais de estresse óptico (escala 10%, blur, silhueta, escala de cinza, safe zones e simulador de feed) permanecem 100% funcionais e independentes de IA.
          </p>
        </div>
      )}

      {/* NO ANALYSIS EMPTY STATE */}
      {!analysis && !unconfiguredError && (
        <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800/80 space-y-2">
          <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto" />
          <h4 className="text-xs font-mono uppercase font-bold text-zinc-300">
            Nenhuma análise por IA executada nesta thumbnail
          </h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {hasImage
              ? 'Clique em "ANALISAR COM IA" para receber uma crítica multimodal estruturada com regiões anotadas, detecção de slop e uma proposta de correção de maior impacto.'
              : 'Carregue uma imagem de miniatura no topo para desbloquear a análise multimodal com IA.'}
          </p>
        </div>
      )}

      {/* STRUCTURED ANALYSIS RESULTS */}
      {analysis && (
        <div className="space-y-6">
          {/* UMA ALTERAÇÃO DE MAIOR IMPACTO (Highlight Card) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black">
                ★ UMA ALTERAÇÃO DE MAIOR IMPACTO
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                Prioridade Máxima
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-100 leading-relaxed font-sans">
              {analysis.highestImpactChange}
            </p>
          </div>

          {/* EVIDENCE VS INTERPRETATION: PRIMARY FOCAL POINT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Focal Point Card */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
                  Ponto Focal Primário
                </span>
                {getUncertaintyBadge(analysis.primaryFocalPoint.uncertainty)}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Evidência Física Visível:
                  </span>
                  <p className="text-zinc-200 font-mono text-[11px] leading-relaxed mt-0.5">
                    {analysis.primaryFocalPoint.evidence}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                    Interpretação de Hipótese:
                  </span>
                  <p className="text-zinc-300 leading-relaxed mt-0.5 font-sans">
                    {analysis.primaryFocalPoint.interpretation}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Hierarchy & Readability Card */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
                  Hierarquia & Leitura Mobile
                </span>
                <span className="text-[10px] font-mono text-zinc-400">120px Test</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Hierarquia do Olhar:
                  </span>
                  <p className="text-zinc-300 leading-relaxed mt-0.5">
                    {analysis.visualHierarchy}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                    Leitura Reduzida:
                  </span>
                  <p className="text-zinc-300 leading-relaxed mt-0.5">
                    {analysis.mobileReadability}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY FOCAL POINTS & COHERENCE METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                Separação Figura / Fundo
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {analysis.subjectBackgroundSeparation}
              </p>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                Coerência de Iluminação
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {analysis.lightingCoherence}
              </p>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">
                Título × Thumbnail Delta
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {analysis.titleThumbnailRelationship}
              </p>
            </div>
          </div>

          {/* SIGNALS: SLOP DETECTED WITH QUICK-ADD TO EVITAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Slop & Artifacts */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Sinais de AI Slop / Artefatos ({analysis.slopSignals.length + analysis.aiArtifactSignals.length})
              </span>

              {analysis.slopSignals.length === 0 && analysis.aiArtifactSignals.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono">
                  Nenhum vício óbvio de render artificial detectado pelo modelo.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...analysis.slopSignals, ...analysis.aiArtifactSignals].map((signal, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-zinc-200">{signal}</span>
                      <button
                        type="button"
                        onClick={() => onAddAvoid(signal)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold shrink-0 transition"
                      >
                        + EVITAR
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unnecessary Elements & Redundancy */}
            <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Elementos Dispensáveis / Competidores ({analysis.unnecessaryElements.length})
              </span>

              {analysis.unnecessaryElements.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono">
                  Composição enxuta e focada sem ruído parasita detectado.
                </p>
              ) : (
                <div className="space-y-2">
                  {analysis.unnecessaryElements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-zinc-300">{item}</span>
                      <button
                        type="button"
                        onClick={() => onAddAvoid(item)}
                        className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0 transition"
                      >
                        Subtrair
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ANNOTATED REGIONS BREAKDOWN */}
          {analysis.regions && analysis.regions.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Regiões Mapeadas na Imagem ({analysis.regions.length})
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Coordenadas Normalizadas [0 - 1]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.regions.map(region => (
                  <div
                    key={region.id}
                    onClick={() => setSelectedRegion(region)}
                    className={`p-4 rounded-2xl border text-xs space-y-2 cursor-pointer transition ${
                      selectedRegion?.id === region.id
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {region.label}
                      </span>
                      {getUncertaintyBadge(region.uncertainty)}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] text-zinc-400">
                        <span className="font-mono text-zinc-500 uppercase text-[9px] block">Evidência:</span>
                        {region.visibleEvidence}
                      </div>
                      <div className="text-[11px] text-zinc-300">
                        <span className="font-mono text-amber-500/80 uppercase text-[9px] block">Interpretação:</span>
                        {region.interpretation}
                      </div>
                    </div>

                    {/* Region Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-850">
                      {region.patchProposal?.field && region.patchProposal?.proposedValue && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApplyCorrection(
                              region.patchProposal!.field!,
                              region.patchProposal!.proposedValue!
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Aplicar à Direção
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGeneratePatchPrompt(region);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[10px] flex items-center gap-1 transition"
                      >
                        <Wand2 className="w-3 h-3 text-amber-400" />
                        Corrigir Apenas Este Problema
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TARGETED PATCH PROMPT MODAL / CARD */}
          {generatedPatchPrompt && (
            <div className="p-5 rounded-2xl bg-zinc-950 border-2 border-amber-500/70 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  Patch Prompt Gerado para Correção Pontual
                </span>
                <button
                  type="button"
                  onClick={() => setGeneratedPatchPrompt(null)}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300"
                >
                  Fechar
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Instrui a ferramenta de imagem (Inpainting / Regional Prompting) a corrigir exclusivamente a área defeituosa sem alterar o restante da imagem.
              </p>
              <pre className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
                {generatedPatchPrompt}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedPatchPrompt);
                  setCopiedPatch(true);
                  setTimeout(() => setCopiedPatch(false), 2500);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedPatch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPatch ? 'Copiado!' : 'Copiar Patch Prompt'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
