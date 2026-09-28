'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { ProtagonistType } from '@/types';
import { calculateTitleThumbnailDelta } from '@/lib/heuristics';

const PROTAGONIST_OPTIONS: ProtagonistType[] = [
  'Pessoa',
  'Produto',
  'Personagem',
  'Objeto',
  'Tela/interface',
  'Cena',
  'Antes/depois',
  'Resultado',
  'Mistério'
];

const SILENT_QUESTION_PRESETS = [
  'O que aconteceu aqui?',
  'Como ele conseguiu fazer isso?',
  'Isso realmente funciona na prática?',
  'Por que isso está tão diferente do normal?',
  'O que existe escondido aí dentro?',
  'Isso deu terrivelmente errado?',
  'Quem autorizou essa decisão?'
];

export function CliqueModule() {
  const { currentProject, updateProject } = useProject();

  const deltaResult = calculateTitleThumbnailDelta(currentProject);

  return (
    <section id="clique" className="scroll-mt-24 py-12 border-b border-zinc-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-amber-500 tracking-widest font-bold mb-2">
            Módulo 01 • Arquitetura do Clique
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-zinc-100 uppercase tracking-tight">
            As 4 Perguntas Fundamentais
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md font-mono">
          &ldquo;CTR começa antes do prompt. Uma thumbnail e seu título são duas metades da mesma promessa.&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form with the 4 Questions */}
        <div className="lg:col-span-7 space-y-6 bg-zinc-900/60 border border-zinc-800 p-6 sm:p-7 rounded-3xl">
          {/* QUESTION 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  Q1
                </span>
                O que precisa ser percebido em 0,5–1 segundo?
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Velocidade de Feed</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Qual é o formato ou anomalia que o cérebro do usuário deve registrar antes de piscar?
            </p>
            <input
              type="text"
              value={currentProject.perceptionGoal}
              onChange={e => updateProject({ perceptionGoal: e.target.value })}
              placeholder="Ex: Um console portátil com a carcaça translúcida mostrando peças de ouro..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* QUESTION 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  Q2
                </span>
                Quem ou o que é o protagonista?
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Ponto Focal Singular</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Escolha uma categoria prioritária. Evite thumbnails com dois protagonistas disputando a mesma força.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {PROTAGONIST_OPTIONS.map(opt => {
                const isSelected = currentProject.protagonistType === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateProject({ protagonistType: opt })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION 3 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  Q3
                </span>
                Qual pergunta silenciosa a imagem deve criar?
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Curiosity Gap</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              A thumbnail não entrega a resposta; ela instiga uma pergunta irresistível no espectador.
            </p>

            <div className="flex flex-wrap gap-1.5 pb-1">
              {SILENT_QUESTION_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateProject({ viewerQuestion: preset })}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition"
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={currentProject.viewerQuestion}
              onChange={e => updateProject({ viewerQuestion: e.target.value })}
              placeholder="Digite a pergunta silenciosa criada pela cena..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* QUESTION 4 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
                  Q4
                </span>
                O que o título já explica?
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Fato vs Emoção</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              O que o título já informa textualmente para que a miniatura NÃO precise repetir.
            </p>
            <input
              type="text"
              value={currentProject.titleExplains}
              onChange={e => updateProject({ titleExplains: e.target.value })}
              placeholder="Ex: Já explica o modelo do aparelho e que o teste foi de 30 dias de uso..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Right Column: Title × Thumbnail Delta Diagnostic */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 rounded-3xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
                Heurística Criativa
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Orientação Conceitual
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-tight">
              Title × Thumbnail Delta
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Avaliação determinística da distância semântica e do valor complementar gerado entre o título e a imagem.
            </p>

            {/* Current Delta State Indicator */}
            <div className="mt-5 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                  Estado Heurístico:
                </span>
                <span
                  className={`text-sm sm:text-base font-black font-mono tracking-wider ${
                    deltaResult.state === 'COMPLEMENTAR'
                      ? 'text-emerald-400'
                      : deltaResult.state === 'REDUNDANTE'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {deltaResult.state}
                </span>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                  deltaResult.state === 'COMPLEMENTAR'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : deltaResult.state === 'REDUNDANTE'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {deltaResult.state === 'COMPLEMENTAR'
                  ? 'Alta Sinergia'
                  : deltaResult.state === 'REDUNDANTE'
                  ? 'Redundância'
                  : 'Desconectado'}
              </div>
            </div>

            {/* Detailed Heuristic Breakdown Fields */}
            <div className="mt-5 space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">
                  O título conta:
                </span>
                <p className="text-zinc-200">{deltaResult.oTituloConta}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">
                  A thumbnail conta:
                </span>
                <p className="text-zinc-200">{deltaResult.aThumbnailConta}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">
                  Possível redundância:
                </span>
                <p className={deltaResult.repeatedTerms.length > 0 ? 'text-rose-300' : 'text-zinc-300'}>
                  {deltaResult.possivelRedundancia}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">
                  Informação complementar:
                </span>
                <p className="text-zinc-300">{deltaResult.informacaoComplementar}</p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">
                  Pergunta criada:
                </span>
                <p className="text-amber-300 font-serif italic">{deltaResult.perguntaCriada}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Heurística baseada em termos determinísticos</span>
            <span className="text-amber-500/80">Sem falsa IA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
