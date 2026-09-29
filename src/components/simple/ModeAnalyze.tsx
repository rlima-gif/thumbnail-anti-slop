'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wand2,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { AnalyzeThumbnailSimpleResult } from '@/types/simple';
import { analyzeThumbnailLocally } from '@/lib/simpleEngine/engine';
import { saveSimpleHistoryItem } from '@/lib/simpleEngine/history';

interface ModeAnalyzeProps {
  onNotify: (msg: string) => void;
  onRefreshHistoryCount: () => void;
}

export function ModeAnalyze({ onNotify, onRefreshHistoryCount }: ModeAnalyzeProps) {
  const [image, setImage] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeThumbnailSimpleResult | null>(null);
  const [showFixPrompt, setShowFixPrompt] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImage(e.target?.result as string);
      setResult(null);
      setShowFixPrompt(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) {
      onNotify('Envie uma imagem para análise.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/simple-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, videoTitle })
      });

      let data: AnalyzeThumbnailSimpleResult;

      if (res.ok) {
        data = await res.json();
      } else {
        data = analyzeThumbnailLocally(videoTitle);
      }

      setResult(data);

      saveSimpleHistoryItem({
        mode: 'ANALISAR',
        title: videoTitle || 'Auditoria de Thumbnail',
        previewSummary: data.topProblem,
        data
      });
      onRefreshHistoryCount();

      onNotify('Auditoria visual concluída!');
    } catch {
      const fallback = analyzeThumbnailLocally(videoTitle);
      setResult(fallback);
      onNotify('Análise concluída pelo motor local.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyFix = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fixPrompt);
    setCopiedFix(true);
    onNotify('Prompt corretivo copiado!');
    setTimeout(() => setCopiedFix(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      {/* Upload and Inputs */}
      <div className="space-y-6 bg-zinc-900/60 border border-zinc-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-100 uppercase tracking-tight font-mono mb-1">
            ANALISAR THUMBNAIL
          </h2>
          <p className="text-xs text-zinc-400">
            Identifique elementos artificiais e receba um diagnóstico estético direto sem pontuações numéricas fictícias.
          </p>
        </div>

        {/* Upload Area */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />

          {image ? (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Thumbnail enviada"
                className="w-full max-h-80 object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setResult(null);
                  setShowFixPrompt(false);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 text-xs font-mono border border-zinc-700 transition"
              >
                Trocar Imagem
              </button>
            </div>
          ) : (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 rounded-2xl p-10 text-center cursor-pointer transition group"
            >
              <Upload className="w-8 h-8 text-zinc-500 group-hover:text-amber-400 mx-auto mb-3 transition" />
              <p className="text-sm text-zinc-200 font-medium">
                Arraste uma thumbnail aqui ou clique para selecionar
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Formatos JPG, PNG ou WebP
              </p>
            </div>
          )}
        </div>

        {/* Optional Title Input */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-2">
            Título do Vídeo <span className="text-zinc-500 font-normal lowercase">(opcional — para checagem de contexto)</span>
          </label>
          <input
            type="text"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="Ex: Como dobrei a bateria do meu celular"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!image || isLoading}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-mono font-bold text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>AUDITANDO CONTRASTE & SLOP...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-zinc-950" />
              <span>ANALISAR</span>
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* O Que Está Funcionando */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
                <CheckCircle2 className="w-4 h-4" />
                O QUE ESTÁ FUNCIONANDO
              </span>
              <ul className="space-y-2">
                {result.functioning.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* O Que Está Deixando com Cara de IA */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 border-b border-zinc-800/80 pb-2.5">
                <AlertTriangle className="w-4 h-4" />
                O QUE ESTÁ DEIXANDO COM CARA DE IA
              </span>
              <ul className="space-y-2">
                {result.aiLooking.map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Maior Problema (Recomendação Prioritária Única) */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500" />
              MAIOR PROBLEMA (CORREÇÃO PRIORITÁRIA)
            </div>
            <p className="text-sm font-medium text-zinc-100 leading-relaxed font-sans">
              {result.topProblem}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFixPrompt(prev => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{showFixPrompt ? 'Ocultar Prompt de Correção' : 'GERAR PROMPT PARA CORRIGIR'}</span>
              </button>
            </div>
          </div>

          {/* Corrective Patch Prompt */}
          {showFixPrompt && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                  Prompt Corretivo (Inpainting / Patch)
                </span>
                <button
                  type="button"
                  onClick={handleCopyFix}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                >
                  {copiedFix ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {result.fixPrompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
