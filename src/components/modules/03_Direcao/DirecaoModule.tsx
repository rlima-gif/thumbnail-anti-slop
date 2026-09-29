'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { GenerationMode } from '@/types';
import { Sliders, Camera, Film, User, Sparkles, Wand2, Check, X, ShieldCheck, Cpu } from 'lucide-react';

interface AISuggestedDirection {
  visualPromise?: string;
  protagonist?: string;
  protagonistPresence?: number;
  secondarySubject?: string;
  storyMoment?: string;
  composition?: string;
  camera?: string;
  expression?: string;
  lighting?: string;
  palette?: string;
  background?: string;
  depth?: string;
  thumbnailText?: string;
  channelIdentity?: string;
  visualStyle?: string;
  avoidAdditions?: string[];
  justification?: string;
}

const COMPOSITION_PRESETS = [
  'Regra dos terços com espaço negativo à direita',
  'Centralizado simétrico imponente (estilo Wes Anderson)',
  'Diagonal dramática com corte angular',
  'Primeiro plano recortado com ponto focal no plano médio',
  'Horizonte rebaixado enaltecendo a escala do protagonista'
];

const CAMERA_PRESETS = [
  'Lente prime 85mm f/1.8 (retrato nítido com compressão elegante)',
  'Lente 50mm no nível dos olhos (perspectiva documental natural)',
  'Lente 35mm cinematográfica (imersão ambiental)',
  'Lente macro 100mm (detalhes industriais extremos de produto)'
];

const LIGHTING_PRESETS = [
  'Luz suave motivada por janela lateral com sombras aveludadas',
  'Luz de Rembrandt (Key light em 45º com triângulo na face)',
  'Low-key dramático (fundo escuro e luz pontual no sujeito)',
  'Luz de monitor/tela azulada contra ambiente escuro quente',
  'Golden hour (sol baixo rasante e contornos quentes autênticos)'
];

const PALETTE_PRESETS = [
  'Cinza grafite, preto profundo (#090a0d) e acento âmbar (#f59e0b)',
  'Azul marinho escuro, concreto e acento vermelho carmim',
  'Tons de terra, linho cru e verde oliva desbotado',
  'Monocromático alto contraste (preto, branco e cinzas médios)'
];

const MODES_CONFIG: Array<{ id: GenerationMode; title: string; badge: string; desc: string }> = [
  {
    id: 'SEM_TEXTO',
    title: 'Sem Texto',
    badge: 'Puro Visual',
    desc: 'Conta a história por gestos, contraste e objeto. Sem poluição de letras.'
  },
  {
    id: 'ROSTO_REAL',
    title: 'Rosto Real',
    badge: 'Anti-Cera',
    desc: 'Preserva assimetria, poros, dentes e idade real do criador. Proíbe cara de silicone.'
  },
  {
    id: 'GAMING',
    title: 'Gaming Subtrativo',
    badge: 'Hardware Real',
    desc: 'Elimina RGB tóxico, raios e neons automáticos; prioriza materiais e ambiente crível.'
  },
  {
    id: 'TECH',
    title: 'Tech & Hardware',
    badge: 'Geometria Exata',
    desc: 'Protege portas, botões e proporções autênticas de produtos industriais.'
  },
  {
    id: 'BEFORE_AFTER',
    title: 'Antes / Depois',
    badge: 'Transição Orgânica',
    desc: 'Composição dinâmica de transformação espacial, além da linha divisória 50/50.'
  }
];

