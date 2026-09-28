# THUMBNAIL ANTI-SLOP

> Direção visual para thumbnails que parecem dirigidas por uma pessoa — não montadas automaticamente por IA. Menos efeitos, mais decisões.

## Visão Geral

O **Thumbnail Anti-Slop** é uma aplicação web interativa desenvolvida para ensinar, direcionar e auditar a criação de miniaturas do YouTube com rigor cinematográfico e editorial.

Baseia-se no princípio:
> *"IA ruim acontece quando a IA precisa tomar decisões que o diretor deveria ter tomado."*
> *"Thumbnail excelente não tem mais efeitos. Tem mais decisões."*
> *"Subtrair antes de decorar."*

---

## Módulos do Sistema

1. **00 — Ideia**: Manifesto de direção e comparativo visual interativo (Slop vs Clicável vs Excelente).
2. **01 — Clique**: 4 perguntas fundamentais de planejamento e heurística *Title × Thumbnail Delta* (Redundante, Complementar, Desconectado).
3. **02 — Referências**: Extração de decisões fotográficas de cinema/editorial e gerador de buscas em inglês fora do loop do YouTube.
4. **03 — Direção**: Formulário fotográfico estruturado (lente, luz motivada, paleta, profundidade, enquadramento), slider de Presença do Protagonista (10%–90%) e Modos Especializados (Sem Texto, Rosto Real, Gaming Subtrativo, Tech, Antes/Depois).
5. **04 — Anti-Slop**: Catálogo pesquisável com 29 vícios visuais de IA/Photoshop com ação "Adicionar ao EVITAR", além de guia educativo dos 16 artefatos de IA.
6. **05 — Anatomia**: Gramática de atenção, ordem de leitura humana (Assunto 0-250ms → Conflito 250-600ms → Contexto 600-1000ms) e visualizador de camadas em 16:9.
7. **06 — Laboratório**: Ferramentas de estresse óptico client-side (Escala 10% Mobile, Desfoque progressivo, Silhueta preto & branco, Escala de cinza, Teste de 1 Segundo de Exposição com reflexão), Sobreposições de Zonas Seguras (Safe Zones 16:9) e workspace de diagnóstico com heurísticas de Complexidade Visual e Risco de AI Slop.
8. **07 — Checklist**: 21 critérios de direção de arte persistentes avaliados em 4 estados: *Ainda Confusa*, *Funciona*, *Forte* e *Direção Consistente*.
9. **08 — Gerador**: Síntese intermediária (*Decidir Primeiro, Promptar Depois*) e construtor de prompts em inglês estruturados em 17 blocos, com salvaguardas de consistência e exportação de negative direction.
10. **09 — A/B Test**: Gerador de 3 hipóteses conceituais estruturalmente distintas: **A — Personagem**, **B — Objeto**, **C — Situação**, com prompts independentes.
11. **Glossário**: 33 termos essenciais de direção visual com impacto prático em thumbnails.

---

## Instalação e Execução

### Pré-requisitos

- Node.js >= 18 (testado em Node v26)
- npm ou pnpm

### Instalação

```bash
npm install
```

### Modo de Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Compilação de Produção

```bash
npm run build
npm run start
```

### Testes e Validação

```bash
# Executar bateria de testes unitários e heurísticos
npm test

# Verificação estática de tipos TypeScript
npx tsc --noEmit

# Verificação de linting (ESLint)
npm run lint
```

---

## Arquitetura de Software

```
src/
├── app/
│   ├── globals.css           # Tema editorial dark, variáveis CSS e tipografia
│   ├── layout.tsx            # Estrutura raiz e metadados PT-BR
│   └── page.tsx              # Ponto de entrada do SPA, integrando os 10 módulos
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Gerenciamento de projetos (Novo, Duplicar, JSON)
│   │   ├── ChapterNav.tsx    # Navegação sticky com scroll spy
│   │   └── WorkflowLoop.tsx  # Visualizador do loop redutivo de direção
│   └── modules/              # Componentes isolados para cada capítulo (00 a 09 + Glossário)
├── context/
│   └── ProjectContext.tsx    # Estado global reativo e sincronização com localStorage
├── data/
│   ├── antiSlopCatalog.ts    # 29 problemas visuais detalhados
│   ├── aiArtifactSignals.ts  # 16 sinais de artefatos de IA
│   ├── anatomyConcepts.ts    # Conceitos anatômicos e ordem de leitura
│   ├── checklistItems.ts     # 21 itens do checklist
│   ├── defaultProject.ts     # Projeto modelo documental inicial
│   └── glossary.ts           # 33 termos técnicos explicados
├── lib/
│   ├── abGenerator.ts        # Gerador de 3 hipóteses conceituais A/B
│   ├── heuristics.ts         # Heurísticas de Delta, Complexidade e Risco
│   ├── promptGenerator.ts    # Construtor de prompt em 17 blocos e negative prompt
│   ├── referenceSearchGenerator.ts # Gerador de buscas externas em inglês
│   └── storage.ts            # Camada de persistência local e import/export JSON
└── types/
    └── index.ts              # Definições completas de tipos TypeScript
```

---

## Persistência de Dados e Privacidade

- **100% Client-Side**: Nenhum dado é enviado para servidores externos.
- **LocalStorage**: Múltiplos projetos persistem no navegador do usuário.
- **Exportação e Importação**: Projetos podem ser baixados e restaurados como arquivos `.json`.
- **Privacidade de Imagens**: O upload de imagens no Laboratório utiliza `FileReader` em memória local (`data:image/*`), sem telemetria nem transmissão remota.

---

## Limitações Atuais & Ponto de Integração Futura com IA

### Limitações Atuais:
- As análises do Laboratório utilizam heurísticas determinísticas transparentes e marcação diagnóstica manual pelo usuário, sem visão computacional baseada em modelo neural integrado.
- A geração de imagens não executa uma API remota diretamente; ela entrega o prompt otimizado e formatado para ser colado em geradores como Midjourney, FLUX, Stable Diffusion ou Gemini Imagen.

### Ponto de Integração para Camada IA Futura:
- `src/lib/heuristics.ts`: A função `generateCritiqueFeedback` foi desenhada de forma modular. Pode receber um endpoint de visão multimodal (ex: Gemini 1.5 Pro / Flash via SDK `@google/genai`) para substituir ou enriquecer as condições manuais com análise visual automática.
- `src/lib/promptGenerator.ts`: A saída estruturada pode ser enviada diretamente a um webhook ou worker de geração assíncrona.

---

## Licença

MIT
