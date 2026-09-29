# THUMBNAIL ANTI-SLOP — RADICAL SIMPLICITY

> Crie prompts de thumbnail que parecem dirigidos por uma pessoa — não por uma IA genérica.
> Menos efeitos, mais decisões. Subtrair antes de decorar.

---

## 💡 A Ideia do Produto

A complexidade existe **por trás**, no motor. Ela **não aparece** para o usuário.

Em aproximadamente 30 segundos, qualquer criador sem conhecimento técnico de fotografia consegue:
1. Colocar o título do vídeo.
2. Explicar a ideia como falaria com uma pessoa.
3. Jogar uma ou duas fotos de referência.
4. Clicar em **GERAR THUMBNAIL PROMPT**.
5. Copiar um prompt fotográfico pronto e de altíssimo nível.

---

## ⚡ Os 3 Modos da Interface

### 1. CRIAR (Modo Principal)
- **Título do Vídeo**: Âncora temática da miniatura.
- **O Que Você Imagina?**: Textarea conversacional. O criador fala naturalmente ("Eu no sofá segurando o Legion Go mostrando o novo sistema..."). O motor traduz a intenção em direção visual cinematográfica.
- **Texto na Thumbnail (Opcional)**: Preserva exatamente o texto sem poluir a imagem, alertando discretamente se passar de 4 palavras.
- **Referências Drag & Drop**: Suporte a múltiplas imagens com atribuição rápida de papéis:
  - `PESSOA`: Preserva identidade, proporções faciais, barba e textura real da pele (sem efeito de boneco de cera).
  - `PRODUTO`: Preserva geometria física real, botões, saídas de ar, portas e acabamento fosco (sem distorções de IA).
  - `ESTILO`: Extrai apenas iluminação e paleta de cores.
  - `COMPOSIÇÃO`: Extrai enquadramento e organização espacial.
- **Configurações Avançadas (Opcional & Fechado por Padrão)**:
  - Formato: 16:9 (YouTube) ou 9:16 (Shorts/Reels)
  - Estilo Visual: Cinematográfico, Editorial, Fotojornalismo, Natural
  - Nível de Realismo: Alto / Fotográfico Real ou Estilizado
  - Modelo Alvo: `GERAL`, `MIDJOURNEY`, `FLUX`, `GEMINI`, `OPENAI`
- **Resultado Direto**:
  - **DIREÇÃO (5 Decisões Concisas)**: Ideia, Foco, Composição, Expressão, Visual & Luz.
  - **PROMPT FINAL (English)**: Formatado para o modelo alvo, livre de clichês e com travas de preservação.
  - **GERAR OUTRA ABORDAGEM**: Cicla entre diferentes mecanismos visuais (Objeto Hero vs. Equilíbrio Narrativo vs. Tensão Documental).

---

### 2. MELHORAR PROMPT (Purificador Anti-Slop)
- O usuário cola um prompt poluído com clichês de IA (ex: *"Make an epic gaming thumbnail with neon lighting, dramatic glow, particles, excited man with open mouth holding controller..."*).
- O botão **REMOVER O SLOP** identifica e subtrai os exageros, substituindo-os por iluminação motivada crível, foco autêntico e texturas reais.
- Retorna:
  - **O QUE MUDEI**: Lista curta de 3 a 5 correções pedagógicas.
  - **PROMPT MELHORADO**: Prompt refinado pronto para copiar.

---

### 3. ANALISAR THUMBNAIL (Auditoria Óptica Ética)
- Upload de 1 miniatura (com título opcional).
- **Sem Notas Fictícias**: O sistema recusa formalmente dar pontuações numéricas, "CTR scores" ou "probabilidades de viralização".
- Retorna:
  - **O QUE ESTÁ FUNCIONANDO** (máx. 3 itens)
  - **O QUE ESTÁ DEIXANDO COM CARA DE IA** (máx. 3 itens)
  - **MAIOR PROBLEMA** (1 recomendação prioritária única)
  - **GERAR PROMPT PARA CORRIGIR**: Prompt corretivo de inpainting ou re-renderização focado em subtrair os artefatos.

---

## 🛡️ Salvaguardas Anti-Slop Integradas no Motor

O motor proíbe automaticamente em todos os prompts gerados:
- Expressões genéricas de choque, boca aberta em "O" e gritos caricatos de YouTube antigo.
- Iluminação neon azul e roxa sem motivação narrativa em cenas casuais ou de tecnologia.
- Efeito de pele plástica alisada (boneco de cera).
- Brilho difuso em excesso (*outer glow*) e *rim lights* impossíveis.
- Partículas, fagulhas e fogo gratuitos.
- Setas e círculos vermelhos sem função narrativa.
- Mãos deformadas e controles de videogame distorcidos.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js >= 18 (testado e validado em Node v26)
- npm ou pnpm

### Instalação
```bash
npm install
```

### Variáveis de Ambiente (Opcional)
Se desejar habilitar a visão multimodal do OpenAI GPT-4o no servidor, configure em `.env.local`:
```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_VISION_MODEL=gpt-4o
OPENAI_TEXT_MODEL=gpt-4o-mini
```
> **Nota**: Se `OPENAI_API_KEY` não for configurada, o motor local determinístico assume 100% da operação silenciosamente, sem falhas nem erros na interface.

### Execução Local
```bash
# Modo de desenvolvimento
npm run dev

# Compilação e execução de produção
npm run build
npm start
```
Acesse [http://localhost:3000](http://localhost:3000).

### Testes e Verificação
```bash
npm test            # 13 suítes de teste unitários e heurísticos
npx tsc --noEmit    # Verificação estática TypeScript (Zero erros)
npm run lint        # Verificação ESLint 9 (Zero avisos)
```

---

## 🔒 Armazenamento e Privacidade

- **100% Privado**: Imagens e ideias residem no navegador do usuário (`localStorage`).
- **Histórico Rápido**: O botão **Histórico** permite resgatar e copiar prompts recentes em 1 clique.
- **Zero Rastreamento**: Nenhuma telemetria ou envio de dados sem ação explícita do usuário.

---

## 📄 Licença

MIT
