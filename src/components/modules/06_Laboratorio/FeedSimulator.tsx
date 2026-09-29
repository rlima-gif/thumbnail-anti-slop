'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, Search, ListVideo, Moon, Sun } from 'lucide-react';

interface FeedSimulatorProps {
  thumbnailUri: string | null;
  videoTitle: string;
  channelName: string;
  protagonist: string;
  thumbnailText: string;
}

type FeedContext = 'MOBILE_HOME' | 'DESKTOP_HOME' | 'SEARCH_RESULTS' | 'SIDEBAR_RELATED';
type FeedTheme = 'DARK' | 'LIGHT';

export function FeedSimulator({
  thumbnailUri,
  videoTitle,
  channelName,
  protagonist,
  thumbnailText
}: FeedSimulatorProps) {
  const [context, setContext] = useState<FeedContext>('MOBILE_HOME');
  const [theme, setTheme] = useState<FeedTheme>('DARK');

  const title = videoTitle.trim() || 'Por que a Apple desistiu do projeto mais caro da sua história';
  const channel = channelName.trim() || 'Antigravity Stories';

  const isDark = theme === 'DARK';
  const bgColor = isDark ? 'bg-[#0f0f0f]' : 'bg-[#f9f9f9]';
  const cardBg = isDark ? 'bg-[#181818]' : 'bg-[#ffffff]';
  const textColor = isDark ? 'text-[#f1f1f1]' : 'text-[#0f0f0f]';
  const subtextColor = isDark ? 'text-[#aaaaaa]' : 'text-[#606060]';
  const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-200';

  const renderThumbnail = (customTitle?: string, isUser = true) => (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center select-none shadow">
      {isUser && thumbnailUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUri}
          alt="Thumbnail sob teste"
          className="w-full h-full object-cover"
        />
      ) : isUser ? (
        <div className="w-full h-full bg-[#090a0d] p-3 flex flex-col justify-between text-left">
          <div className="text-[9px] font-mono text-amber-500 uppercase font-bold">SUA THUMBNAIL</div>
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-mono text-zinc-300 font-bold truncate max-w-[65%]">
              {protagonist || 'Protagonista'}
            </span>
            <span className="text-sm font-black font-mono text-zinc-100">
              {thumbnailText || '10 BI'}
            </span>
          </div>
          <div className="text-[8px] font-mono text-zinc-500">16:9 Editorial</div>
        </div>
      ) : (
        <div className="w-full h-full bg-zinc-900/90 p-3 flex flex-col justify-between text-left border border-zinc-800">
          <div className="text-[9px] font-mono text-zinc-500 uppercase">VÍDEO CONCORRENTE</div>
          <span className="text-[10px] font-sans text-zinc-400 font-medium truncate">
            {customTitle || 'Conteúdo do feed vizinho'}
          </span>
          <div className="text-[8px] font-mono text-zinc-600">Miniatura genérica</div>
        </div>
      )}
      <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
        14:28
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block">
            Extensão do Laboratório Óptico
          </span>
          <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
            Simulador de Feed do YouTube
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Context Selector */}
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setContext('MOBILE_HOME')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition ${
                context === 'MOBILE_HOME' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setContext('DESKTOP_HOME')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition ${
                context === 'DESKTOP_HOME' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3 h-3" />
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setContext('SEARCH_RESULTS')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition ${
                context === 'SEARCH_RESULTS' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Search className="w-3 h-3" />
              Busca
            </button>
            <button
              type="button"
              onClick={() => setContext('SIDEBAR_RELATED')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition ${
                context === 'SIDEBAR_RELATED' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListVideo className="w-3 h-3" />
              Sidebar
            </button>
          </div>

          {/* Theme Selector */}
          <button
            type="button"
            onClick={() => setTheme(prev => (prev === 'DARK' ? 'LIGHT' : 'DARK'))}
            className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition"
            title="Alternar tema YouTube Dark / Light"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Simulator Viewport Container */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${bgColor} ${borderColor} overflow-hidden shadow-inner`}>
        {/* MOBILE HOME SIMULATOR */}
        {context === 'MOBILE_HOME' && (
          <div className="max-w-[340px] mx-auto space-y-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
              Simulação de Feed Mobile (340px viewport)
            </div>

            {/* User Video Card */}
            <div className={`rounded-2xl p-2.5 space-y-2.5 transition-colors border ${cardBg} ${borderColor} shadow-sm`}>
              {renderThumbnail()}
              <div className="flex gap-2.5 px-0.5">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                  {channel.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h5 className={`text-xs font-semibold leading-tight line-clamp-2 ${textColor}`}>
                    {title}
                  </h5>
                  <div className={`text-[10px] ${subtextColor}`}>
                    {channel} • 142 mil visualizações • há 2 dias
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Video Card to test contrast */}
            <div className={`rounded-2xl p-2.5 space-y-2.5 transition-colors border opacity-70 ${cardBg} ${borderColor}`}>
              {renderThumbnail('O que ninguém te conta sobre o Vale do Silício', false)}
              <div className="flex gap-2.5 px-0.5">
                <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                  C
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h5 className={`text-xs font-semibold leading-tight line-clamp-2 ${textColor}`}>
                    O que ninguém te conta sobre o Vale do Silício
                  </h5>
                  <div className={`text-[10px] ${subtextColor}`}>
                    Canal Concorrente • 89 mil visualizações • há 4 dias
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DESKTOP HOME SIMULATOR */}
        {context === 'DESKTOP_HOME' && (
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
              Simulação de Grade Desktop (Home Feed)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* User Video */}
              <div className={`rounded-2xl p-3 space-y-2.5 border ${cardBg} ${borderColor} shadow-sm ring-2 ring-amber-500/20`}>
                {renderThumbnail()}
                <div className="flex gap-2.5 pt-1">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {channel.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className={`text-xs font-bold leading-tight line-clamp-2 ${textColor}`}>
                      {title}
                    </h5>
                    <div className={`text-[11px] ${subtextColor}`}>{channel}</div>
                    <div className={`text-[10px] ${subtextColor}`}>
                      218 mil visualizações • há 1 dia
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor 1 */}
              <div className={`rounded-2xl p-3 space-y-2.5 border opacity-75 ${cardBg} ${borderColor}`}>
                {renderThumbnail('Documentário: O Colapso dos Carros Autônomos', false)}
                <div className="flex gap-2.5 pt-1">
                  <div className="w-9 h-9 rounded-full bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                    T
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className={`text-xs font-medium leading-tight line-clamp-2 ${textColor}`}>
                      Documentário: O Colapso dos Carros Autônomos
                    </h5>
                    <div className={`text-[11px] ${subtextColor}`}>Tech Report</div>
                    <div className={`text-[10px] ${subtextColor}`}>
                      95 mil visualizações • há 3 dias
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor 2 */}
              <div className={`rounded-2xl p-3 space-y-2.5 border opacity-75 hidden lg:block ${cardBg} ${borderColor}`}>
                {renderThumbnail('Como 10 Bilhões Foram Gastos em Segredo', false)}
                <div className="flex gap-2.5 pt-1">
                  <div className="w-9 h-9 rounded-full bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                    B
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h5 className={`text-xs font-medium leading-tight line-clamp-2 ${textColor}`}>
                      Como 10 Bilhões Foram Gastos em Segredo
                    </h5>
                    <div className={`text-[11px] ${subtextColor}`}>Business Insider</div>
                    <div className={`text-[10px] ${subtextColor}`}>
                      340 mil visualizações • há 1 semana
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH RESULTS SIMULATOR */}
        {context === 'SEARCH_RESULTS' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
              Simulação de Resultados de Busca (Layout Horizontal)
            </div>

            {/* User Search Item */}
            <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row gap-3.5 items-start ${cardBg} ${borderColor} ring-1 ring-amber-500/30`}>
              <div className="w-full sm:w-64 shrink-0">
                {renderThumbnail()}
              </div>
              <div className="space-y-1.5 min-w-0 py-0.5">
                <h5 className={`text-sm font-bold leading-snug line-clamp-2 ${textColor}`}>
                  {title}
                </h5>
                <div className={`text-[11px] ${subtextColor}`}>
                  {channel} • 142 mil visualizações • há 2 dias
                </div>
                <p className={`text-xs line-clamp-2 leading-relaxed font-sans ${subtextColor}`}>
                  Uma investigação minuciosa sobre as decisões internas, os protótipos secretos e a autópsia financeira do projeto mais misterioso da década.
                </p>
              </div>
            </div>

            {/* Competitor Search Item */}
            <div className={`p-3 rounded-2xl border opacity-70 flex flex-col sm:flex-row gap-3.5 items-start ${cardBg} ${borderColor}`}>
              <div className="w-full sm:w-64 shrink-0">
                {renderThumbnail('O que aconteceu com os carros da Apple?', false)}
              </div>
              <div className="space-y-1.5 min-w-0 py-0.5">
                <h5 className={`text-sm font-medium leading-snug line-clamp-2 ${textColor}`}>
                  O que aconteceu com os carros da Apple?
                </h5>
                <div className={`text-[11px] ${subtextColor}`}>
                  Canal Tech Geral • 45 mil visualizações • há 5 dias
                </div>
                <p className={`text-xs line-clamp-2 leading-relaxed font-sans ${subtextColor}`}>
                  Entenda os motivos oficiais e os rumores que levaram ao encerramento dos testes do veículo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR RELATED SIMULATOR */}
        {context === 'SIDEBAR_RELATED' && (
          <div className="max-w-sm mx-auto space-y-3">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center">
              Simulação de Coluna Lateral (Próximos Vídeos)
            </div>

            {/* User Sidebar Item */}
            <div className={`p-2 rounded-xl border flex gap-2.5 items-start ${cardBg} ${borderColor} ring-1 ring-amber-500/30`}>
              <div className="w-36 shrink-0">
                {renderThumbnail()}
              </div>
              <div className="space-y-0.5 min-w-0 py-0.5">
                <h5 className={`text-xs font-bold leading-tight line-clamp-2 ${textColor}`}>
                  {title}
                </h5>
                <div className={`text-[10px] ${subtextColor}`}>{channel}</div>
                <div className={`text-[9px] ${subtextColor}`}>142 mil visualizações</div>
              </div>
            </div>

            {/* Competitor Sidebar Item */}
            <div className={`p-2 rounded-xl border opacity-70 flex gap-2.5 items-start ${cardBg} ${borderColor}`}>
              <div className="w-36 shrink-0">
                {renderThumbnail('A Falha de Design que Ninguém Viu', false)}
              </div>
              <div className="space-y-0.5 min-w-0 py-0.5">
                <h5 className={`text-xs font-medium leading-tight line-clamp-2 ${textColor}`}>
                  A Falha de Design que Ninguém Viu
                </h5>
                <div className={`text-[10px] ${subtextColor}`}>Design Docs</div>
                <div className={`text-[9px] ${subtextColor}`}>67 mil visualizações</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
