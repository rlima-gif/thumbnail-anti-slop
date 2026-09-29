import {
  ProjectData,
  DeltaState,
  ComplexityState,
  SlopRiskState,
  ChecklistStatus
} from '@/types';
import { CHECKLIST_ITEMS } from '@/data/checklistItems';

const STOPWORDS_PT = new Set([
  'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'com', 'sem', 'sob', 'sobre', 'que', 'e', 'ou', 'um', 'uma', 'uns', 'umas',
  'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'como', 'porque', 'por que', 'qual', 'quando',
  'esse', 'essa', 'este', 'esta', 'isso', 'isto', 'aquele', 'aquela', 'aquilo', 'mais', 'menos',
  'muito', 'pouco', 'ja', 'já', 'ate', 'até', 'ao', 'aos', 'pelo', 'pela', 'pelos', 'pelas'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS_PT.has(w));
}

export interface TitleThumbnailDeltaResult {
  state: DeltaState;
  score: number; // 0-100
  oTituloConta: string;
  aThumbnailConta: string;
  possivelRedundancia: string;
  informacaoComplementar: string;
  perguntaCriada: string;
  repeatedTerms: string[];
}

export function calculateTitleThumbnailDelta(project: ProjectData): TitleThumbnailDeltaResult {
  const titleWords = extractKeywords(project.videoTitle);
  const thumbTextWords = extractKeywords(project.thumbnailText);
  const visualWords = extractKeywords(
    `${project.perceptionGoal} ${project.visualPromise} ${project.protagonist} ${project.viewerQuestion}`
  );

  const repeatedTerms = thumbTextWords.filter(w => titleWords.includes(w));
  const hasTextInThumb = project.thumbnailText.trim().length > 0;
  const thumbWordCount = thumbTextWords.length;

  let state: DeltaState = 'COMPLEMENTAR';
  let score = 85;

  if (hasTextInThumb && repeatedTerms.length >= Math.max(1, Math.min(2, thumbWordCount))) {
    state = 'REDUNDANTE';
    score = 30;
  } else if (hasTextInThumb && thumbWordCount > 5) {
    state = 'REDUNDANTE';
    score = 45;
  } else if (visualWords.length === 0 || (titleWords.length > 0 && visualWords.filter(w => titleWords.includes(w)).length === 0 && !project.viewerQuestion)) {
    state = 'DESCONECTADO';
    score = 40;
  } else {
    state = 'COMPLEMENTAR';
    score = 92;
  }

  const oTituloConta = project.videoTitle.trim()
    ? `Contextualiza o fato ou premissa: "${project.videoTitle}". ${project.titleExplains ? `Explica antecipadamente: ${project.titleExplains}` : ''}`
    : 'Título ainda não preenchido. Insira um título para analisar a complementaridade.';

  const aThumbnailConta = (project.thumbnailText.trim() ? `Texto visual: "${project.thumbnailText}". ` : 'Sem texto tipográfico na imagem (decisão forte). ') +
    (project.protagonist ? `Protagonista: ${project.protagonist}. ` : '') +
    (project.visualPromise ? `Promessa visual: ${project.visualPromise}.` : '');

  let possivelRedundancia = 'Nenhuma redundância detectada. Imagem e título ocupam funções cognitivas distintas.';
  if (repeatedTerms.length > 0) {
    possivelRedundancia = `Atenção: Os termos [${repeatedTerms.join(', ')}] estão duplicados entre título e miniatura. O texto da thumbnail poderia ser substituído por uma consequência ou removido.`;
  } else if (thumbWordCount >= 5) {
    possivelRedundancia = `Texto da miniatura com ${thumbWordCount} palavras. Excesso de tipografia concorre diretamente com o título na timeline mobile.`;
  }

  const informacaoComplementar = state === 'COMPLEMENTAR'
    ? 'Excelente divisão de trabalho: o título dá a âncora racional do vídeo enquanto a thumbnail entrega a reação emocional, o mistério ou a escala física.'
    : state === 'REDUNDANTE'
    ? 'Baixa complementaridade: o espectador lê a mesma mensagem duas vezes seguidas no feed sem receber nenhuma informação nova.'
    : 'Desconexão semântica: a imagem parece ilustrar um assunto não correlacionado com a promessa expressa no título.';

  const perguntaCriada = project.viewerQuestion.trim()
    ? project.viewerQuestion
    : 'Qual será o desfecho dessa situação? (Recomendado definir no Módulo 01)';

  return {
    state,
    score,
    oTituloConta,
    aThumbnailConta,
    possivelRedundancia,
    informacaoComplementar,
    perguntaCriada,
    repeatedTerms
  };
}

