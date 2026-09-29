'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Wand2,
  Copy,
  Check,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Camera,
  Eye,
  Smile,
  Palette,
  Info
} from 'lucide-react';
import {
  SimpleReference,
  SimpleReferenceRole,
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
  PESSOA: 'Envie uma foto com o rosto bem visível.',
  PRODUTO: 'Uma foto real ajuda a manter formato e detalhes.',
  CENÁRIO: 'Use se o ambiente real fizer parte da história.',
  ESTILO: 'Serve para aparência, luz e acabamento.',
  COMPOSIÇÃO: 'Serve para mostrar onde cada elemento deve ficar.',
  TIPOGRAFIA: 'Serve apenas como referência de fonte e tratamento do texto.',
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

  // Advanced settings (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for word count on thumbnail text
  const textWords = thumbnailText.trim() ? thumbnailText.trim().split(/\s+/).length : 0;

  // Contextual suggestions based on user description (Rule 4)
  const contextualSuggestions = useMemo(() => {
    const combined = `${videoTitle} ${ideaDescription}`.toLowerCase();
    const suggestions: string[] = [];

    const hasPersonInText = /(eu|meu\s*rosto|minha\s*cara|minha\s*rea[çc][ãa]o|pessoa|homem|mulher|criador|cara)(\b|$)/i.test(combined);
    const hasPersonRef = references.some(r => r.role === 'PESSOA');
    if (hasPersonInText && !hasPersonRef) {
      suggestions.push('Uma foto sua ajuda a preservar seu rosto.');
    }

    const hasProductInText = /(legion|console|notebook|laptop|celular|smartphone|mouse|teclado|fone|headset|hardware|pe[çc]a|produto|aparelho|switch|steam\s*deck)/i.test(combined);
    const hasProductRef = references.some(r => r.role === 'PRODUTO');
    if (hasProductInText && !hasProductRef) {
      const match = combined.match(/(legion\s*go|legion|steam\s*deck|switch|notebook|laptop|console|celular)/i);
      const name = match ? match[0] : 'produto';
      suggestions.push(`Uma foto do ${name} ajuda a preservar o hardware.`);
    }

    const hasSceneInText = /(sof[aá]|quarto|sala|mesa|bancada|escrit[oó]rio|est[uú]dio|oficina|cen[aá]rio)/i.test(combined);
    const hasSceneRef = references.some(r => r.role === 'CENÁRIO');
    if (hasSceneInText && !hasSceneRef) {
      suggestions.push('Se esse sofá ou ambiente for importante, envie uma foto do cenário.');
    }

    return suggestions;
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
      const updated = prev.map(r => (r.id === id ? { ...r, role } : r));
      if (role === 'PESSOA') setPreserveFace(true);
      if (role === 'PRODUTO') setPreserveProduct(true);
      if (role === 'TIPOGRAFIA') setTextTreatment('USAR_REFERENCIA');
      return updated;
    });
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
          approachIndex: currentApproach
        };
      } else {
        // Fallback to local engine directly
        genResult = generateSimpleThumbnail(payload);
      }

      setResult(genResult);

      // Save to local history
      saveSimpleHistoryItem({
        mode: 'CRIAR',
        title: videoTitle || ideaDescription.slice(0, 40) || 'Thumbnail Sem Título',
        previewSummary: genResult.direction.ideia,
        data: genResult
      });
      onRefreshHistoryCount();

      onNotify('Direção visual e prompt gerados com sucesso!');
    } catch {
      // Local engine resilience
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
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      {/* 1. Main Inputs */}
      <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
        {/* Video Title */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
            Título do Vídeo
          </label>
          <input
            type="text"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="Ex: Troquei o Windows do meu Legion Go"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Big Idea Textarea */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
            O Que Você Imagina?
          </label>
          <textarea
            rows={5}
            value={ideaDescription}
            onChange={e => setIdeaDescription(e.target.value)}
            placeholder="Descreva a thumbnail do jeito que você falaria com uma pessoa.&#10;&#10;Ex: Eu sentado no sofá segurando o Legion Go. Quero mostrar que ele parece outro aparelho depois que troquei o sistema. Quero algo natural e não aquelas thumbnails cheias de neon."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition resize-y leading-relaxed"
          />
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Você não precisa especificar termos técnicos de câmera ou iluminação. O motor traduz sua intenção em direção visual de alto nível.
          </p>

          {/* Contextual Suggestions (Rule 4) */}
          {contextualSuggestions.length > 0 && (
            <div className="space-y-1.5 mt-3">
              {contextualSuggestions.map((sug, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Text & Typography Treatment (Rules 12-22) */}
        <div className="space-y-3 bg-zinc-950/40 border border-zinc-800/60 p-4 sm:p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              Texto na Thumbnail <span className="text-zinc-500 font-normal lowercase">(opcional)</span>
            </label>
            {textWords > 4 && textTreatment !== 'SEM_TEXTO' && (
              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {textWords} palavras: textos longos perdem impacto em telas mobile
              </span>
            )}
          </div>

          {/* Tratamento do Texto */}
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
                <span className="truncate">USAR REFERÊNCIA DE TIPOGRAFIA</span>
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
                <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                  O texto digitado é tratado como exato (sem traduções ou palavras adicionais inventadas pela IA).
                </p>
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

              <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-2">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Para máxima fidelidade tipográfica, gere a imagem sem texto e aplique a fonte depois.</span>
              </div>
            </div>
          )}

          {/* Reservar Espaço para Texto (Rule 17) */}
          <div className="pt-2 border-t border-zinc-800/60 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
              <input
                type="checkbox"
                checked={reserveSpaceForText}
                onChange={e => setReserveSpaceForText(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span className="font-bold">RESERVAR ESPAÇO PARA TEXTO NA COMPOSIÇÃO</span>
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

        {/* References Drag & Drop Area (Rules 3, 5, 23) */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1">
            Referências <span className="text-zinc-500 font-normal lowercase">(adicione imagens se quiser)</span>
          </label>
          <p className="text-[11px] text-zinc-400 mb-3">
            Referências ajudam muito na fidelidade. Se tiver, envie fotos da pessoa, produto ou cenário que realmente devem aparecer.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 rounded-2xl p-6 text-center cursor-pointer transition group"
          >
            <Upload className="w-6 h-6 text-zinc-500 group-hover:text-amber-400 mx-auto mb-2 transition" />
            <p className="text-xs text-zinc-300 font-medium">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Suporta fotos suas, do produto, cenário, estilo ou tipografia de referência
            </p>
          </div>

          {/* Reference Thumbnails & Quick Role Tags with Microcopy (Rule 23) */}
          {references.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {references.map(ref => (
                <div
                  key={ref.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex items-start gap-3 relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ref.url}
                    alt={ref.name}
                    className="w-14 h-14 object-cover rounded-xl border border-zinc-800 shrink-0 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 font-mono truncate mb-1.5 font-bold">
                      {ref.name}
                    </p>
                    {/* Role Picker Buttons (All 7 Roles) */}
                    <div className="flex flex-wrap gap-1">
                      {ALL_ROLES.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleChange(ref.id, role)}
                          className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border transition font-bold ${
                            ref.role === role
                              ? 'bg-amber-500 text-zinc-950 border-amber-500'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {/* Role Microcopy (Rule 23) */}
                    <p className="text-[10px] text-amber-400/90 font-mono mt-1.5 leading-snug">
                      {ROLE_MICROCOPY[ref.role]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRef(ref.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition shrink-0"
                    title="Remover referência"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="border-t border-zinc-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(prev => !prev)}
            className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 hover:text-zinc-200 transition py-1"
          >
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              Configurações Avançadas
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-2">
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

              {/* Aspect Ratio */}
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1 font-bold">
                  Formato da Imagem
                </label>
                <select
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="16:9">16:9 Widescreen (YouTube Padrão)</option>
                  <option value="9:16">9:16 Vertical (Shorts / Reels)</option>
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
              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                  <input
                    type="checkbox"
                    checked={preserveFace}
                    onChange={e => setPreserveFace(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Preservar traços de rosto (Sem skin plastic)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                  <input
                    type="checkbox"
                    checked={preserveProduct}
                    onChange={e => setPreserveProduct(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>Preservar fidelidade de produto/hardware</span>
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main CTA Button */}
        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono font-bold text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>DIRECIONANDO & PURIFICANDO SLOP...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 text-zinc-950" />
              <span>GERAR THUMBNAIL PROMPT</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* DIRECTION SUMMARY (Max 5 short items) */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider font-mono">
                  DIREÇÃO VISUAL ({result.approachTitle})
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-amber-500/30">
                5 DECISÕES ESSENCIAIS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ideia */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Ideia
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {result.direction.ideia}
                </p>
              </div>

              {/* Foco */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Foco
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {result.direction.foco}
                </p>
              </div>

              {/* Composição */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Composição
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {result.direction.composicao}
                </p>
              </div>

              {/* Expressão */}
              <div className="bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  Expressão
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {result.direction.expressao}
                </p>
              </div>

              {/* Visual & Luz */}
              <div className="md:col-span-2 bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Visual & Luz
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {result.direction.visual}
                </p>
              </div>
            </div>
          </div>

          {/* FINAL PROMPT */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold block">
                  Prompt Final (English)
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pronto para copiar e colar no {targetModel === 'GERAL' ? 'seu gerador favorito (Midjourney, FLUX, etc.)' : targetModel}
                </p>
              </div>

              {/* Big Copy Button */}
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-zinc-950" />
                    <span>PROMPT COPIADO!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-950" />
                    <span>COPIAR PROMPT</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-5 text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-wrap select-all max-h-96 overflow-y-auto">
              {result.finalPrompt}
            </div>

            {/* Another Approach Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAnotherApproach}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-amber-500/60 text-zinc-300 hover:text-amber-400 text-xs font-mono font-medium transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>GERAR OUTRA ABORDAGEM VISUAL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
