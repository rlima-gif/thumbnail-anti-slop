# THUMBNAIL ANTI-SLOP — V2 HYBRID LOCAL-FIRST & MULTIMODAL AI

> Direção visual para thumbnails que parecem dirigidas por uma pessoa — não montadas automaticamente por IA. Menos efeitos, mais decisões.

---

## 🌟 O Que Há de Novo na Versão 2

O **Thumbnail Anti-Slop V2** evolui de uma ferramenta estritamente client-side para uma **arquitetura híbrida de alto nível**:
1. **Totalmente Funcional Offline**: Continua operando 100% no navegador via localStorage sem qualquer dependência de chaves de API.
2. **Visão Multimodal Real no Servidor**: Quando configurado com `OPENAI_API_KEY`, adiciona visão computacional profunda com detecção de evidências físicas visíveis, interpretações artísticas e níveis explícitos de incerteza (`CONFIDENT`, `LIKELY`, `UNCERTAIN`).
3. **Sem Simulações Fake**: Quando a IA não estiver configurada, o sistema **NUNCA** gera dados ou palpites inventados. O usuário é informado de forma transparente sobre como configurar suas chaves no servidor.
4. **Mandato Ético Rigoroso**: O sistema **NUNCA gera previsões artificiais de CTR** ou notas milagrosas de algoritmo. Correlação não é causalidade.
5. **Travas de Preservação (11 Reference Locks)**: Bloqueio estrito de geometria industrial, fisionomia real, proporções e acabamentos nos prompts de geração.
6. **Simulador de Feed em Contexto**: Visualização em 4 contextos reais do YouTube (Mobile Home, Desktop Home, Busca e Barra Lateral) com alternância entre temas Claro e Escuro.
7. **Diário de Experimentos & DNA do Canal**: Registro científico de hipóteses isoladas com variáveis primárias e secundárias, pronto para correlação com o YouTube Studio.

---

## 📦 Módulos do Sistema

1. **00 — Ideia**: Manifesto de direção e comparativo visual interativo (Slop vs Clicável vs Excelente).
2. **01 — Clique**: 4 perguntas fundamentais de planejamento e heurística *Title × Thumbnail Delta* (Redundante, Complementar, Desconectado).
3. **02 — Referências & Preservation Locks**: Atribuição de papéis específicos às referências (`SUJEITO`, `PALETA`, `ILUMINAÇÃO`, `COMPOSIÇÃO`, `LENTE / DISTORÇÃO`, `TEXTURA`, `PRODUTO / HARDWARE`, `ESTILO DO CANAL`) e painel com 11 travas físicas de preservação não-negociáveis.
4. **03 — Direção Fotográfica**: Formulário fotográfico estruturado (lente, luz motivada, paleta, profundidade, enquadramento), slider de Presença do Protagonista (10%–90%), salvaguardas de Fidelidade de Hardware e Rosto Real, além de assistente "Sugerir Direção com IA" com revisão de proposta diff antes da aplicação.
5. **04 — Anti-Slop**: Catálogo pesquisável com 29 vícios visuais de IA/Photoshop com ação "Adicionar ao EVITAR", além de guia educativo dos 16 artefatos de IA.
6. **05 — Anatomia**: Gramática de atenção, ordem de leitura humana (Assunto 0-250ms → Conflito 250-600ms → Contexto 600-1000ms) e visualizador de camadas em 16:9.
7. **06 — Laboratório Óptico**:
   - **Diagnóstico Local**: Escala 10% Mobile, Desfoque progressivo (Squint Test a `blur(16px)`), Mapa de Ênfase Estimada, Silhueta P&B, Escala de cinza, Teste de 1 Segundo de Exposição e Safe Zones 16:9.
   - **Simulador de Feed**: Mobile Home, Desktop Home, Resultados de Busca e Vídeos Relacionados (Dark/Light Mode) cercado por concorrentes neutros.
   - **Visão Multimodal com IA**: Análise estruturada de hierarquia, leitura mobile, separação sujeito-fundo, naturalidade facial, coerência de iluminação, e regiões com bounding boxes interativos, distinguindo evidência física visível de interpretação.
   - **Comparativo A × B Multimodal**: Upload e análise comparativa de 2 miniaturas frente a frente revelando hipóteses implícitas e riscos competitivos.
   - **Patch Prompt Generator**: Aplicação de correções de alto impacto ("Uma alteração de maior impacto") com cópia de prompt corretivo para Midjourney/FLUX/Imagen.
8. **07 — Checklist Anti-Slop**: 21 critérios de direção de arte persistentes avaliados em 4 estados: *Ainda Confusa*, *Funciona*, *Forte* e *Direção Consistente*.
9. **08 — Gerador de Prompts Art-Directed**: Construtor estruturado em 17 blocos em inglês com travas de preservação, salvaguardas de consistência, assistente "Refinar com IA" com visualizador de diff antes/depois, e histórico com restauração de versões.
10. **09 — Teste A/B Hipóteses Conceituais**: Gerador de 3 hipóteses conceituais estruturalmente distintas (**A — Personagem**, **B — Objeto**, **C — Situação**) com detector de diversidade para evitar variações estéticas superficiais da mesma ideia.
11. **10 — YouTube Channel DNA & Diário de Experimentos**: Registro de hipóteses científicas, documentação de variáveis isoladas, logs de desempenho e arquitetura OAuth 2.0 (`youtube.readonly`, `yt-analytics.readonly`, `youtube.force-ssl`).
12. **Glossário**: 33 termos essenciais de direção visual com impacto prático em thumbnails.

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js >= 18 (testado e validado em Node v26)
- npm ou pnpm