export interface ComplexityResult {
  state: ComplexityState;
  score: number; // 0-100
  label: string;
  reasons: string[];
}

export function calculateVisualComplexity(project: ProjectData): ComplexityResult {
  const reasons: string[] = [];
  let score = 20;

  // Protagonist presence
  if (project.protagonistPresence > 75) {
    score += 15;
    reasons.push(`Protagonista ocupa ${project.protagonistPresence}% do quadro (foco concentrado).`);
  } else if (project.protagonistPresence < 35) {
    score += 25;
    reasons.push(`Protagonista pequeno (${project.protagonistPresence}%), exigindo cenário com maior peso narrativo.`);
  } else {
    score += 10;
    reasons.push(`Presença do protagonista equilibrada (${project.protagonistPresence}%).`);
  }

  // Secondary subject
  if (project.secondarySubject.trim().length > 0) {
    score += 15;
    reasons.push(`Elemento secundário presente ("${project.secondarySubject}").`);
  }

  // Thumbnail text
  const textWords = project.thumbnailText.trim().split(/\s+/).filter(Boolean).length;
  if (textWords === 0) {
    score -= 10;
    reasons.push('Zero texto na thumbnail (reduz drasticamente a carga cognitiva).');
  } else if (textWords <= 3) {
    score += 10;
    reasons.push(`Texto curto e direto (${textWords} palavras).`);
  } else {
    score += 25;
    reasons.push(`Texto longo (${textWords} palavras) aumentando a densidade de leitura.`);
  }

  // Diagnostic conditions
  const diag = project.diagnosticState;
  if (diag.manyFocalPoints) { score += 20; reasons.push('Múltiplos pontos focais concorrentes.'); }
  if (diag.excessiveText) { score += 15; reasons.push('Carga de texto acima do limite recomendado.'); }
  if (diag.artificialGlow) { score += 15; reasons.push('Glow artificial ativo em múltiplos elementos.'); }
  if (diag.excessiveSaturation) { score += 15; reasons.push('Saturação global elevada dividindo a atenção.'); }
  if (diag.backgroundTooDetailed) { score += 20; reasons.push('Fundo excessivamente detalhado competindo com sujeito.'); }
  if (diag.disconnectedElements) { score += 20; reasons.push('Elementos desconexos sem ancoragem física na cena.'); }
  if (diag.floatingLogos) { score += 15; reasons.push('Logotipos flutuantes gerando poluição periférica.'); }

  // Clamp score
  score = Math.max(10, Math.min(100, score));

  let state: ComplexityState = 'BALANCED';
  let label = 'Equilibrada';

  if (score <= 30) {
    state = 'LOW';
    label = 'Baixa (Minimalista & Direta)';
  } else if (score <= 60) {
    state = 'BALANCED';
    label = 'Equilibrada (Ideal para Feed)';
  } else if (score <= 80) {
    state = 'BUSY';
    label = 'Densa / Carregada (Atenção ao Mobile)';
  } else {
    state = 'SLOP RISK';
    label = 'Risco de Ruído / Poluição Visual';
  }

  return { state, score, label, reasons };
}

export interface SlopRiskResult {
  state: SlopRiskState;
  score: number; // 0-100
  triggers: string[];
  recommendations: string[];
}

