'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { ReferenceCategory, ReferenceItem } from '@/types';
import { generateReferenceSearchQueries } from '@/lib/referenceSearchGenerator';
import { Plus, Trash2, Copy, Check, Search, BookmarkPlus } from 'lucide-react';

function createRefId(): string {
  return `ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

const REFERENCE_CATEGORIES: ReferenceCategory[] = [
  'Composição',
  'Enquadramento',
  'Expressão',
  'Luz',
  'Cor',
  'Profundidade',
  'Tipografia',
  'Escala',
  'Narrativa',
  'Textura',
  'Separação figura/fundo',
  'Identidade do canal'
];

const CURATED_PRESETS: Array<Omit<ReferenceItem, 'id'>> = [
  {
    name: 'David Fincher (Mindhunter)',
    category: 'Luz',
    purpose: 'Atmosfera documental investigativa e controle de penumbra',
    extractedDecision: 'Sombras profundas e ricas; manter a luz quente pontual apenas onde o olhar deve focar.'
  },
  {
    name: 'Wired Magazine (Fotografia Industrial)',
    category: 'Textura',
    purpose: 'Verossimilhança de hardware e materiais táteis',
    extractedDecision: 'Exibir micro-texturas reais de metal e plástico fosco sem reflexos falsos de CGI.'
  },
  {
    name: 'Blade Runner 2049 (Roger Deakins)',
    category: 'Separação figura/fundo',
    purpose: 'Silhueta pura contra névoa luminosa',
    extractedDecision: 'Subordinar o cenário em uma massa monocromática de poeira e destacar o sujeito por recorte de silhueta.'
  },
  {
    name: 'Steve McCurry (Fotojornalismo Magnum)',
    category: 'Expressão',
    purpose: 'Olhar penetrante sem afetação ou careta',
    extractedDecision: 'Expressão humana calma, sobrancelhas relaxadas e intensidade ocular motivada pela situação.'
  }
];

export function ReferenciasModule() {
  const { currentProject, updateProject, showToast } = useProject();

  // New Reference Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ReferenceCategory>('Composição');
  const [purpose, setPurpose] = useState('');
  const [extractedDecision, setExtractedDecision] = useState('');
  const [notes, setNotes] = useState('');

  // Search generator state
  const [searchAtmosphere, setSearchAtmosphere] = useState('dramatic cinematic tension');
  const [searchVisualLang, setSearchVisualLang] = useState('editorial documentary');
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !extractedDecision.trim()) {
      showToast('Preencha pelo menos o Nome e a Decisão Extraída da referência.');
      return;
    }

    const newItem: ReferenceItem = {
      id: createRefId(),
      name: name.trim(),
      category,
      purpose: purpose.trim() || 'Referência de estilo',
      extractedDecision: extractedDecision.trim(),
      notes: notes.trim()
    };

    updateProject({
      references: [...currentProject.references, newItem]
    });

    setName('');
    setPurpose('');
    setExtractedDecision('');
    setNotes('');
    showToast(`Referência "${newItem.name}" adicionada.`);
  };

  const handleAddPreset = (preset: Omit<ReferenceItem, 'id'>) => {
    const newItem: ReferenceItem = {
      ...preset,
      id: createRefId()
    };
    updateProject({
      references: [...currentProject.references, newItem]
    });
    showToast(`Referência curada "${preset.name}" adicionada.`);
  };

  const handleRemoveReference = (id: string) => {
    updateProject({
      references: currentProject.references.filter(r => r.id !== id)
    });
    showToast('Referência removida.');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(text);
    showToast('Frase copiada para a área de transferência!');
    setTimeout(() => setCopiedQuery(null), 2500);
  };

  const searchQueries = generateReferenceSearchQueries({
    niche: currentProject.niche,
    subject: currentProject.protagonist || currentProject.videoTitle,
    thumbnailType: currentProject.protagonistType,
    visualLanguage: searchVisualLang,
    atmosphere: searchAtmosphere,
    protagonist: currentProject.protagonist
  });

  return (
    <section id="referencias" className="scroll-mt-24 py-12 border-b border-zinc-800">
      {/* Banner Philosophy */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl mb-8">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold block mb-1">
          Princípio Pedagógico de Direção
        </span>
        <h3 className="text-base sm:text-lg font-black text-zinc-100 uppercase tracking-tight">
          Referência não é imagem para copiar. É uma decisão para extrair.
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
          Evite ficar em loop olhando miniaturas de concorrentes do YouTube. Busque referências no cinema clássico, fotojornalismo e capas editoriais para criar um padrão visual que eleve o valor do canal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reference Management */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Reference Form */}
          <div className="bg-zinc-900/70 border border-zinc-800 p-6 rounded-3xl">
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-amber-500" />
              Adicionar Decisão de Referência
            </h4>

            <form onSubmit={handleAddReference} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Nome da Obra / Autor
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Oppenheimer (Luz de Hoyte van Hoytema)"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                    Categoria da Decisão
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ReferenceCategory)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    {REFERENCE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">
                  Propósito da Referência
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="Ex: Separação dramática do protagonista usando névoa"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-amber-400 uppercase block mb-1 font-bold">
                  Decisão Concreta Extraída (A ser usada no Gerador)
                </label>
                <textarea
                  rows={2}
                  value={extractedDecision}
                  onChange={e => setExtractedDecision(e.target.value)}
                  placeholder="Ex: Personagem ligeiramente deslocado à esquerda, criando tensão no espaço negativo da direita com iluminação suave em 45 graus."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-zinc-400 font-mono">
                  Será injetada automaticamente no prompt
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Salvar Referência
                </button>
              </div>
            </form>
          </div>

          {/* Active References in Project */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Decisões Ativas no Projeto ({currentProject.references.length})
              </span>
            </div>

            {currentProject.references.length === 0 ? (
              <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-center text-xs text-zinc-400">
                Nenhuma referência cadastrada. Adicione uma acima ou selecione uma das sugestões curadas ao lado.
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentProject.references.map(ref => (
                  <div
                    key={ref.id}
                    className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-3 group hover:border-zinc-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {ref.category}
                        </span>
                        <h5 className="text-xs font-bold text-zinc-200">{ref.name}</h5>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium">
                        &ldquo;{ref.extractedDecision}&rdquo;
                      </p>
                      {ref.purpose && (
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          Propósito: {ref.purpose}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveReference(ref.id)}
                      className="text-zinc-400 hover:text-rose-400 p-1 rounded transition opacity-80 group-hover:opacity-100"
                      title="Remover referência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reference Search Generator & Curated Inspiration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Reference Search Generator (Module 7) */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Gerador de Busca de Referências
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Inglês
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Termos refinados em inglês para buscar fora do YouTube (Unsplash, Pinterest, ShotDeck, Midjourney e Google Imagens):
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Atmosfera
                </label>
                <input
                  type="text"
                  value={searchAtmosphere}
                  onChange={e => setSearchAtmosphere(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Linguagem Visual
                </label>
                <input
                  type="text"
                  value={searchVisualLang}
                  onChange={e => setSearchVisualLang(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {searchQueries.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleCopy(item.query)}
                      className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                    >
                      {copiedQuery === item.query ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs font-mono text-zinc-200 select-all bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                    {item.query}
                  </div>

                  <p className="text-[10px] text-zinc-400 italic">
                    {item.whySearchThis}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Presets */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-3xl">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-3">
              Inspirações Curadas (Clique para Adicionar)
            </span>
            <div className="space-y-2">
              {CURATED_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="w-full text-left p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-950 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate max-w-[280px]">
                      {preset.extractedDecision}
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
