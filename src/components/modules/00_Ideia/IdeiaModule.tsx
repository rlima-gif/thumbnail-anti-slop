'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export function IdeiaModule() {
  const [selectedState, setSelectedState] = useState<'SLOP' | 'CLICAVEL' | 'EXCELENTE'>('EXCELENTE');

  return (
    <section id="ideia" className="scroll-mt-24 pt-4 pb-12 border-b border-zinc-800">
      {/* Editorial Hero */}
      <div className="py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Manifesto de Direção Visual
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-100 uppercase leading-[1.05] max-w-5xl">
          Thumbnail excelente não tem mais efeitos. <br />
          <span className="text-amber-500">Tem mais decisões.</span>
        </h2>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-5xl">
          <p className="text-lg sm:text-xl text-zinc-300 font-serif italic border-l-2 border-amber-500 pl-4">
            &ldquo;Uma thumbnail não precisa gritar. Precisa ser entendida.&rdquo;
          </p>
          <div className="text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl max-w-md">
            <span className="text-amber-400 font-bold block mb-1">AXIOMA FUNDAMENTAL:</span>
            IA ruim acontece quando a IA precisa tomar decisões que o diretor deveria ter tomado.
          </div>
        </div>
      </div>

      {/* Interactive Comparison: SLOP vs CLICÁVEL vs EXCELENTE */}
      <div className="mt-8 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Comparação Interativa
            </span>
            <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">
              A Evolução do Clique: Da Bagunça à Maestria
            </h3>
          </div>

          {/* State Switcher Tabs */}
          <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedState('SLOP')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                selectedState === 'SLOP'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              01 • Slop
            </button>
            <button
              onClick={() => setSelectedState('CLICAVEL')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                selectedState === 'CLICAVEL'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              02 • Clicável
            </button>
            <button
              onClick={() => setSelectedState('EXCELENTE')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                selectedState === 'EXCELENTE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              03 • Excelente
            </button>
          </div>
        </div>

        {/* Dynamic Display Area */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Visual 16:9 Canvas Mockup */}
          <div className="lg:col-span-7">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 shadow-2xl transition-all duration-300">
              {/* STATE 1: SLOP */}
              {selectedState === 'SLOP' && (
                <div className="w-full h-full relative bg-gradient-to-tr from-purple-900 via-blue-900 to-indigo-950 p-4 flex flex-col justify-between overflow-hidden">
                  {/* Fire and particle sparks simulation */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-500 via-rose-600 to-transparent animate-pulse" />
                  <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-yellow-400 blur-xs animate-ping" />
                  <div className="absolute top-10 right-12 w-2 h-2 rounded-full bg-cyan-400 blur-xs" />
                  <div className="absolute bottom-14 left-1/3 w-3 h-3 rounded-full bg-orange-500 blur-xs" />

                  {/* Top chaos stickers */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="bg-yellow-400 text-black font-black text-xs px-3 py-1 rounded-sm rotate-[-8deg] border-2 border-white shadow-[0_0_15px_rgba(250,204,21,0.8)]">
                      NÃO ACREDITO!! 😱😱
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-red-600 bg-red-600/30 flex items-center justify-center animate-bounce">
                      <span className="text-[10px] font-bold text-white uppercase">Aqui!</span>
                    </div>
                  </div>

                  {/* Center caricature scream mockup */}
                  <div className="relative z-10 flex items-end justify-center gap-4">
                    {/* Chaotic red arrows */}
                    <svg className="w-16 h-16 text-red-500 animate-pulse drop-shadow-[0_0_8px_red]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l4 8h-3v10h-2V10H8l4-8z" transform="rotate(45 12 12)" />
                    </svg>

                    {/* Exaggerated Shock Face Cutout Simulation */}
                    <div className="w-36 h-40 bg-zinc-300 rounded-t-full border-4 border-white shadow-[0_0_25px_cyan] flex flex-col items-center justify-center relative">
                      <div className="text-[10px] font-mono text-zinc-800 font-bold mb-2">ROSTO RECORTADO</div>
                      <div className="flex gap-4">
                        <div className="w-5 h-5 rounded-full bg-zinc-950 border-2 border-red-500" />
                        <div className="w-5 h-5 rounded-full bg-zinc-950 border-2 border-red-500" />
                      </div>
                      <div className="w-10 h-12 bg-red-800 rounded-full mt-2 border-2 border-yellow-300" />
                      <div className="absolute -top-3 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        100% HDR
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="bg-cyan-500 text-black font-black text-[11px] px-2 py-1 rounded shadow-lg border border-white">
                        $999,999??
                      </div>
                      <svg className="w-12 h-12 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Heavy Bottom Text Clutter */}
                  <div className="relative z-10 bg-gradient-to-r from-red-600 to-yellow-500 text-black text-center font-black text-sm tracking-wider py-1 border-y-2 border-white">
                    GRAVE: TUDO DEU ERRADO NO FINAL!!
                  </div>
                </div>
              )}

              {/* STATE 2: CLICÁVEL */}
              {selectedState === 'CLICAVEL' && (
                <div className="w-full h-full relative bg-zinc-900 p-5 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-zinc-800 via-zinc-900 to-zinc-950" />

                  {/* Generic clean header */}
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded">
                      Formato Padronizado
                    </span>
                    <span className="text-xs text-blue-400 font-semibold">Contraste Aceitável</span>
                  </div>

                  {/* Subject and product */}
                  <div className="relative z-10 flex items-end justify-between px-6">
                    <div className="w-32 h-36 bg-zinc-400 rounded-t-3xl border border-zinc-600 flex flex-col items-center justify-center shadow-lg">
                      <div className="text-[10px] font-mono text-zinc-900 font-bold mb-1">CRIADOR</div>
                      <div className="w-6 h-6 rounded-full bg-zinc-700 mb-1" />
                      <div className="text-[9px] text-zinc-800 text-center px-2">Pose neutra de estúdio</div>
                    </div>

                    <div className="w-28 h-28 bg-zinc-800 border-2 border-blue-500/50 rounded-xl flex flex-col items-center justify-center p-2 shadow-xl">
                      <div className="w-12 h-8 bg-zinc-700 rounded mb-1" />
                      <span className="text-[10px] text-zinc-300 font-bold">PRODUTO</span>
                    </div>
                  </div>

                  {/* Clean standard typography */}
                  <div className="relative z-10 bg-zinc-950/90 border border-zinc-800 p-2 text-center rounded-lg">
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                      VALE A PENA EM 2026? TESTE COMPLETO
                    </span>
                  </div>
                </div>
              )}

              {/* STATE 3: EXCELENTE */}
              {selectedState === 'EXCELENTE' && (
                <div className="w-full h-full relative bg-[#0a0b0e] p-6 flex flex-col justify-between overflow-hidden">
                  {/* Subtle directional motivated light falloff */}
                  <div className="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-zinc-900/40 blur-3xl pointer-events-none" />

                  {/* Subtle editorial watermark/corner */}
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                        Direção Cinematográfica
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Ponto Focal Único
                    </span>
                  </div>

                  {/* Protagonist with clear silhouette and negative space */}
                  <div className="relative z-10 flex items-center justify-between px-4">
                    {/* Narrative Subject with motivated rim and natural depth */}
                    <div className="relative">
                      <div className="w-44 h-32 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-3 flex flex-col justify-between relative group">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                          <span>DOC #081</span>
                          <span className="text-amber-400 font-bold">LACRADO</span>
                        </div>
                        <div className="py-2">
                          <div className="w-16 h-1 bg-amber-500 mb-2 rounded" />
                          <div className="text-xs font-mono font-bold text-zinc-200">PROJETO TITAN</div>
                          <div className="text-[9px] text-zinc-400">Chassi coberto sob lona fosca</div>
                        </div>
                        <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                          <span>SILHUETA LIMPA</span>
                        </div>
                      </div>
                      <div className="absolute -inset-1 bg-amber-500/5 rounded-xl blur-lg -z-10" />
                    </div>

                    {/* Negative space with subtle high impact typography */}
                    <div className="text-right max-w-[200px]">
                      <div className="text-3xl font-black font-mono text-zinc-100 tracking-tighter leading-none mb-1">
                        10 BI
                      </div>
                      <div className="text-[11px] font-mono text-amber-400 uppercase tracking-widest">
                        A Autópsia
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-2 font-serif italic">
                        Uma pergunta no ar: por que foi abandonado?
                      </div>
                    </div>
                  </div>

                  {/* Subordinate background indication */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/80 pt-2 font-mono">
                    <span>16:9 • REGRA DOS TERÇOS</span>
                    <span>LEITURA EM 0,5 SEGUNDO</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 text-center mt-2 font-mono">
              Visualizador conceitual em CSS/SVG • Nenhuma imagem externa necessária
            </p>
          </div>

          {/* Breakdown Explanation Side Panel */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {selectedState === 'SLOP' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Diagnóstico: Caos de Atenção
                </div>
                <h4 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">
                  Tudo tenta chamar atenção. <br />
                  <span className="text-rose-400">Nada merece atenção.</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Slop não é apenas &ldquo;feio&rdquo; — é primordialmente uma falha estrutural de hierarquia e direção de arte. O criador não tomou decisões, então acumulou todos os filtros, setas, carões e glows possíveis.
                </p>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-semibold text-rose-300">Sintomas comuns de Slop:</div>
                  <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Boca aberta caricata sem contexto narrativo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Setas e círculos vermelhos redundantes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Glow artificial e contorno branco estilo adesivo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Fogo, partículas e gradiente gamer roxo/azul
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {selectedState === 'CLICAVEL' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                  <Layers className="w-3.5 h-3.5" />
                  Diagnóstico: Medíocre & Intercambiável
                </div>
                <h4 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">
                  Funciona. <br />
                  <span className="text-blue-400">Mas poderia ser de qualquer canal.</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Possui contraste razoável, recorte limpo e texto legível, mas não constrói autoridade nem memória de marca. Se você trocar a foto do criador pela de outro youtuber, ninguém nota a diferença.
                </p>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-semibold text-blue-300">O que ainda falta:</div>
                  <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Falta uma pergunta silenciosa profunda
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Falta assinatura visual e paleta própria
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Iluminação de template sem atmosfera dramática
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {selectedState === 'EXCELENTE' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Direção Humana Superior
                </div>
                <h4 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">
                  Uma história. <br />
                  <span className="text-amber-400">Um foco. Uma pergunta.</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Ideia visual dominante com protagonista inequívoco. O fundo é subordinado, a iluminação é motivada e o contraste está concentrado exatamente onde o olhar deve pousar.
                </p>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="font-semibold text-amber-300">Pilares da Excelência:</div>
                  <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Silhueta legível em menos de 0,5 segundo
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Luz com fonte física tangível (sem brilho mágico)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Título e imagem se complementam sem redundância
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Espaço negativo que confere autoridade editorial
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