export function calculateAiSlopRisk(project: ProjectData): SlopRiskResult {
  const triggers: string[] = [];
  const recommendations: string[] = [];
  const diag = project.diagnosticState;
  const avoidListLower = project.avoidList.map(a => a.toLowerCase());

  let riskPoints = 10;

  if (diag.artificialGlow) {
    riskPoints += 25;
    triggers.push('Brilhos e halos difusos (outer glow) em torno de objetos.');
    recommendations.push('Substitua por iluminação de borda motivada com fonte física visível.');
  }

  if (diag.unmotivatedLight) {
    riskPoints += 20;
    triggers.push('Luz mágica sem fonte física correspondente no ambiente.');
    recommendations.push('Defina no Módulo 03 uma fonte de luz concreta (ex: monitor, janela, abajur).');
  }

  if (diag.genericReaction) {
    riskPoints += 25;
    triggers.push('Expressão de choque forçada / boca aberta sem contexto.');
    recommendations.push('Substitua por expressão sutil e contextual (curiosidade, tensão contida, olhar analítico).');
  }

  if (diag.backgroundTooDetailed) {
    riskPoints += 15;
    triggers.push('Fundo uniformemente nítido sem atenuação óptica f/1.8.');
    recommendations.push('Adicione desfoque de profundidade de campo ou atenue contraste do fundo.');
  }

  if (diag.floatingLogos) {
    riskPoints += 15;
    triggers.push('Logotipos e ícones flutuando sem gravidade.');
    recommendations.push('Integre o elemento fisicamente (estampado em um produto ou na tela de um dispositivo).');
  }

  if (diag.excessiveSaturation) {
    riskPoints += 15;
    triggers.push('Saturação global irrealista (estética de template genérico).');
    recommendations.push('Trabalhe com paleta restrita (tons neutros no fundo, uma cor de acento no ponto focal).');
  }

  // Check if Avoid list covers common slop
  const criticalAvoids = [
    'expressão de choque genérica',
    'rim light impossível',
    'pele plástica',
    'neon roxo + azul automático',
    'partículas gratuitas'
  ];

  const coveredCount = criticalAvoids.filter(c =>
    avoidListLower.some(a => a.includes(c) || c.includes(a))
  ).length;

  if (coveredCount >= 4) {
    riskPoints = Math.max(5, riskPoints - 20);
    recommendations.push('Excelente: A lista EVITAR contém as salvaguardas essenciais contra estética preguiçosa de IA.');
  } else if (coveredCount <= 1) {
    riskPoints += 15;
    triggers.push('Poucas salvaguardas ativas na lista EVITAR.');
    recommendations.push('Adicione mais itens do Catálogo Anti-Slop (Módulo 04) para blindar o prompt.');
  }

  riskPoints = Math.max(5, Math.min(100, riskPoints));

  let state: SlopRiskState = 'BAIXO';
  if (riskPoints >= 65) {
    state = 'ALTO';
  } else if (riskPoints >= 35) {
    state = 'ATENÇÃO';
  } else {
    state = 'BAIXO';
  }

  return { state, score: riskPoints, triggers, recommendations };
}

export interface PromptWarning {
  id: string;
  title: string;
  severity: 'warning' | 'critical' | 'info';
  message: string;
  fixHint: string;
}