### Instalação das Dependências
```bash
npm install
```

### Configuração de Variáveis de Ambiente (Opcional)

Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Configurações disponíveis:
```env
# Provedor de Visão Multimodal e Refinamento de Texto (Opcional)
OPENAI_API_KEY=sua_chave_aqui
OPENAI_VISION_MODEL=gpt-4o
OPENAI_TEXT_MODEL=gpt-4o-mini

# Google / YouTube Data API (Opcional - para sincronização com canal)
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Nota de Segurança**: Chaves de API ficam estritamente no servidor (Node.js API routes em `src/app/api/`). Nenhuma credencial é exposta no bundle client-side. Se nenhuma chave for fornecida, o aplicativo funcionará perfeitamente em modo local sem gerar erros.

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

### Testes e Verificação de Qualidade
```bash
# Executar bateria de 11 suítes de testes unitários e heurísticos
node tests/run-tests.mjs

# Verificação estática de tipos TypeScript (Zero erros tolerados)
npx tsc --noEmit

# Verificação de linting ESLint
npm run lint
```

---

## 🏛️ Arquitetura de Software

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analyze-thumbnail/route.ts  # Endpoint de visão multimodal
│   │   │   ├── compare-thumbnails/route.ts # Endpoint de comparação A/B multimodal
│   │   │   ├── refine-prompt/route.ts      # Endpoint de refinamento de prompt
│   │   │   ├── status/route.ts             # Status de configuração de IA
│   │   │   └── suggest-direction/route.ts  # Endpoint de sugestão de direção
│   │   └── youtube/
│   │       └── status/route.ts             # Status da conexão OAuth YouTube
│   ├── globals.css                         # Tema editorial dark e regras utilitárias
│   ├── layout.tsx                          # Metadados e fontes
│   └── page.tsx                            # Composição da experiência SPA unificada
├── components/
│   ├── layout/
│   │   ├── Header.tsx                      # Gestão de projetos, export/import JSON
│   │   ├── ChapterNav.tsx                  # Navegação com scroll-spy para os 11 módulos
│   │   └── WorkflowLoop.tsx                # Visualizador do loop redutivo
│   └── modules/                            # Módulos isolados 00 a 10 + Glossário
│       ├── 06_Laboratorio/
│       │   ├── ABCompareModal.tsx          # Comparativo multimodal A/B
│       │   ├── AIAnalysisPanel.tsx         # Análise de visão, regiões e incerteza
│       │   ├── FeedSimulator.tsx           # Simulador de feed em 4 contextos
│       │   └── TextDensityWidget.tsx       # Classificador de densidade de texto
│       └── 10_ChannelDNA/
│           └── ChannelDNAModule.tsx        # Diário de experimentos e YouTube DNA
├── context/
│   └── ProjectContext.tsx                  # Estado global, histórico de prompts e migração V2
├── data/                                   # Catálogo anti-slop, anatomia, checklist, glossário
├── lib/
│   ├── ai/                                 # Abstração de provedor, prompts de sistema e OpenAI
│   ├── image-gen/                          # Provedor de imagem abstrato
│   ├── heuristics.ts                       # Heurísticas de complexidade, delta e risco
│   ├── promptGenerator.ts                  # Construtor de 17 blocos + preservation locks
│   ├── abGenerator.ts                      # 3 hipóteses conceituais + teste de diversidade
│   ├── storage.ts                          # Persistência local e migração de schema (V1 -> V2)
│   └── youtube/                            # Abstração de serviço YouTube Data API
└── types/
    └── index.ts                            # Tipagem canônica TypeScript do ecossistema V2
```

---

## 🔒 Princípios de Privacidade e Armazenamento

- **Persistência Local-First**: Todos os projetos, referências e experimentos residem no `localStorage` do seu navegador.
- **Migração Não-Destrutiva**: Projetos salvos na versão 1 são automaticamente migrados para a versão 2 sem perda de nenhum dado histórico (`schemaVersion: 2`).
- **Privacidade de Imagens**: O upload para testes ópticos locais processa dados no próprio navegador do usuário (`data:image/*`). Chamadas de IA multimodal só ocorrem se o usuário clicar deliberadamente no botão de análise após configurar sua chave no servidor.

---

## ⚖️ Mandato Ético e Científico

Este software recusa a estética do clique descartável e a promessa ilusória de "adivinhar o algoritmo".

1. **Anti-Predição**: Nenhuma IA pode prever com precisão o CTR antes da publicação porque o algoritmo do YouTube avalia o comportamento humano em tempo real em função do contexto cultural, relevância do tema e retenção do vídeo.
2. **Direção Humana com Ferramentas Claras**: O papel da inteligência artificial no *Thumbnail Anti-Slop* é atuar como um auditor técnico implacável de contraste, luz, legibilidade e naturalidade, devolvendo o controle criativo ao diretor de arte.

---

## 📄 Licença

MIT