export function DirecaoModule() {
  const { currentProject, updateProject, toggleMode, toggleReferenceLock, addAntiSlopToAvoid, showToast } = useProject();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestedDirection | null>(null);

  const handleSuggestDirection = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/ai/suggest-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: currentProject.videoTitle,
          videoDescription: currentProject.videoDescription,
          niche: currentProject.niche,
          audience: currentProject.audience,
          perceptionGoal: currentProject.perceptionGoal,
          protagonistType: currentProject.protagonistType,
          viewerQuestion: currentProject.viewerQuestion
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          showToast('ANÁLISE POR IA NÃO CONFIGURADA. Configure OPENAI_API_KEY no servidor.');
        } else {
          showToast(data.error || 'Erro ao sugerir direção.');
        }
        return;
      }
      setAiSuggestion(data.direction);
      showToast('Sugestão de direção gerada com sucesso pela IA!');
    } catch {
      showToast('Falha na comunicação com a API de IA.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplyAllSuggestions = () => {
    if (!aiSuggestion) return;
    const updates: Record<string, unknown> = {};
    if (aiSuggestion.visualPromise) updates.visualPromise = aiSuggestion.visualPromise;
    if (aiSuggestion.protagonist) updates.protagonist = aiSuggestion.protagonist;
    if (aiSuggestion.protagonistPresence) updates.protagonistPresence = aiSuggestion.protagonistPresence;
    if (aiSuggestion.secondarySubject) updates.secondarySubject = aiSuggestion.secondarySubject;
    if (aiSuggestion.storyMoment) updates.storyMoment = aiSuggestion.storyMoment;
    if (aiSuggestion.composition) updates.composition = aiSuggestion.composition;
    if (aiSuggestion.camera) updates.camera = aiSuggestion.camera;
    if (aiSuggestion.expression) updates.expression = aiSuggestion.expression;
    if (aiSuggestion.lighting) updates.lighting = aiSuggestion.lighting;
    if (aiSuggestion.palette) updates.palette = aiSuggestion.palette;
    if (aiSuggestion.background) updates.background = aiSuggestion.background;
    if (aiSuggestion.depth) updates.depth = aiSuggestion.depth;
    if (aiSuggestion.thumbnailText !== undefined) updates.thumbnailText = aiSuggestion.thumbnailText;
    if (aiSuggestion.channelIdentity) updates.channelIdentity = aiSuggestion.channelIdentity;
    if (aiSuggestion.visualStyle) updates.visualStyle = aiSuggestion.visualStyle;

    updateProject(updates);
    if (aiSuggestion.avoidAdditions && Array.isArray(aiSuggestion.avoidAdditions)) {
      aiSuggestion.avoidAdditions.forEach(item => addAntiSlopToAvoid(item));
    }
    setAiSuggestion(null);
    showToast('Todas as sugestões de direção foram aplicadas ao projeto!');
  };

  // Guidance for protagonist presence slider
  const presence = currentProject.protagonistPresence;
  let presenceAdvice = 'Equilíbrio padrão para retratos e produtos no feed.';
  if (presence >= 75) {
    presenceAdvice = 'Close-up emocional / Detalhe macro: excelente para impacto facial ou detalhe técnico minucioso.';
  } else if (presence >= 50) {
    presenceAdvice = 'Plano médio clássico: silhueta do protagonista clara com espaço para elemento secundário.';
  } else if (presence >= 30) {
    presenceAdvice = 'Plano americano / Comparação: ambos os lados permanecem legíveis quando reduzidos para mobile.';
  } else {
    presenceAdvice = 'Plano aberto / Cena narrativa: o ambiente é crucial para o mistério da história.';
  }

  const isTechOrGaming = currentProject.activeModes.includes('TECH') || currentProject.activeModes.includes('GAMING');
  const isRealFace = currentProject.activeModes.includes('ROSTO_REAL');

  return (
    <section id="direcao" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 03 • Manual de Arte e Fotografia
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            Direção de Arte Completa
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSuggestDirection}
            disabled={isSuggesting}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isSuggesting ? 'CONSULTANDO IA...' : 'SUGERIR DIREÇÃO COM IA'}</span>
          </button>
        </div>
      </div>

      {/* AI DIRECTION PROPOSAL MODAL / PANEL */}
      {aiSuggestion && (
        <div className="mb-8 p-6 rounded-3xl bg-zinc-900 border-2 border-amber-500/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                Proposta de Direção Assistida por IA
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyAllSuggestions}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-mono transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                APLICAR TUDO
              </button>
              <button
                type="button"
                onClick={() => setAiSuggestion(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {aiSuggestion.justification && (
            <p className="text-xs text-amber-300/90 font-mono italic bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              💡 Racional: {aiSuggestion.justification}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {aiSuggestion.visualPromise && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Promessa Visual</span>
                  <p className="text-zinc-200 mt-0.5">{aiSuggestion.visualPromise}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ visualPromise: aiSuggestion.visualPromise });
                    showToast('Promessa visual aplicada!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}

            {aiSuggestion.protagonist && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Protagonista Proposto</span>
                  <p className="text-zinc-200 mt-0.5">{aiSuggestion.protagonist}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ protagonist: aiSuggestion.protagonist });
                    showToast('Protagonista aplicado!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}

            {aiSuggestion.composition && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Composição Proposta</span>
                  <p className="text-zinc-200 mt-0.5">{aiSuggestion.composition}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ composition: aiSuggestion.composition });
                    showToast('Composição aplicada!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}

            {aiSuggestion.lighting && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Iluminação Motivada</span>
                  <p className="text-zinc-200 mt-0.5">{aiSuggestion.lighting}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ lighting: aiSuggestion.lighting });
                    showToast('Iluminação aplicada!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}

            {aiSuggestion.palette && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Paleta Restrita</span>
                  <p className="text-zinc-200 mt-0.5">{aiSuggestion.palette}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ palette: aiSuggestion.palette });
                    showToast('Paleta aplicada!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}

            {aiSuggestion.thumbnailText !== undefined && (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">Texto Curto</span>
                  <p className="text-zinc-200 mt-0.5 font-bold">{aiSuggestion.thumbnailText || '(Sem texto recomendado)'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateProject({ thumbnailText: aiSuggestion.thumbnailText || '' });
                    showToast('Texto aplicado!');
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[10px] font-mono shrink-0 uppercase"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPECIALIZED GENERATION MODES (Module 23) */}
      <div className="mb-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Modos Especializados de Direção
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ativam salvaguardas fotográficas específicas contra os vícios mais comuns de IA em cada nicho.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MODES_CONFIG.map(m => {
            const isActive = currentProject.activeModes.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMode(m.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 text-zinc-100 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {m.badge}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-zinc-700'
                      }`}
                    />
                  </div>
                  <div className={`text-xs font-bold ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {m.title}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTEXTUAL FIDELITY PANELS */}
        {(isTechOrGaming || isRealFace) && (
          <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
            {isTechOrGaming && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    Fidelidade de Hardware
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Tech & Gaming</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'LOCK_PRODUCT_GEOMETRY', label: 'Geometria do Produto' },
                      { id: 'LOCK_SCREEN_ASPECT', label: 'Proporção de Tela' },
                      { id: 'LOCK_CONTROLLER_LAYOUT', label: 'Layout de Botões' }
                    ] as const
                  ).map(item => {
                    const active = (currentProject.referenceLocks || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleReferenceLock(item.id)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                          active
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isRealFace && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Fidelidade Facial (Anti-Cera)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Rosto Real</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'LOCK_FACE', label: 'Rosto & Assimetria' },
                      { id: 'LOCK_AGE', label: 'Idade Real' },
                      { id: 'LOCK_HAIR', label: 'Cabelo' },
                      { id: 'LOCK_BEARD', label: 'Barba' },
                      { id: 'LOCK_POSE', label: 'Postura' }
                    ] as const
                  ).map(item => {
                    const active = (currentProject.referenceLocks || []).includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleReferenceLock(item.id)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                          active
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Editorial & Thematic Direction */}
        <div className="lg:col-span-6 space-y-6">
          {/* VIDEO CONTEXT & PROMISE */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              Premissa Narrativa do Vídeo
            </h3>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Título do Vídeo
              </label>
              <input
                type="text"
                value={currentProject.videoTitle}
                onChange={e => updateProject({ videoTitle: e.target.value })}
                placeholder="Ex: Por que a Apple cancelou o projeto do carro elétrico..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Nicho / Categoria
                </label>
                <input
                  type="text"
                  value={currentProject.niche}
                  onChange={e => updateProject({ niche: e.target.value })}
                  placeholder="Ex: Documentário Tech, Finanças, Hardware..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Público Alvo
                </label>
                <input
                  type="text"
                  value={currentProject.audience}
                  onChange={e => updateProject({ audience: e.target.value })}
                  placeholder="Ex: Criadores maduros, desenvolvedores..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Promessa Visual (O que a imagem entrega?)
              </label>
              <input
                type="text"
                value={currentProject.visualPromise}
                onChange={e => updateProject({ visualPromise: e.target.value })}
                placeholder="Ex: A revelação da carcaça do produto que nunca foi lançado..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Momento da História (Story Moment)
              </label>
              <input
                type="text"
                value={currentProject.storyMoment}
                onChange={e => updateProject({ storyMoment: e.target.value })}
                placeholder="Ex: O exato segundo anterior à explosão; a sala de conferências lacrada..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* PROTAGONIST & PRESENCE SLIDER (Module 9) */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Protagonista & Ocupação do Quadro
            </h3>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Descrição do Protagonista
              </label>
              <input
                type="text"
                value={currentProject.protagonist}
                onChange={e => updateProject({ protagonist: e.target.value })}
                placeholder="Ex: Um console portátil metálico fosco com chassi desmontado..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* PRESENÇA DO PROTAGONISTA SLIDER 10% - 90% */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-300 font-bold flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Presença do Protagonista no Quadro
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  {presence}%
                </span>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={presence}
                onChange={e => updateProject({ protagonistPresence: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>10% (Cena Ampla)</span>
                <span>50% (Equilíbrio)</span>
                <span>90% (Macro Close-up)</span>
              </div>

              {/* Contextual Visual Framing Gauge */}
              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-300 flex items-start gap-2">
                <span className="text-amber-400 font-mono font-bold text-xs mt-0.5">ℹ</span>
                <span>{presenceAdvice}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Elemento Secundário Subordinado
              </label>
              <input
                type="text"
                value={currentProject.secondarySubject}
                onChange={e => updateProject({ secondarySubject: e.target.value })}
                placeholder="Ex: Uma fita isolante rasgada; um documento confidencial na mesa..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Deve ser estritamente subordinado ao protagonista em escala e luminosidade.
              </span>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Expressão do Rosto / Postura Corporal
              </label>
              <input
                type="text"
                value={currentProject.expression}
                onChange={e => updateProject({ expression: e.target.value })}
                placeholder="Ex: Expressão pensativa com sobrancelha sutilmente franzida em intriga..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Uma expressão humana contextual vence qualquer careta genérica de choque.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Visual & Photographic Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              Direção Óptica, Luz & Espaço
            </h3>

            {/* COMPOSIÇÃO */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Composição & Enquadramento
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMPOSITION_PRESETS.map((comp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateProject({ composition: comp })}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {comp.slice(0, 30)}...
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={currentProject.composition}
                onChange={e => updateProject({ composition: e.target.value })}
                placeholder="Ex: Regra dos terços com espaço negativo à direita..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* CÂMERA & LENTE */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Câmera & Óptica de Lente
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {CAMERA_PRESETS.map((cam, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateProject({ camera: cam })}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {cam.slice(0, 26)}...
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={currentProject.camera}
                onChange={e => updateProject({ camera: e.target.value })}
                placeholder="Ex: Hasselblad H6D, lente 80mm prime, no nível dos olhos..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* LUZ MOTIVADA */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Iluminação Motivada (Fonte Física Real)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {LIGHTING_PRESETS.map((lgt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateProject({ lighting: lgt })}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {lgt.slice(0, 28)}...
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={currentProject.lighting}
                onChange={e => updateProject({ lighting: e.target.value })}
                placeholder="Ex: Uma única fonte difusa lateral suave com sombras profundas..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* PALETA DE COR */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Paleta Cromática (Controle Tonal)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PALETTE_PRESETS.map((pal, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateProject({ palette: pal })}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                  >
                    {pal.slice(0, 32)}...
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={currentProject.palette}
                onChange={e => updateProject({ palette: e.target.value })}
                placeholder="Ex: Tons neutros de concreto e acento âmbar único..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* FUNDO & PROFUNDIDADE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Fundo Subordinado
                </label>
                <input
                  type="text"
                  value={currentProject.background}
                  onChange={e => updateProject({ background: e.target.value })}
                  placeholder="Ex: Parede de concreto industrial..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Profundidade de Campo
                </label>
                <input
                  type="text"
                  value={currentProject.depth}
                  onChange={e => updateProject({ depth: e.target.value })}
                  placeholder="Ex: Desfoque óptico gradual f/2.8..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* TEXTO DA THUMBNAIL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">
                  Texto Tipográfico na Thumbnail (Opcional)
                </label>
                <span className="text-[10px] font-mono text-amber-400">
                  {currentProject.thumbnailText.trim().split(/\s+/).filter(Boolean).length} palavras
                </span>
              </div>
              <input
                type="text"
                value={currentProject.thumbnailText}
                onChange={e => updateProject({ thumbnailText: e.target.value })}
                placeholder="Ex: 10 BILHÕES (ideal: 0 a 3 palavras no máximo)"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Se a imagem contar a história, deixe em branco. Menos texto = maior legibilidade mobile.
              </span>
            </div>

            {/* IDENTIDADE DO CANAL */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                Identidade do Canal & Estilo Visual
              </label>
              <input
                type="text"
                value={currentProject.channelIdentity}
                onChange={e => updateProject({ channelIdentity: e.target.value })}
                placeholder="Ex: Direção documental sóbria; cinematográfica e honesta..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