export function runPromptConsistencyCheck(project: ProjectData): PromptWarning[] {
  const warnings: PromptWarning[] = [];

  // 1. MUITOS PROTAGONISTAS
  if (project.secondarySubject.trim().length > 0 && project.protagonistPresence > 70) {
    warnings.push({
      id: 'warn-protagonists',
      title: 'MUITOS PROTAGONISTAS',
      severity: 'warning',
      message: 'Você tem um protagonista com 70%+ de presença e ao mesmo tempo um elemento secundário disputando espaço.',
      fixHint: 'Reduza a presença do protagonista para 50-60% ou transforme o secundário em objeto subordinado no fundo.'
    });
  }

  // 2. TEXTO DEMAIS
  const words = project.thumbnailText.trim().split(/\s+/).filter(Boolean);
  if (words.length > 4) {
    warnings.push({
      id: 'warn-excess-text',
      title: 'TEXTO DEMAIS',
      severity: 'critical',
      message: `A thumbnail contém ${words.length} palavras ("${project.thumbnailText}"). No celular, o texto disputará atenção com o título.`,
      fixHint: 'Corte para no máximo 2 a 3 palavras impactantes ou remova totalmente o texto se a imagem se sustentar.'
    });
  }

  // 3. TÍTULO E THUMBNAIL REDUNDANTES
  const delta = calculateTitleThumbnailDelta(project);
  if (delta.state === 'REDUNDANTE' && delta.repeatedTerms.length > 0) {
    warnings.push({
      id: 'warn-redundant-title',
      title: 'TÍTULO E THUMBNAIL REDUNDANTES',
      severity: 'critical',
      message: `Palavras repetidas entre título e thumbnail: ${delta.repeatedTerms.join(', ')}.`,
      fixHint: 'Faça a thumbnail mostrar a reação ou a causa oculta, enquanto o título entrega o tópico factual.'
    });
  }

  // 4. EFEITOS DEMAIS
  const diag = project.diagnosticState;
  const activeEffectsCount = [
    diag.artificialGlow,
    diag.excessiveSaturation,
    diag.floatingLogos,
    diag.unmotivatedLight
  ].filter(Boolean).length;

  if (activeEffectsCount >= 2) {
    warnings.push({
      id: 'warn-too-many-effects',
      title: 'EFEITOS DEMAIS',
      severity: 'critical',
      message: 'Foram identificados múltiplos artifícios visuais artificiais (glow, saturação, luz mágica).',
      fixHint: 'Subtraia antes de decorar. Escolha apenas uma fonte de luz direcional autêntica.'
    });
  }

  // 5. MUITAS CORES DOMINANTES
  const paletteWords = project.palette.toLowerCase();
  const colorMatches = ['azul', 'vermelho', 'verde', 'amarelo', 'roxo', 'laranja', 'rosa', 'ciano'].filter(c =>
    paletteWords.includes(c)
  );
  if (colorMatches.length >= 3) {
    warnings.push({
      id: 'warn-too-many-colors',
      title: 'MUITAS CORES DOMINANTES',
      severity: 'warning',
      message: `Sua paleta menciona ${colorMatches.length} cores vibrantes distintas (${colorMatches.join(', ')}).`,
      fixHint: 'Adote a regra de 2 cores complementares neutras e no máximo 1 cor de acento para o ponto de curiosidade.'
    });
  }

  // 6. MUITOS ELEMENTOS SECUNDÁRIOS
  if (project.secondarySubject.includes(',') || project.secondarySubject.includes(' e ') || project.secondarySubject.includes('+')) {
    warnings.push({
      id: 'warn-multiple-secondary',
      title: 'MUITOS ELEMENTOS SECUNDÁRIOS',
      severity: 'warning',
      message: 'O campo elemento secundário lista múltiplos itens simultâneos.',
      fixHint: 'Escolha um único objeto narrativo para ancorar o conflito.'
    });
  }

  // 7. RISCO DE FUNDO COMPETINDO
  if (project.depth.toLowerCase().includes('nítido') && project.background.toLowerCase().includes('detalhe')) {
    warnings.push({
      id: 'warn-competing-background',
      title: 'RISCO DE FUNDO COMPETINDO',
      severity: 'warning',
      message: 'O fundo está configurado com alta nitidez e muitos detalhes, o que camuflará o protagonista.',
      fixHint: 'Especifique separação óptica gradual natural ou diminua a exposição do cenário em relação ao sujeito.'
    });
  }

  // 8. EXPRESSÃO GENÉRICA
  const expr = project.expression.toLowerCase();
  if (expr.includes('choque') || expr.includes('boca aberta') || expr.includes('arregalado') || expr.includes('gritando')) {
    warnings.push({
      id: 'warn-generic-expression',
      title: 'EXPRESSÃO GENÉRICA',
      severity: 'critical',
      message: 'A descrição da expressão remete aos clichês descartáveis de "careta de choque" do YouTube de 2018.',
      fixHint: 'Troque por uma expressão humana com nuances: tensão sutil, sobrancelhas franzidas em dúvida genuína ou fascínio.'
    });
  }

  // 9. LUZ SEM FONTE DEFINIDA
  const light = project.lighting.toLowerCase();
  if (light.length < 10 || light.includes('cinematic') && !light.includes('luz') && !light.includes('sol') && !light.includes('janela') && !light.includes('softbox') && !light.includes('lâmpada')) {
    warnings.push({
      id: 'warn-undefined-light',
      title: 'LUZ SEM FONTE DEFINIDA',
      severity: 'info',
      message: 'A iluminação não cita de onde vem a luz física da cena.',
      fixHint: 'Nomeie a fonte motivada: janela lateral, sol de fim de tarde, luz de tela de monitor ou lâmpada zenital.'
    });
  }

  return warnings;
}

