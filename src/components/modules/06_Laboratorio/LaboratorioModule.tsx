'use client';

import React, { useState, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  calculateVisualComplexity,
  calculateAiSlopRisk,
  generateCritiqueFeedback
} from '@/lib/heuristics';
import {
  Upload,
  Eye,
  Clock,
  X,
  Split,
  Wand2
} from 'lucide-react';
import { TextDensityWidget } from './TextDensityWidget';
import { FeedSimulator } from './FeedSimulator';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { ABCompareModal } from './ABCompareModal';

export function LaboratorioModule() {
  const {
    currentProject,
    updateProject,
    toggleDiagnostic,
    saveAIAnalysis,
    saveAIComparison,
    addAntiSlopToAvoid,
    applyAIProposedCorrection,
    showToast
  } = useProject();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Readability Tests state
  const [test10Percent, setTest10Percent] = useState(false);
  const [blurValue, setBlurValue] = useState(0); // 0 - 20px
  const [isSilhouette, setIsSilhouette] = useState(false);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [isSquintTest, setIsSquintTest] = useState(false);
  const [showEmphasisMap, setShowEmphasisMap] = useState(false);

  // AI Analysis state
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [unconfiguredError, setUnconfiguredError] = useState(false);
  const [showRegionsOverlay, setShowRegionsOverlay] = useState(true);
  const [isABModalOpen, setIsABModalOpen] = useState(false);

  // 1 Second Test state
  const [oneSecondActive, setOneSecondActive] = useState(false);
  const [oneSecondRevealed, setOneSecondRevealed] = useState(false);
  const [userNote, setUserNote] = useState(currentProject.oneSecondPerceptionNote || '');

  // Safe Zones state
  const [showTimestampOverlay, setShowTimestampOverlay] = useState(true);
  const [showEdgeSafety, setShowEdgeSafety] = useState(true);
  const [showMobileTitleZone, setShowMobileTitleZone] = useState(false);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState(false);

  const latestAnalysis = currentProject.aiAnalyses?.[0] || null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        updateProject({ uploadedImageUri: dataUri });
        showToast('Miniatura carregada localmente para testes!');
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAnalyzeWithAI = async () => {
    if (!currentProject.uploadedImageUri) {
      showToast('Carregue uma imagem de thumbnail antes de solicitar a análise por IA.');
      return;
    }
    setIsAnalyzingAI(true);
    setUnconfiguredError(false);

    try {
      const res = await fetch('/api/ai/analyze-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUri: currentProject.uploadedImageUri,
          videoTitle: currentProject.videoTitle,
          videoDescription: currentProject.videoDescription,
          niche: currentProject.niche,
          perceptionGoal: currentProject.perceptionGoal,
          protagonistType: currentProject.protagonistType,
          viewerQuestion: currentProject.viewerQuestion
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setUnconfiguredError(true);
          showToast('ANÁLISE POR IA NÃO CONFIGURADA. Configure OPENAI_API_KEY no servidor.');
        } else {
          showToast(data.error || 'Erro na análise da thumbnail.');
        }
        return;
      }
      saveAIAnalysis(data.analysis);
      setShowRegionsOverlay(true);
      showToast('Análise multimodal por IA concluída com sucesso!');
    } catch {
      showToast('Falha na comunicação com a API de análise.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const startOneSecondTest = () => {
    setOneSecondActive(true);
    setOneSecondRevealed(true);

    setTimeout(() => {
      setOneSecondRevealed(false);
      showToast('Tempo esgotado! Digite abaixo o que seu cérebro registrou primeiro.');
    }, 1000);
  };

  const handleSaveNote = () => {
    updateProject({ oneSecondPerceptionNote: userNote });
    showToast('Anotação de percepção salva!');
  };

  // Heuristic Results
  const complexity = calculateVisualComplexity(currentProject);
  const slopRisk = calculateAiSlopRisk(currentProject);
  const feedback = generateCritiqueFeedback(currentProject);

  const diag = currentProject.diagnosticState;

  return (
    <section id="laboratorio" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 06 • Laboratório de Validação Óptica
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Laboratório & Testes de Leitura
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Mais de 75% dos cliques ocorrem em telas mobile. Se a sua thumbnail falha nos testes de estresse óptico, ela falhará no algoritmo.&rdquo;
        </p>
      </div>

      {/* TOP: VISUAL STRESS TEST SUITE */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Visual Workspace & Canvas */}
          <div className="lg:w-7/12 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500" />
                Mesa de Testes de Estresse Óptico (16:9)
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsABModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-300 text-xs font-mono font-medium flex items-center gap-1.5 transition"
                >
                  <Split className="w-3.5 h-3.5 text-amber-400" />
                  <span>COMPARAR A × B</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzingAI || !currentProject.uploadedImageUri}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isAnalyzingAI ? 'ANALISANDO...' : 'ANALISAR COM IA'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-200 text-xs font-mono font-medium flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Carregar Imagem
                </button>
                {currentProject.uploadedImageUri && (
                  <button
                    onClick={() => updateProject({ uploadedImageUri: null })}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition"
                    title="Remover imagem enviada"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* The Testing Display Canvas */}
            <div
              className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-700 shadow-2xl transition-all duration-300 flex items-center justify-center ${
                test10Percent ? 'max-w-[160px] mx-auto ring-4 ring-amber-500/30' : ''
              }`}
            >
              {/* If user uploaded an image */}
              {currentProject.uploadedImageUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentProject.uploadedImageUri}
                  alt="Thumbnail para teste"
                  className="w-full h-full object-cover transition-all duration-200"
                  style={{
                    filter: `
                      blur(${blurValue}px)
                      ${isGrayscale ? 'grayscale(100%)' : ''}
                      ${isSilhouette ? 'contrast(300%) grayscale(100%) brightness(80%)' : ''}
                      ${isSquintTest ? 'blur(16px) contrast(140%) brightness(85%)' : ''}
                    `
                  }}
                />
              ) : (
                /* Default Fallback Sample Mockup */
                <div
                  className="w-full h-full relative bg-[#090a0d] p-6 flex flex-col justify-between overflow-hidden transition-all duration-200 select-none"
                  style={{
                    filter: `
                      blur(${blurValue}px)
                      ${isGrayscale ? 'grayscale(100%)' : ''}
                      ${isSilhouette ? 'contrast(350%) grayscale(100%) brightness(70%)' : ''}
                      ${isSquintTest ? 'blur(16px) contrast(140%) brightness(85%)' : ''}
                    `
                  }}
                >
                  <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>MOCKUP PADRÃO</span>
                    <span className="text-amber-400">16:9 NARRATIVO</span>
                  </div>

                  <div className="relative z-10 flex items-center justify-between px-6">
                    <div className="w-44 h-32 bg-zinc-900 border border-zinc-700 rounded-xl p-3 flex flex-col justify-between shadow-2xl">
                      <div className="text-[10px] font-mono text-amber-500 font-bold">PROTAGONISTA</div>
                      <div className="text-xs font-mono font-bold text-zinc-100">
                        {currentProject.protagonist || 'Chassi Industrial sob lona'}
                      </div>
                      <div className="text-[9px] text-zinc-400">Silhueta nítida 65%</div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black font-mono text-zinc-100 leading-none">
                        {currentProject.thumbnailText || '10 BI'}
                      </div>
                      <div className="text-[10px] font-mono text-amber-400 mt-1 uppercase">
                        A AUTÓPSIA
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-between text-[10px] font-mono text-zinc-400 border-t border-zinc-800 pt-2">
                    <span>Lente 85mm f/1.8</span>
                    <span>Espaço Negativo 35%</span>
                  </div>
                </div>
              )}

              {/* ESTIMATED EMPHASIS MAP */}
              {showEmphasisMap && (
                <div className="absolute inset-0 pointer-events-none z-25 flex flex-col justify-between p-3 select-none">
                  <div className="absolute inset-0 bg-radial from-amber-400/50 via-rose-500/30 to-blue-950/40 mix-blend-screen" />
                  <div className="relative z-10 self-start bg-black/85 border border-amber-500/50 rounded-lg px-2.5 py-1 text-[9px] font-mono text-amber-300 font-bold">
                    ESTIMATIVA HEURÍSTICA DE CONTRASTE — NÃO É EYE-TRACKING BIOMÉTRICO REAL
                  </div>
                </div>
              )}

              {/* ANNOTATED REGIONS BOUNDING BOXES */}
              {showRegionsOverlay && latestAnalysis?.regions?.map(r => (
                <div
                  key={r.id}
                  className="absolute border-2 border-amber-400 bg-amber-400/15 pointer-events-auto cursor-pointer z-25 transition hover:bg-amber-400/30 group"
                  style={{
                    left: `${Math.max(0, Math.min(100, r.x * 100))}%`,
                    top: `${Math.max(0, Math.min(100, r.y * 100))}%`,
                    width: `${Math.max(4, Math.min(100, r.width * 100))}%`,
                    height: `${Math.max(4, Math.min(100, r.height * 100))}%`
                  }}
                  title={`${r.label}: ${r.interpretation}`}
                >
                  <span className="absolute -top-5 left-0 bg-amber-500 text-zinc-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    {r.label}
                  </span>
                </div>
              ))}

              {/* 1-SECOND TEST CURTAIN OVERLAY */}
              {oneSecondActive && !oneSecondRevealed && (
                <div className="absolute inset-0 bg-zinc-950/95 z-30 flex flex-col items-center justify-center p-6 text-center">
                  <Clock className="w-8 h-8 text-amber-500 mb-2 animate-bounce" />
                  <h5 className="text-sm font-bold text-zinc-100 uppercase">
                    1 Segundo se esgotou!
                  </h5>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Qual foi o PRIMEIRO detalhe que seu cérebro registrou? Anote abaixo na área de reflexão.
                  </p>
                  <button
                    onClick={() => setOneSecondActive(false)}
                    className="mt-3 text-[11px] font-mono text-amber-400 hover:underline"
                  >
                    Encerrar teste de 1 segundo
                  </button>
                </div>
              )}

              {/* SAFE ZONES OVERLAYS (Module 14) */}
              {/* 1. YouTube Timestamp Obstruction */}
              {showTimestampOverlay && (
                <div className="absolute bottom-2.5 right-2.5 bg-black/90 text-white font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-lg border border-zinc-700 pointer-events-none z-20 flex items-center gap-1">
                  <span>14:28</span>
                  <span className="text-[9px] text-zinc-400 font-sans">(Timestamp UI)</span>
                </div>
              )}

              {/* 2. Edge Safety Margins */}
              {showEdgeSafety && (
                <div className="absolute inset-3 border-2 border-dashed border-rose-500/40 pointer-events-none z-20">
                  <span className="absolute top-1 left-1 text-[9px] font-mono text-rose-400 bg-zinc-950/80 px-1 rounded">
                    Margem Segura (5%)
                  </span>
                </div>
              )}

              {/* 3. Mobile Reduced Title Card Zone */}
              {showMobileTitleZone && (
                <div className="absolute bottom-0 inset-x-0 h-1/4 bg-blue-500/20 border-t border-blue-500/40 pointer-events-none z-20 flex items-center justify-center">
                  <span className="text-[10px] font-mono text-blue-300 font-bold bg-zinc-950/80 px-2 py-0.5 rounded">
                    Zona de Proximidade do Título Mobile
                  </span>
                </div>
              )}

              {/* 4. Rule of Thirds Grid */}
              {showRuleOfThirds && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 border border-amber-500/30">
                  <div className="border-r border-b border-amber-500/30" />
                  <div className="border-r border-b border-amber-500/30" />
                  <div className="border-b border-amber-500/30" />
                  <div className="border-r border-b border-amber-500/30" />
                  <div className="border-r border-b border-amber-500/30" />
                  <div className="border-b border-amber-500/30" />
                  <div className="border-r border-amber-500/30" />
                  <div className="border-r border-amber-500/30" />
                  <div />
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-400 text-center font-mono">
              Todas as imagens são processadas localmente na memória do seu navegador. Zero upload externo.
            </p>
          </div>

          {/* Test Controls Side Panel */}
          <div className="lg:w-5/12 space-y-5 flex flex-col justify-between">
            {/* Interactive Filters Controls (Module 13) */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
              <span className="text-xs font-mono uppercase text-zinc-300 font-bold block">
                Controles de Estresse Óptico
              </span>

              {/* 1. Scale 10% Test */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Teste 10% (Escala Mobile)</div>
                  <div className="text-[10px] text-zinc-400">Simula tamanho de feed no celular (140px)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTest10Percent(!test10Percent)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    test10Percent
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {test10Percent ? 'Ativo' : 'Testar'}
                </button>
              </div>

              {/* 2. Blur Test */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-200">Teste do Desfoque (Blur)</span>
                  <span className="text-[11px] font-mono text-amber-400">{blurValue}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={blurValue}
                  onChange={e => setBlurValue(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded"
                />
                <span className="text-[10px] text-zinc-400 block">
                  Se a hierarquia primária desaparecer com 6px de blur, o contraste está fraco.
                </span>
              </div>

              {/* 3. Silhouette Test */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Teste de Silhueta</div>
                  <div className="text-[10px] text-zinc-400">Contraste gráfico extremo preto e branco</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSilhouette(!isSilhouette)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    isSilhouette
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {isSilhouette ? 'Ativo' : 'Testar'}
                </button>
              </div>

              {/* 4. Grayscale Test */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Teste em Escala de Cinza</div>
                  <div className="text-[10px] text-zinc-400">Avalia contraste de valores independente de cores</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    isGrayscale
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {isGrayscale ? 'Ativo' : 'Testar'}
                </button>
              </div>

              {/* 5. Squint Test */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Teste do Semicerrar (Squint)</div>
                  <div className="text-[10px] text-zinc-400">Simula fechamento de pálpebras / massa dominante</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSquintTest(!isSquintTest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    isSquintTest
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {isSquintTest ? 'Ativo' : 'Testar'}
                </button>
              </div>

              {/* 6. Estimated Emphasis Map */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-zinc-200">Mapa de Ênfase Estimado</div>
                  <div className="text-[10px] text-zinc-400">Estimativa heurística de contraste visual</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmphasisMap(!showEmphasisMap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    showEmphasisMap
                      ? 'bg-amber-500 text-zinc-950 shadow'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
                  }`}
                >
                  {showEmphasisMap ? 'Ativo' : 'Ver Mapa'}
                </button>
              </div>

              {/* 7. One Second Test */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={startOneSecondTest}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Testar 1 Segundo de Exposição
                </button>
              </div>
            </div>

            {/* Safe Zones Toggles (Module 14) */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold block">
                Zonas Seguras (Safe Zones 16:9)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTimestampOverlay}
                    onChange={e => setShowTimestampOverlay(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Timestamp (14:28)
                </label>
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEdgeSafety}
                    onChange={e => setShowEdgeSafety(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Margem de 5%
                </label>
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMobileTitleZone}
                    onChange={e => setShowMobileTitleZone(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Faixa de Título
                </label>
                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRuleOfThirds}
                    onChange={e => setShowRuleOfThirds(e.target.checked)}
                    className="accent-amber-500"
                  />
                  Regra dos Terços
                </label>
              </div>
            </div>

            {/* Text Density Analysis Widget */}
            <TextDensityWidget text={currentProject.thumbnailText} />
          </div>
        </div>

        {/* 1-SECOND USER REFLECTION INPUT */}
        <div className="mt-6 pt-5 border-t border-zinc-800">
          <label className="text-xs font-mono uppercase text-amber-400 font-bold block mb-1">
            Reflexão do Teste de 1 Segundo: &ldquo;O que eu percebi primeiro?&rdquo;
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="Digite aqui o que chamou sua atenção nos primeiros 1.000ms..."
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-200 text-xs font-mono font-medium rounded-xl transition"
            >
              Salvar Nota
            </button>
          </div>
        </div>
      </div>

      {/* FEED SIMULATOR EXTENSION */}
      <div className="mb-8">
        <FeedSimulator
          thumbnailUri={currentProject.uploadedImageUri}
          videoTitle={currentProject.videoTitle}
          channelName={currentProject.channelIdentity}
          protagonist={currentProject.protagonist}
          thumbnailText={currentProject.thumbnailText}
        />
      </div>

      {/* MULTIMODAL AI CRITIQUE PANEL */}
      <div className="mb-8">
        <AIAnalysisPanel
          analysis={latestAnalysis}
          isAnalyzing={isAnalyzingAI}
          unconfiguredError={unconfiguredError}
          onAnalyze={handleAnalyzeWithAI}
          showRegions={showRegionsOverlay}
          onToggleRegions={() => setShowRegionsOverlay(prev => !prev)}
          onAddAvoid={addAntiSlopToAvoid}
          onApplyCorrection={applyAIProposedCorrection}
          hasImage={Boolean(currentProject.uploadedImageUri)}
        />
      </div>

      {/* DIAGNOSTIC WORKSPACE & CRITIQUE ENGINE (Module 15, 16, 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Manual Diagnostic Conditions */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800 p-6 rounded-3xl space-y-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
              Checklist de Sintomas Visuais
            </span>
            <h3 className="text-base font-bold text-zinc-100 uppercase tracking-tight mt-0.5">
              Condições Diagnósticas Manuais
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Marque os problemas que você identifica na imagem para alimentar o motor heurístico de crítica.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.manyFocalPoints}
                onChange={() => toggleDiagnostic('manyFocalPoints')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Muitos pontos focais concorrendo</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.excessiveText}
                onChange={() => toggleDiagnostic('excessiveText')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Texto longo ou excessivo na imagem</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.duplicatedTitle}
                onChange={() => toggleDiagnostic('duplicatedTitle')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Título duplicado literalmente na thumbnail</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.artificialGlow}
                onChange={() => toggleDiagnostic('artificialGlow')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Glow artificial / contorno neon dispensável</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.excessiveSaturation}
                onChange={() => toggleDiagnostic('excessiveSaturation')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Saturação global excessiva (cores radioativas)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.weakSeparation}
                onChange={() => toggleDiagnostic('weakSeparation')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Separação fraca entre figura e fundo</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.genericReaction}
                onChange={() => toggleDiagnostic('genericReaction')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Expressão genérica de choque (boca aberta em O)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.backgroundTooDetailed}
                onChange={() => toggleDiagnostic('backgroundTooDetailed')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Fundo tão nítido quanto o protagonista</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.unmotivatedLight}
                onChange={() => toggleDiagnostic('unmotivatedLight')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Luz mágica sem fonte física correspondente</span>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={diag.floatingLogos}
                onChange={() => toggleDiagnostic('floatingLogos')}
                className="accent-rose-500 w-4 h-4"
              />
              <span className="text-zinc-200">Logotipos ou ícones flutuantes decorativos</span>
            </label>
          </div>
        </div>

        {/* Right Column: Dynamic Feedback & Complexity Gauges */}
        <div className="lg:col-span-7 space-y-6">
          {/* HEURISTIC METERS (Modules 16 & 17) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visual Complexity Gauge (Module 16) */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                  Complexidade Visual
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    complexity.state === 'LOW'
                      ? 'bg-blue-500/20 text-blue-400'
                      : complexity.state === 'BALANCED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : complexity.state === 'BUSY'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {complexity.state}
                </span>
              </div>
              <div className="text-sm font-bold text-zinc-100">{complexity.label}</div>
              <ul className="text-[11px] text-zinc-400 space-y-1 pt-1">
                {complexity.reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Slop Risk Gauge (Module 17) */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold">
                  Risco de AI Slop
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    slopRisk.state === 'BAIXO'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : slopRisk.state === 'ATENÇÃO'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {slopRisk.state}
                </span>
              </div>
              <div className="text-sm font-bold text-zinc-100">
                {slopRisk.state === 'BAIXO'
                  ? 'Direção Limpa & Autêntica'
                  : slopRisk.state === 'ATENÇÃO'
                  ? 'Gatilhos Artificiais Detectados'
                  : 'Alto Risco de Aparência Genérica'}
              </div>
              <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed">
                {slopRisk.triggers.length > 0
                  ? `Gatilhos ativos: ${slopRisk.triggers.slice(0, 2).join('; ')}`
                  : 'Nenhum sintoma grave de render falso marcado.'}
              </p>
            </div>
          </div>

          {/* DYNAMIC CRITIQUE REPORT (Module 15) */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
                Diagnóstico Estruturado
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Heurística Dinâmica
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* O QUE FUNCIONA */}
              <div>
                <span className="font-mono text-emerald-400 uppercase text-[10px] font-bold block mb-1">
                  ✓ O que funciona:
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {feedback.oQueFunciona.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* O QUE COMPETE */}
              <div>
                <span className="font-mono text-amber-400 uppercase text-[10px] font-bold block mb-1">
                  ⚠ O que compete ou rouba atenção:
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {feedback.oQueCompete.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* O QUE PARECE IA */}
              <div>
                <span className="font-mono text-rose-400 uppercase text-[10px] font-bold block mb-1">
                  ✕ O que parece gerado por IA preguiçosa:
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {feedback.oQuePareceIa.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* O QUE PODE SER REMOVIDO */}
              <div>
                <span className="font-mono text-zinc-400 uppercase text-[10px] font-bold block mb-1">
                  ✂ O que pode ser removido (Subtrair):
                </span>
                <ul className="space-y-1 text-zinc-300">
                  {feedback.oQuePodeSerRemovido.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-zinc-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ALTERAÇÃO DE MAIOR IMPACTO */}
              <div className="pt-3 border-t border-zinc-800">
                <span className="font-mono text-amber-400 uppercase text-[10px] font-bold block mb-1">
                  ★ Alteração de Maior Impacto Recomendada:
                </span>
                <p className="text-xs text-zinc-100 font-semibold bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  {feedback.alteracaoDeMaiorImpacto}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A/B COMPARISON MODAL */}
      <ABCompareModal
        isOpen={isABModalOpen}
        onClose={() => setIsABModalOpen(false)}
        videoTitle={currentProject.videoTitle}
        onSaveComparison={saveAIComparison}
        showToast={showToast}
      />
    </section>
  );
}
