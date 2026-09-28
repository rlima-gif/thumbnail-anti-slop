'use client';

import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Sparkles, Filter, Eye, Scissors, Cpu, Sliders } from 'lucide-react';

const LOOP_STEPS = [
  {
    step: 'BRIEF',
    title: 'Definição do Tema',
    desc: 'O que é o vídeo, qual a promessa central e quem é o público-alvo.',
    icon: Sparkles
  },
  {
    step: 'DECIDIR',
    title: 'Pergunta & Protagonista',
    desc: 'Definir o que precisa ser lido em 0,5s e qual pergunta silenciosa a imagem cria.',
    icon: Eye
  },
  {
    step: 'SIMPLIFICAR',
    title: 'Subtrair Antes de Decorar',
    desc: 'Eliminar elementos secundários concorrentes, logos flutuantes e excessos.',
    icon: Scissors
  },
  {
    step: 'GERAR',
    title: 'Prompt Art-Directed',
    desc: 'Construir a direção fotográfica com luz motivada, ótica e negativos de slop.',
    icon: Cpu
  },
  {
    step: 'REDUZIR',
    title: 'Teste de 10% Mobile',
    desc: 'Verificar se a miniatura resiste à escala reduzida e à compressão.',
    icon: Filter
  },
  {
    step: 'CRITICAR',
    title: 'Laboratório & Diagnóstico',
    desc: 'Analisar pontos concorrentes, risco de IA e relação complementar com o título.',
    icon: Eye
  },
  {
    step: 'ALTERAR UMA VARIÁVEL',
    title: 'Hipótese Controlada',
    desc: 'Mudar apenas a luz, o enquadramento ou o protagonista — nunca tudo ao mesmo tempo.',
    icon: Sliders
  },
  {
    step: 'REPETIR',
    title: 'Refinamento Contínuo',
    desc: 'Iterar até que a thumbnail pareça dirigida por um ser humano intencional.',
    icon: RefreshCw
  }
];

export function WorkflowLoop() {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">
            Fluxo Contínuo de Direção
          </span>
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
            O Loop Anti-Slop de Criação
          </h3>
        </div>
        <p className="text-xs text-zinc-400 max-w-md">
          Thumbnail não é loteria de prompts aleatórios. É um processo redutivo de refinamento onde a IA executa o que você direciona.
        </p>
      </div>

      {/* Loop Track */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {LOOP_STEPS.map((item, idx) => {
          const isSelected = selectedStep === idx;
          const Icon = item.icon;
          return (
            <button
              key={item.step}
              onClick={() => setSelectedStep(isSelected ? null : idx)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-zinc-100 shadow-lg shadow-amber-500/5'
                  : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] font-mono text-zinc-400 font-bold">
                  0{idx + 1}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
              </div>
              <div className="text-xs font-bold tracking-tight uppercase truncate">
                {item.step}
              </div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                {item.title}
              </div>

              {idx < LOOP_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-zinc-400">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Step Drawer */}
      {selectedStep !== null && (
        <div className="mt-4 pt-3 border-t border-zinc-800 text-xs flex items-center justify-between text-zinc-300 bg-zinc-950/50 p-3 rounded-xl">
          <div>
            <span className="font-bold text-amber-400 mr-2">
              Passo {selectedStep + 1} — {LOOP_STEPS[selectedStep].step}:
            </span>
            <span className="text-zinc-200">{LOOP_STEPS[selectedStep].title}</span>
            <span className="text-zinc-400 ml-2">— {LOOP_STEPS[selectedStep].desc}</span>
          </div>
          <button
            onClick={() => setSelectedStep(null)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 ml-4 underline"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
