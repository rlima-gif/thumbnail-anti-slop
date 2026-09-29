'use client';

import React from 'react';
import { ProjectProvider } from '@/context/ProjectContext';
import { Header } from '@/components/layout/Header';
import { ChapterNav } from '@/components/layout/ChapterNav';
import { WorkflowLoop } from '@/components/layout/WorkflowLoop';
import { IdeiaModule } from '@/components/modules/00_Ideia/IdeiaModule';
import { CliqueModule } from '@/components/modules/01_Clique/CliqueModule';
import { ReferenciasModule } from '@/components/modules/02_Referencias/ReferenciasModule';
import { DirecaoModule } from '@/components/modules/03_Direcao/DirecaoModule';
import { AntiSlopModule } from '@/components/modules/04_AntiSlop/AntiSlopModule';
import { AnatomiaModule } from '@/components/modules/05_Anatomia/AnatomiaModule';
import { LaboratorioModule } from '@/components/modules/06_Laboratorio/LaboratorioModule';
import { ChecklistModule } from '@/components/modules/07_Checklist/ChecklistModule';
import { GeradorModule } from '@/components/modules/08_Gerador/GeradorModule';
import { ABTestModule } from '@/components/modules/09_ABTest/ABTestModule';
import { ChannelDNAModule } from '@/components/modules/10_ChannelDNA/ChannelDNAModule';
import { GlossarioModule } from '@/components/modules/Glossario/GlossarioModule';

export default function Home() {
  return (
    <ProjectProvider>
      <div className="min-h-screen flex flex-col bg-[#090a0d] text-zinc-100">
        {/* Global Persistent Header */}
        <Header />

        {/* Sticky Chapter Navigation Bar */}
        <ChapterNav />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Visual Product Workflow Loop (Module 31) */}
          <WorkflowLoop />

          {/* Module 00 — Ideia */}
          <IdeiaModule />

          {/* Module 01 — Clique */}
          <CliqueModule />

          {/* Module 02 — Referências */}
          <ReferenciasModule />

          {/* Module 03 — Direção */}
          <DirecaoModule />

          {/* Module 04 — Anti-Slop */}
          <AntiSlopModule />

          {/* Module 05 — Anatomia */}
          <AnatomiaModule />

          {/* Module 06 — Laboratório */}
          <LaboratorioModule />

          {/* Module 07 — Checklist */}
          <ChecklistModule />

          {/* Module 08 — Gerador */}
          <GeradorModule />

          {/* Module 09 — A/B Test */}
          <ABTestModule />

          {/* Module 10 — YouTube Channel DNA & Diário de Experimentos */}
          <ChannelDNAModule />

          {/* Technical Reference — Glossário */}
          <GlossarioModule />
        </main>

        {/* Editorial Footer */}
        <footer className="border-t border-zinc-800 bg-zinc-950 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
              <div className="md:col-span-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono font-bold text-xs">
                    TAS
                  </div>
                  <span className="text-sm font-black tracking-tight uppercase text-zinc-100">
                    Thumbnail Anti-Slop
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-serif italic max-w-md">
                  &ldquo;A IA executa o que você direciona. O objetivo não é parecer uma thumbnail genérica, mas uma cena que merece ser clicada.&rdquo;
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  100% Client-Side • Armazenamento Local Privado • Zero Telemetria
                </p>
              </div>

              <div className="md:col-span-6 flex flex-col md:items-end space-y-2 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-4">
                  <span>Subtrair antes de decorar</span>
                  <span>•</span>
                  <span>Menos efeitos, mais decisões</span>
                </div>
                <div className="text-[10px] text-zinc-400">
                  Direção visual para criadores que respeitam a inteligência do espectador.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProjectProvider>
  );
}
