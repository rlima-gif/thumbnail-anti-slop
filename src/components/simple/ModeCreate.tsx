'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Wand2,
  Copy,
  Check,
  Upload,
  X,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Type,
  Settings,
  Info
} from 'lucide-react';
import {
  SimpleReference,
  SimpleReferenceRole,
  ScenarioInterpretation,
  TargetModel,
  TextTreatment,
  ReservedSpacePosition,
  CreateThumbnailResult
} from '@/types/simple';
import { generateSimpleThumbnail } from '@/lib/simpleEngine/engine';
import { saveSimpleHistoryItem } from '@/lib/simpleEngine/history';

const ALL_ROLES: SimpleReferenceRole[] = [
  'PESSOA',
  'PRODUTO',
  'CENÁRIO',
  'ESTILO',
  'COMPOSIÇÃO',
  'TIPOGRAFIA',
  'OUTRA'
];

const ROLE_MICROCOPY: Record<SimpleReferenceRole, string> = {
  PESSOA: 'Preserva traços, rosto e aparência real.',
  PRODUTO: 'Preserva formato, botões e detalhes reais do objeto.',
  CENÁRIO: 'Ambiente ou espaço importante para a cena.',
  ESTILO: 'Apenas cores, iluminação e linguagem visual.',
  COMPOSIÇÃO: 'Apenas enquadramento e posição dos elementos.',
  TIPOGRAFIA: 'Referência de fonte e tratamento do texto.',
  OUTRA: 'Referência geral de apoio.'
};

interface ModeCreateProps {
  onNotify: (msg: string) => void;
  onRefreshHistoryCount: () => void;
}