export function evaluateChecklistStatus(checklistState: Record<string, boolean>): {
  status: ChecklistStatus;
  completed: number;
  total: number;
  percentage: number;
} {
  const total = CHECKLIST_ITEMS.length;
  const completed = CHECKLIST_ITEMS.filter(item => checklistState[item.id]).length;
  const percentage = Math.round((completed / total) * 100);

  let status: ChecklistStatus = 'AINDA CONFUSA';
  if (percentage >= 90) {
    status = 'DIREÇÃO CONSISTENTE';
  } else if (percentage >= 70) {
    status = 'FORTE';
  } else if (percentage >= 45) {
    status = 'FUNCIONA';
  } else {
    status = 'AINDA CONFUSA';
  }

  return { status, completed, total, percentage };
}

export interface CritiqueFeedback {
  oQueFunciona: string[];
  oQueCompete: string[];
  oQuePareceIa: string[];
  oQuePodeSerRemovido: string[];
  oQueDeveSerAmpliado: string[];
  titleThumbnail: string;
  alteracaoDeMaiorImpacto: string;
}

export function generateCritiqueFeedback(project: ProjectData): CritiqueFeedback {
  const diag = project.diagnosticState;
  const delta = calculateTitleThumbnailDelta(project);
  const complexity = calculateVisualComplexity(project);
  const slop = calculateAiSlopRisk(project);

  const oQueFunciona: string[] = [];
  const oQueCompete: string[] = [];
  const oQuePareceIa: string[] = [];
  const oQuePodeSerRemovido: string[] = [];
  const oQueDeveSerAmpliado: string[] = [];

  // O que funciona
  if (project.protagonist.trim()) {
    oQueFunciona.push(`Protagonista com papel declarado: "${project.protagonist}".`);
  }
  if (slop.state === 'BAIXO') {
    oQueFunciona.push('Risco de AI Slop baixo: sem artefatos plásticos ou desvios de render evidentes.');
  }
  if (!diag.manyFocalPoints) {
    oQueFunciona.push('Hierarquia de ponto focal singular preservada.');
  }
  if (project.activeModes.length > 0) {
    oQueFunciona.push(`Modo especializado ativo (${project.activeModes.join(', ')}), garantindo salvaguardas de nicho.`);
  }
  if (!diag.artificialGlow && !diag.unmotivatedLight) {
    oQueFunciona.push('Iluminação contida sem brilhos fantasma espalhados.');
  }

  // O que compete
  if (diag.manyFocalPoints) {
    oQueCompete.push('Múltiplos centros de atenção disputando a visão periférica do usuário.');
  }
  if (diag.backgroundTooDetailed) {
    oQueCompete.push('O cenário de fundo possui nitidez e contraste excessivos, engolindo a silhueta principal.');
  }
  if (diag.excessiveText) {
    oQueCompete.push('O bloco de texto da thumbnail está competindo com o rosto ou objeto principal.');
  }
  if (diag.floatingLogos) {
    oQueCompete.push('Logotipos avulsos flutuando nos cantos dispersam o foco.');
  }

  // O que parece IA
  if (diag.artificialGlow) {
    oQuePareceIa.push('Glow artificial e contornos difusos sem justificativa física.');
  }
  if (diag.unmotivatedLight) {
    oQuePareceIa.push('Iluminação mágica dramática sem fonte luminosa correspondente.');
  }
  if (diag.genericReaction) {
    oQuePareceIa.push('Expressão de choque sem nuance, típica de geradores sem direção humana.');
  }
  if (diag.excessiveSaturation) {
    oQuePareceIa.push('Cores com saturação máxima homogênea e aparência de plástico.');
  }

  // O que pode ser removido
  if (project.thumbnailText.split(/\s+/).filter(Boolean).length > 3) {
    oQuePodeSerRemovido.push('Reduzir ou eliminar o texto da miniatura — deixe a cena criar a curiosidade.');
  }
  if (diag.floatingLogos) {
    oQuePodeSerRemovido.push('Remover marcas e ícones flutuantes decorativos.');
  }
  if (diag.artificialGlow) {
    oQuePodeSerRemovido.push('Eliminar o efeito outer glow das camadas de texto e recorte.');
  }

  // O que deve ser ampliado
  if (project.protagonistPresence < 40 && project.protagonistType !== 'Cena') {
    oQueDeveSerAmpliado.push('Aumentar a presença do protagonista no enquadramento para garantir reconhecimento em tela de 120px.');
  }
  if (!project.viewerQuestion) {
    oQueDeveSerAmpliado.push('Clarificar a pergunta silenciosa da cena (o que o espectador precisa descobrir ao clicar).');
  }
  oQueDeveSerAmpliado.push('Ampliar o espaço negativo ao redor do elemento mais importante para gerar respiro e autoridade editorial.');

  // Default fallbacks if clean
  if (oQueCompete.length === 0) {
    oQueCompete.push('Nenhum elemento concorrente grave detectado. Composição limpa.');
  }
  if (oQuePareceIa.length === 0) {
    oQuePareceIa.push('Livre dos principais gatilhos visuais de IA preguiçosa.');
  }
  if (oQuePodeSerRemovido.length === 0) {
    oQuePodeSerRemovido.push('Nenhum excesso evidente para remover no momento.');
  }

  // Major impact action
  let alteracaoDeMaiorImpacto = 'Mantenha a direção atual e teste a legibilidade a 10% no celular antes de finalizar.';
  if (delta.state === 'REDUNDANTE') {
    alteracaoDeMaiorImpacto = 'Elimine a repetição de texto entre título e thumbnail: faça a imagem focar no mistério e deixe o título dar o contexto factual.';
  } else if (diag.manyFocalPoints) {
    alteracaoDeMaiorImpacto = 'Reduza para exatamente UM foco primário: escureça ou desfoque todos os outros elementos secundários.';
  } else if (diag.artificialGlow || diag.unmotivatedLight) {
    alteracaoDeMaiorImpacto = 'Desative o glow artificial e especifique uma fonte de luz motivada única (janela, monitor ou softbox direcional).';
  } else if (complexity.state === 'SLOP RISK') {
    alteracaoDeMaiorImpacto = 'Subtraia antes de decorar: remova pelo menos 2 elementos secundários e 1 efeito de pós-processamento.';
  }

  return {
    oQueFunciona,
    oQueCompete,
    oQuePareceIa,
    oQuePodeSerRemovido,
    oQueDeveSerAmpliado,
    titleThumbnail: delta.informacaoComplementar,
    alteracaoDeMaiorImpacto
  };
}
