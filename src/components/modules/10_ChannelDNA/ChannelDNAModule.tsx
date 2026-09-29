'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  KeyRound,
  ExternalLink
} from 'lucide-react';

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function ChannelDNAModule() {
  const {
    currentProject,
    addExperimentEntry,
    deleteExperimentEntry,
    showToast
  } = useProject();

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    configured: boolean;
    message: string;
    authUrl?: string;
  }>({
    connected: false,
    configured: false,
    message: 'Carregando status do YouTube...'
  });

  // New Experiment Form State
  const [hypothesis, setHypothesis] = useState('');
  const [primaryVariable, setPrimaryVariable] = useState('');
  const [secondaryVariables, setSecondaryVariables] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [variantC, setVariantC] = useState('');
  const [videoId, setVideoId] = useState('');
  const [notes, setNotes] = useState('');
  const [showNewExperiment, setShowNewExperiment] = useState(false);

  useEffect(() => {
    fetch('/api/youtube/status')
      .then(res => res.json())
      .then(data => {
        setConnectionStatus(data);
      })
      .catch(() => {
        setConnectionStatus({
          connected: false,
          configured: false,
          message: 'OAuth do YouTube não configurado no servidor (modo local).'
        });
      });
  }, []);

  const handleAddExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis.trim() || !primaryVariable.trim() || !variantA.trim() || !variantB.trim()) {
      showToast('Preencha a hipótese, a variável primária e as variantes A e B.');
      return;
    }

    addExperimentEntry({
      hypothesis: hypothesis.trim(),
      primaryVariable: primaryVariable.trim(),
      secondaryVariables: secondaryVariables.trim() || undefined,
      variantA: variantA.trim(),
      variantB: variantB.trim(),
      variantC: variantC.trim() || undefined,
      videoId: videoId.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setHypothesis('');
    setPrimaryVariable('');
    setSecondaryVariables('');
    setVariantA('');
    setVariantB('');
    setVariantC('');
    setVideoId('');
    setNotes('');
    setShowNewExperiment(false);
  };

  const experiments = currentProject.experimentJournal || [];

  return (
    <section id="channel-dna" className="scroll-mt-24 py-12 border-b border-zinc-800">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 10 • YouTube Channel DNA & Diário
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            DNA do Canal & Diário de Experimentos
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;Testar sem hipótese isolada é loteria. O diário registra o que você mudou para aprender com dados reais, não palpites.&rdquo;
        </p>
      </div>

      {/* CORE ETHICAL MANDATE BANNER */}
      <div className="mb-8 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          Mandato Ético & Estatístico: Correlação Não é Causalidade
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
          O algoritmo do YouTube responde a centenas de variáveis simultâneas (retenção inicial, tema, momento cultural, histórico do espectador). Este software <strong className="text-zinc-100">NUNCA gera previsões artificiais de CTR, probabilidades de viralização ou notas numéricas de sucesso</strong>. O papel do criador é formular hipóteses claras e registrar resultados reais observados no YouTube Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: YouTube Channel DNA & OAuth State */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <YoutubeIcon className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Integração YouTube Data API
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                {connectionStatus.connected ? 'CONECTADO' : 'MODO LOCAL (DESCONECTADO)'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Conexão segura com a API oficial do Google/YouTube para sincronizar metadados de vídeos publicados e correlacionar hipóteses de thumbnails com métricas do YouTube Studio.
            </p>

            {/* OAuth Scopes Architecture Information */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Escopos de Permissão OAuth 2.0
              </span>
              <ul className="space-y-2 text-[11px] font-mono text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-bold block">youtube.readonly</span>
                    <span className="text-zinc-500 text-[10px]">Leitura de títulos, IDs e thumbnails ativas</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-bold block">yt-analytics.readonly</span>
                    <span className="text-zinc-500 text-[10px]">Correlação retrospectiva com CTR e retenção real</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-bold block">youtube.force-ssl</span>
                    <span className="text-zinc-500 text-[10px]">Atualização direta de miniatura (somente com confirmação explícita)</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Connection Status Button / Action */}
            <div className="pt-2">
              {connectionStatus.configured && connectionStatus.authUrl ? (
                <a
                  href={connectionStatus.authUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition"
                >
                  <YoutubeIcon className="w-4 h-4" />
                  <span>CONECTAR CANAL DO YOUTUBE</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center space-y-1">
                  <span className="text-xs font-mono text-zinc-400 block">
                    OAuth não configurado no servidor
                  </span>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET para autenticação OAuth. Todas as funcionalidades manuais do diário funcionam 100% offline.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Experiment Journal */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  Diário de Experimentos ({experiments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewExperiment(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewExperiment ? 'Cancelar' : 'Novo Experimento'}</span>
              </button>
            </div>

            {/* New Experiment Form */}
            {showNewExperiment && (
              <form onSubmit={handleAddExperiment} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                  Registrar Nova Hipótese Científica
                </span>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Hipótese Principal do Teste
                  </label>
                  <input
                    type="text"
                    value={hypothesis}
                    onChange={e => setHypothesis(e.target.value)}
                    placeholder="Ex: Em documentários investigativos, focar no objeto sob lona gera mais cliques do que o rosto do apresentador."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Variável Primária Isolada (O Que Muda)
                    </label>
                    <input
                      type="text"
                      value={primaryVariable}
                      onChange={e => setPrimaryVariable(e.target.value)}
                      placeholder="Ex: Sujeito (Pessoa vs Objeto)"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Variáveis Secundárias Mantidas Constantes
                    </label>
                    <input
                      type="text"
                      value={secondaryVariables}
                      onChange={e => setSecondaryVariables(e.target.value)}
                      placeholder="Ex: Título idêntico, iluminação sóbria idêntica"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                      Variante A (Controle)
                    </label>
                    <input
                      type="text"
                      value={variantA}
                      onChange={e => setVariantA(e.target.value)}
                      placeholder="Ex: Rosto do criador olhando para fora com sobrancelhas contraídas"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                      Variante B (Desafiante)
                    </label>
                    <input
                      type="text"
                      value={variantB}
                      onChange={e => setVariantB(e.target.value)}
                      placeholder="Ex: Silhueta do carro sob lona com texto 10 BILHÕES"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      ID do Vídeo no YouTube (Opcional)
                    </label>
                    <input
                      type="text"
                      value={videoId}
                      onChange={e => setVideoId(e.target.value)}
                      placeholder="Ex: dQw4w9WgXcQ"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                      Variante C (Opcional)
                    </label>
                    <input
                      type="text"
                      value={variantC}
                      onChange={e => setVariantC(e.target.value)}
                      placeholder="Ex: Galpão industrial vazio iluminado por facho"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                    Notas / Observações Preliminares
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Registros qualitativos sobre o teste..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold transition"
                >
                  Salvar Experimento no Diário
                </button>
              </form>
            )}

            {/* List of Experiments */}
            {experiments.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-2">
                <BookOpen className="w-7 h-7 text-zinc-600 mx-auto" />
                <h4 className="text-xs font-mono uppercase font-bold text-zinc-400">
                  Nenhum experimento registrado ainda
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Clique em &ldquo;Novo Experimento&rdquo; para registrar uma hipótese A/B com variáveis rigorosamente isoladas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {experiments.map(exp => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                            VARIÁVEL: {exp.primaryVariable}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {new Date(exp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-100 mt-1">
                          {exp.hypothesis}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteExperimentEntry(exp.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition shrink-0"
                        title="Remover experimento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Variante A:</span>
                        <p className="text-zinc-300 font-mono text-[11px]">{exp.variantA}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Variante B:</span>
                        <p className="text-zinc-300 font-mono text-[11px]">{exp.variantB}</p>
                      </div>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-zinc-400 italic">
                        Nota: {exp.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