export function ModeCreate({ onNotify, onRefreshHistoryCount }: ModeCreateProps) {
  // Main form inputs
  const [videoTitle, setVideoTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [thumbnailText, setThumbnailText] = useState('');
  const [textTreatment, setTextTreatment] = useState<TextTreatment>('AUTO');
  const [fontName, setFontName] = useState('');
  const [reserveSpaceForText, setReserveSpaceForText] = useState(false);
  const [reservedSpacePosition, setReservedSpacePosition] = useState<ReservedSpacePosition>('DIREITA');
  const [references, setReferences] = useState<SimpleReference[]>([]);

  // Toggles for inline drawers
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced settings
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [stylePreset, setStylePreset] = useState<'Natural' | 'Cinematográfico' | 'Editorial' | 'Fotojornalismo'>('Natural');
  const [realismLevel, setRealismLevel] = useState<'Alto' | 'Estilizado'>('Alto');
  const [targetModel, setTargetModel] = useState<TargetModel>('GERAL');
  const [preserveFace, setPreserveFace] = useState(false);
  const [preserveProduct, setPreserveProduct] = useState(false);
  const [extraInstructions, setExtraInstructions] = useState('');

  // Execution state & Result
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateThumbnailResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [approachCount, setApproachCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for word count on thumbnail text
  const textWords = thumbnailText.trim() ? thumbnailText.trim().split(/\s+/).length : 0;

  // Title vs. Thumbnail Text Repetition check
  const isTitleRepeatedInThumbnailText = useMemo(() => {
    if (!videoTitle.trim() || !thumbnailText.trim() || textTreatment === 'SEM_TEXTO') return false;
    const cleanTitle = videoTitle.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    const cleanThumb = thumbnailText.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();
    if (!cleanTitle || !cleanThumb) return false;

    if (cleanTitle.includes(cleanThumb) || cleanThumb.includes(cleanTitle)) return true;

    const titleTokens = new Set(cleanTitle.split(/\s+/).filter(w => w.length > 2));
    const thumbTokens = cleanThumb.split(/\s+/).filter(w => w.length > 2);
    if (thumbTokens.length === 0) return false;

    const overlap = thumbTokens.filter(t => titleTokens.has(t)).length;
    return overlap >= Math.ceil(thumbTokens.length * 0.7);
  }, [videoTitle, thumbnailText, textTreatment]);

  // Contextual quick chips based on user description (Rule 4)
  const contextualChips = useMemo(() => {
    const combined = `${videoTitle} ${ideaDescription}`.toLowerCase();
    const chips: string[] = [];

    const hasPersonInText = /(eu|meu\s*rosto|minha\s*cara|minha\s*rea[çc][ãa]o|pessoa|homem|mulher|criador|cara)(\b|$)/i.test(combined);
    const hasPersonRef = references.some(r => r.role === 'PESSOA');
    if (hasPersonInText && !hasPersonRef) {
      chips.push('+ Foto sua');
    }

    const hasProductInText = /(legion|console|notebook|laptop|celular|smartphone|mouse|teclado|fone|headset|hardware|pe[çc]a|produto|aparelho|switch|steam\s*deck)/i.test(combined);
    const hasProductRef = references.some(r => r.role === 'PRODUTO');
    if (hasProductInText && !hasProductRef) {
      const match = combined.match(/(legion\s*go|legion|steam\s*deck|switch|notebook|laptop|console|celular)/i);
      const name = match ? match[0] : 'produto';
      chips.push(`+ ${name.charAt(0).toUpperCase() + name.slice(1)}`);
    }

    const hasSceneInText = /(sof[aá]|quarto|sala|mesa|bancada|escrit[oó]rio|est[uú]dio|oficina|cen[aá]rio)/i.test(combined);
    const hasSceneRef = references.some(r => r.role === 'CENÁRIO');
    if (hasSceneInText && !hasSceneRef) {
      chips.push('+ Cenário');
    }

    return chips;
  }, [videoTitle, ideaDescription, references]);

  // Handle image upload with auto-role detection
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        const nameLower = file.name.toLowerCase();
        let role: SimpleReferenceRole = 'OUTRA';
        if (nameLower.includes('face') || nameLower.includes('rosto') || nameLower.includes('me') || nameLower.includes('eu')) {
          role = 'PESSOA';
          setPreserveFace(true);
        } else if (nameLower.includes('legion') || nameLower.includes('console') || nameLower.includes('produto') || nameLower.includes('phone') || nameLower.includes('hardware')) {
          role = 'PRODUTO';
          setPreserveProduct(true);
        } else if (nameLower.includes('sala') || nameLower.includes('quarto') || nameLower.includes('cenario') || nameLower.includes('room') || nameLower.includes('fundo') || nameLower.includes('desk')) {
          role = 'CENÁRIO';
        } else if (nameLower.includes('fonte') || nameLower.includes('font') || nameLower.includes('type') || nameLower.includes('texto')) {
          role = 'TIPOGRAFIA';
          setTextTreatment('USAR_REFERENCIA');
        }

        setReferences(prev => [
          ...prev,
          {
            id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            name: file.name,
            url,
            role
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRoleChange = (id: string, role: SimpleReferenceRole) => {
    setReferences(prev => {
      const updated = prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            role,
            scenarioMode: role === 'CENÁRIO' ? (r.scenarioMode || 'MEU_AMBIENTE') : r.scenarioMode
          };
        }
        return r;
      });
      if (role === 'PESSOA') setPreserveFace(true);
      if (role === 'PRODUTO') setPreserveProduct(true);
      if (role === 'TIPOGRAFIA') setTextTreatment('USAR_REFERENCIA');
      return updated;
    });
  };

  const handleScenarioModeChange = (id: string, scenarioMode: ScenarioInterpretation) => {
    setReferences(prev =>
      prev.map(r => (r.id === id ? { ...r, scenarioMode } : r))
    );
  };

  const handleRemoveRef = (id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  };

  // Generate thumbnail direction & prompt
  const handleGenerate = async (forcedApproachIndex?: number) => {
    if (!videoTitle.trim() && !ideaDescription.trim()) {
      onNotify('Preencha ao menos o título do vídeo ou a descrição da sua ideia.');
      return;
    }

    const currentApproach = forcedApproachIndex !== undefined ? forcedApproachIndex : approachCount;
    setIsLoading(true);

    try {
      const payload = {
        videoTitle,
        ideaDescription,
        thumbnailText: textTreatment === 'SEM_TEXTO' ? '' : thumbnailText,
        textTreatment,
        fontName: fontName.trim() || undefined,
        reserveSpaceForText,
        reservedSpacePosition,
        references,
        targetModel,
        aspectRatio,
        stylePreset,
        realismLevel,
        preserveFace: preserveFace || references.some(r => r.role === 'PESSOA'),
        preserveProduct: preserveProduct || references.some(r => r.role === 'PRODUTO'),
        extraInstructions,
        approachIndex: currentApproach
      };

      const res = await fetch('/api/ai/simple-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let genResult: CreateThumbnailResult;

      if (res.ok) {
        const data = await res.json();
        genResult = {
          direction: data.direction,
          finalPrompt: data.finalPrompt,
          approachTitle: data.approachTitle || 'Direção Visual Gerada',
          approachIndex: currentApproach,
          typographyPlan: data.typographyPlan
        };
      } else {
        genResult = generateSimpleThumbnail(payload);
      }

      setResult(genResult);

      saveSimpleHistoryItem({
        mode: 'CRIAR',
        title: videoTitle || ideaDescription.slice(0, 40) || 'Thumbnail Sem Título',
        previewSummary: genResult.direction.ideia,
        data: genResult
      });
      onRefreshHistoryCount();

      onNotify('Direção visual e prompt gerados com sucesso!');
    } catch {
      const fallback = generateSimpleThumbnail({
        videoTitle,
        ideaDescription,
        thumbnailText: textTreatment === 'SEM_TEXTO' ? '' : thumbnailText,
        textTreatment,
        fontName: fontName.trim() || undefined,
        reserveSpaceForText,
        reservedSpacePosition,
        references,
        targetModel,
        aspectRatio,
        stylePreset,
        realismLevel,
        preserveFace: preserveFace || references.some(r => r.role === 'PESSOA'),
        preserveProduct: preserveProduct || references.some(r => r.role === 'PRODUTO'),
        extraInstructions,
        approachIndex: currentApproach
      });
      setResult(fallback);
      onNotify('Prompt gerado pelo motor local anti-slop.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnotherApproach = () => {
    const nextApproach = approachCount + 1;
    setApproachCount(nextApproach);
    handleGenerate(nextApproach);
  };

  const handleCopyPrompt = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.finalPrompt);
    setCopied(true);
    onNotify('Prompt copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 sm:py-4">
      {/* 1. TÍTULO DO VÍDEO (Direct & Sleek) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
          Título do Vídeo
        </label>
        <input
          type="text"
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
          placeholder="Ex: Troquei o Windows do meu Legion Go"
          className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-sans text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition"
        />
      </div>

      {/* 2. COMPOSER PRINCIPAL (The Creative Hero) */}
      <div className="bg-zinc-900/80 border border-zinc-800 focus-within:border-amber-500/80 rounded-2xl p-4 sm:p-5 transition shadow-lg relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
            O Que Você Imagina?
          </label>
          <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
            Descreva em linguagem natural
          </span>
        </div>

        <textarea
          rows={4}
          value={ideaDescription}
          onChange={e => setIdeaDescription(e.target.value)}
          placeholder="Descreva sua thumbnail como falaria com uma pessoa...&#10;&#10;Ex: Mostrando o Legion Go com o novo sistema instalado. Quero foco total no aparelho ligado e expressão autêntica, sem neon ou exageros."
          className="w-full bg-transparent text-sm font-sans text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed"
        />

        {/* Contextual quick suggestion chips */}
        {contextualChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2.5 pb-1 border-t border-zinc-800/60 mt-2">
            <span className="text-xs text-zinc-400 font-sans">Para ficar mais fiel:</span>
            {contextualChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono transition"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>
        )}

        {/* Inline Bottom Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 mt-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* + Referências */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-mono border border-zinc-700/60 transition"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>+ Referências</span>
              {references.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-zinc-950 font-bold">
                  {references.length}
                </span>
              )}
            </button>

            {/* Aa Texto */}
            <button
              type="button"
              onClick={() => setShowTextPanel(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                showTextPanel || thumbnailText.trim()
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border-zinc-700/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Aa Texto</span>
              {thumbnailText.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Formato 16:9 / 9:16 toggle */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-2 py-1 rounded text-xs font-mono transition ${
                  aspectRatio === '16:9'
                    ? 'bg-zinc-950 text-amber-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                16:9
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`px-2 py-1 rounded text-xs font-mono transition ${
                  aspectRatio === '9:16'
                    ? 'bg-zinc-950 text-amber-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                9:16
              </button>
            </div>

            {/* ⚙ Avançado toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                showAdvanced
                  ? 'bg-zinc-800 text-amber-400 border-zinc-700'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Avançado</span>
            </button>
          </div>

          {/* Primary CTA Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.98] shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>DIRECIONANDO...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-zinc-950" />
                <span>GERAR THUMBNAIL PROMPT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2.1 TEXT DRAWER (Aa Texto) */}
      {showTextPanel && (
        <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Texto na Thumbnail
            </span>
            {textWords > 4 && textTreatment !== 'SEM_TEXTO' && (
              <span className="text-[11px] font-sans text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {textWords} palavras: textos longos perdem impacto em telas mobile
              </span>
            )}
          </div>

          {/* Tratamento */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold block">
              Tratamento do Texto
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTextTreatment('AUTO')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition text-left flex items-center justify-between ${
                  textTreatment === 'AUTO'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>AUTO</span>
                {textTreatment === 'AUTO' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => setTextTreatment('USAR_REFERENCIA')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition text-left flex items-center justify-between ${
                  textTreatment === 'USAR_REFERENCIA'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="truncate">USAR REFERÊNCIA</span>
                {textTreatment === 'USAR_REFERENCIA' && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setTextTreatment('SEM_TEXTO')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition text-left flex items-center justify-between ${
                  textTreatment === 'SEM_TEXTO'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>GERAR SEM TEXTO</span>
                {textTreatment === 'SEM_TEXTO' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>

          {textTreatment !== 'SEM_TEXTO' && (
            <div className="space-y-3 pt-1">
              <div>
                <input
                  type="text"
                  value={thumbnailText}
                  onChange={e => setThumbnailText(e.target.value)}
                  placeholder="Ex: AGORA FUNCIONA"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition uppercase"
                />
                <p className="text-[11px] text-zinc-500 mt-1 font-sans">
                  O texto é tratado literalmente (sem invenções adicionais de palavras).
                </p>
                {isTitleRepeatedInThumbnailText && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-sans bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Seu texto está repetindo o título. Talvez a imagem possa entregar essa informação sozinha.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1 font-bold">
                  Referência de Fonte Real <span className="text-zinc-500 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={fontName}
                  onChange={e => setFontName(e.target.value)}
                  placeholder="Ex: Bebas Neue, Anton, Inter, Impact, Oswald"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3 py-2 font-sans">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Para máxima fidelidade tipográfica, gere a imagem sem texto e aplique a fonte depois no editor.</span>
              </div>
            </div>
          )}

          {/* Reservar Espaço */}
          <div className="pt-2 border-t border-zinc-800/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-zinc-300">
              <input
                type="checkbox"
                checked={reserveSpaceForText}
                onChange={e => setReserveSpaceForText(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span className="font-medium">Reservar espaço limpo para texto na composição</span>
            </label>

            {reserveSpaceForText && (
              <div className="flex flex-wrap gap-2 pl-6 pt-1">
                {(['ESQUERDA', 'DIREITA', 'SUPERIOR', 'INFERIOR'] as ReservedSpacePosition[]).map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setReservedSpacePosition(pos)}
                    className={`text-[10px] font-mono px-3 py-1 rounded-lg border transition font-bold ${
                      reservedSpacePosition === pos
                        ? 'bg-amber-500 text-zinc-950 border-amber-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2.2 ADVANCED DRAWER (⚙ Avançado) */}
      {showAdvanced && (
        <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Target Model */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                Modelo Alvo do Prompt
              </label>
              <select
                value={targetModel}
                onChange={e => setTargetModel(e.target.value as TargetModel)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="GERAL">Geral (Compatível com todos)</option>
                <option value="MIDJOURNEY">Midjourney</option>
                <option value="FLUX">FLUX (Ultra-detalhes foto)</option>
                <option value="GEMINI">Google Gemini Imagen</option>
                <option value="OPENAI">OpenAI (DALL-E 3 / GPT-4o)</option>
              </select>
            </div>

            {/* Style Preset */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                Estilo Visual
              </label>
              <select
                value={stylePreset}
                onChange={e => setStylePreset(e.target.value as 'Natural' | 'Cinematográfico' | 'Editorial' | 'Fotojornalismo')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="Natural">Natural / Iluminação Real (Padrão)</option>
                <option value="Cinematográfico">Cinematográfico</option>
                <option value="Editorial">Editorial / Revista</option>
                <option value="Fotojornalismo">Fotojornalismo Documental</option>
              </select>
            </div>

            {/* Realism Level */}
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                Nível de Realismo
              </label>
              <select
                value={realismLevel}
                onChange={e => setRealismLevel(e.target.value as 'Alto' | 'Estilizado')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="Alto">Alto / Fotográfico Real</option>
                <option value="Estilizado">Estilizado</option>
              </select>
            </div>

            {/* Preservations */}
            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-zinc-300">
                <input
                  type="checkbox"
                  checked={preserveFace}
                  onChange={e => setPreserveFace(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>Preservar traços de rosto (Sem pele plástica)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-zinc-300">
                <input
                  type="checkbox"
                  checked={preserveProduct}
                  onChange={e => setPreserveProduct(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>Preservar integridade física do produto/hardware</span>
              </label>
            </div>

            {/* Extra Instructions */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                Instruções Extras de Direção
              </label>
              <input
                type="text"
                value={extraInstructions}
                onChange={e => setExtraInstructions(e.target.value)}
                placeholder="Ex: Quero um fundo um pouco mais escuro para destacar o contorno fosco do aparelho"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-sans text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. REFERÊNCIAS (Simplified & Guided Horizontal Strip) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              REFERÊNCIAS
            </h3>
            <span className="text-xs text-zinc-500 font-sans">
              &ldquo;Quanto mais você mostrar, menos a IA precisa inventar.&rdquo;
            </span>
          </div>
          {references.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 font-medium self-start sm:self-auto"
            >
              + Adicionar imagem
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {/* If no references uploaded, show clean minimal upload trigger */}
        {references.length === 0 ? (
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition group ${
              isDragging
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 group-hover:bg-zinc-800 text-zinc-200 text-xs font-mono font-medium border border-zinc-700/60 transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Adicionar referência</span>
              </span>
              <span className="text-xs text-zinc-500 font-sans">
                ou arraste fotos aqui (rosto, produto, cenário, estilo ou tipografia)
              </span>
            </div>
          </div>
        ) : (
          /* Uploaded references displayed as sleek horizontal strip */
          <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
            {references.map(ref => (
              <div
                key={ref.id}
                className="w-48 shrink-0 bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 flex flex-col gap-2 relative group"
              >
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ref.url}
                    alt={ref.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRef(ref.id)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-zinc-950/80 hover:bg-rose-500/80 text-zinc-400 hover:text-zinc-100 transition"
                    title="Remover referência"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-zinc-300 font-sans truncate font-medium" title={ref.name}>
                    {ref.name}
                  </span>

                  {/* Compact Role Selector Dropdown */}
                  <select
                    value={ref.role}
                    onChange={e => handleRoleChange(ref.id, e.target.value as SimpleReferenceRole)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {ALL_ROLES.map(role => (
                      <option key={role} value={role} className="text-zinc-200">
                        {role}
                      </option>
                    ))}
                  </select>

                  {/* If role is CENÁRIO: discreet sub-selector */}
                  {ref.role === 'CENÁRIO' ? (
                    <div className="pt-1 border-t border-zinc-800 space-y-1">
                      <div className="flex rounded-md bg-zinc-950 p-0.5 border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleScenarioModeChange(ref.id, 'MEU_AMBIENTE')}
                          className={`flex-1 text-[9px] font-mono py-0.5 rounded transition font-bold ${
                            (ref.scenarioMode || 'MEU_AMBIENTE') === 'MEU_AMBIENTE'
                              ? 'bg-amber-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          MEU AMBIENTE
                        </button>
                        <button
                          type="button"
                          onClick={() => handleScenarioModeChange(ref.id, 'REFERENCIA_AMBIENTE')}
                          className={`flex-1 text-[9px] font-mono py-0.5 rounded transition font-bold ${
                            ref.scenarioMode === 'REFERENCIA_AMBIENTE'
                              ? 'bg-amber-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          REFERÊNCIA
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-400 font-sans leading-tight">
                        {ref.scenarioMode === 'REFERENCIA_AMBIENTE'
                          ? 'Apenas atmosfera, não copia layout.'
                          : 'Preserva layout e elementos deste local.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-zinc-400 font-sans leading-tight">
                      {ROLE_MICROCOPY[ref.role]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. RESULTS SECTION (Side-by-Side 40% / 60% on Desktop) */}
      {result && (
        <div className="space-y-6 pt-6 border-t border-zinc-800/80 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 40% Column (lg:col-span-5): DIREÇÃO VISUAL */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wider">
                      DIREÇÃO VISUAL ({result.approachTitle})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-amber-500/30">
                    5 DECISÕES
                  </span>
                </div>

                {/* Clean scannable list with subtle dividers */}
                <div className="divide-y divide-zinc-800/60 space-y-3 pt-1">
                  <div className="pt-2 first:pt-0">
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block mb-1">
                      IDEIA
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.direction.ideia}
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block mb-1">
                      FOCO
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.direction.foco}
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block mb-1">
                      COMPOSIÇÃO
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.direction.composicao}
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block mb-1">
                      EXPRESSÃO
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.direction.expressao}
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="text-[10px] font-mono uppercase text-amber-500 font-bold block mb-1">
                      VISUAL & LUZ
                    </span>
                    <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                      {result.direction.visual}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plano de Tipografia (se houver texto) */}
              {result.typographyPlan && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block">
                    PLANO DE TIPOGRAFIA
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                    {result.typographyPlan}
                  </p>
                </div>
              )}
            </div>

            {/* 60% Column (lg:col-span-7): PROMPT FINAL */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold block">
                      PROMPT FINAL (ENGLISH)
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                      Pronto para colar no {targetModel === 'GERAL' ? 'Midjourney, FLUX ou seu gerador preferido' : targetModel}
                    </p>
                  </div>

                  {/* Prominent Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-zinc-950" />
                        <span>COPIADO!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-zinc-950" />
                        <span>COPIAR</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clean, spacious monospace prompt box */}
                <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap select-all max-h-[28rem] overflow-y-auto">
                  {result.finalPrompt}
                </div>
              </div>
            </div>
          </div>

          {/* Center Button: Outra Abordagem */}
          <div className="text-center pt-2 pb-4">
            <button
              type="button"
              onClick={handleAnotherApproach}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/60 text-zinc-300 hover:text-amber-400 text-xs font-mono font-medium transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>GERAR OUTRA ABORDAGEM VISUAL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
