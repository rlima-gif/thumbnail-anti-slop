'use client';

import React, { useState, useEffect } from 'react';

export interface Chapter {
  id: string;
  number: string;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'ideia', number: '00', title: 'Ideia' },
  { id: 'clique', number: '01', title: 'Clique' },
  { id: 'referencias', number: '02', title: 'Referências' },
  { id: 'direcao', number: '03', title: 'Direção' },
  { id: 'anti-slop', number: '04', title: 'Anti-Slop' },
  { id: 'anatomia', number: '05', title: 'Anatomia' },
  { id: 'laboratorio', number: '06', title: 'Laboratório' },
  { id: 'checklist', number: '07', title: 'Checklist' },
  { id: 'gerador', number: '08', title: 'Gerador' },
  { id: 'ab-test', number: '09', title: 'A/B Test' },
  { id: 'glossario', number: '§', title: 'Glossário' }
];

export function ChapterNav() {
  const [activeChapter, setActiveChapter] = useState('ideia');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveChapter(CHAPTERS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveChapter(id);
    }
  };

  return (
    <nav className="sticky top-[61px] z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
        {CHAPTERS.map(ch => {
          const isActive = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => scrollTo(ch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <span className={`font-mono text-[11px] ${isActive ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
                {ch.number}
              </span>
              <span>{ch.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
