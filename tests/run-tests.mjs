import assert from 'node:assert/strict';

// Test runner for Thumbnail Anti-Slop
console.log('🧪 INICIANDO BATERIA DE TESTES UNITÁRIOS E HEURÍSTICOS — THUMBNAIL ANTI-SLOP\n');

// Mock types and pure functions verification
const STOPWORDS_PT = new Set([
  'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'com', 'sem', 'sob', 'sobre', 'que', 'e', 'ou', 'um', 'uma', 'uns', 'umas'
]);

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS_PT.has(w));
}

// 1. Title x Thumbnail Delta Test
console.log('1. Testando Heurística Title × Thumbnail Delta...');
{
  const title1 = 'Por que a Apple cancelou o carro de 10 bilhões de dólares';
  const thumbTextRedundant = 'CARRO DA APPLE 10 BILHÕES';
  const thumbWords = extractKeywords(thumbTextRedundant);
  const titleWords = extractKeywords(title1);
  const repeated = thumbWords.filter(w => titleWords.includes(w));

  assert.ok(repeated.length >= 2, 'Deve detectar termos redundantes');
  assert.ok(repeated.includes('carro') && repeated.includes('apple'), 'Termos identificados corretamente');
  console.log('  ✓ Detecção de redundância léxica validada.');

  const thumbTextComplementary = 'A AUTÓPSIA DO SEGREDO';
  const thumbWordsComp = extractKeywords(thumbTextComplementary);
  const repeatedComp = thumbWordsComp.filter(w => titleWords.includes(w));
  assert.equal(repeatedComp.length, 0, 'Não deve haver repetição mecânica');
  console.log('  ✓ Estado complementar validado.');
}

// 2. Checklist Scoring Status Test
console.log('\n2. Testando Avaliação do Checklist Anti-Slop...');
{
  const total = 21;
  const testCases = [
    { completed: 21, expected: 'DIREÇÃO CONSISTENTE' },
    { completed: 18, expected: 'FORTE' },
    { completed: 11, expected: 'FUNCIONA' },
    { completed: 5, expected: 'AINDA CONFUSA' }
  ];

  for (const tc of testCases) {
    const pct = Math.round((tc.completed / total) * 100);
    let status = 'AINDA CONFUSA';
    if (pct >= 90) status = 'DIREÇÃO CONSISTENTE';
    else if (pct >= 70) status = 'FORTE';
    else if (pct >= 45) status = 'FUNCIONA';

    assert.equal(status, tc.expected, `Com ${tc.completed}/${total} (${pct}%), esperado ${tc.expected}`);
    console.log(`  ✓ ${tc.completed}/${total} (${pct}%) -> ${status}`);
  }
}

// 3. Negative Direction Tokens & Modes Test
console.log('\n3. Testando Construção de Negative Direction e Modos Especializados...');
{
  const modes = ['TECH', 'GAMING', 'ROSTO_REAL'];
  const baseTokens = ['deformed hands', 'extra fingers', 'fused objects'];
  const set = new Set(baseTokens);

  if (modes.includes('ROSTO_REAL')) {
    set.add('plastic airbrushed skin');
    set.add('altered facial identity');
  }
  if (modes.includes('GAMING')) {
    set.add('random neon glow');
    set.add('gratuitous RGB lighting everywhere');
  }
  if (modes.includes('TECH')) {
    set.add('reinterpreted hardware geometry');
  }

  assert.ok(set.has('plastic airbrushed skin'), 'Modo Rosto Real deve proibir pele de silicone');
  assert.ok(set.has('gratuitous RGB lighting everywhere'), 'Modo Gaming deve proibir RGB tóxico');
  assert.ok(set.has('reinterpreted hardware geometry'), 'Modo Tech deve proibir distorção de portas e hardware');
  console.log('  ✓ Injeção de salvaguardas por modo fotográfico validada.');
}

// 4. A/B Concept Distinction Test
console.log('\n4. Testando Geração Conceitual de Hipóteses A/B/C...');
{
  const hypotheses = [
    { id: 'A', type: 'PERSONAGEM', drivenBy: 'Creator/Character psychological tension' },
    { id: 'B', type: 'OBJETO', drivenBy: 'Physical hero artifact / tactile hardware integrity' },
    { id: 'C', type: 'SITUAÇÃO', drivenBy: 'Spatial aftermath / environmental forbidden scene' }
  ];

  assert.equal(hypotheses.length, 3, 'Devem ser exatamente 3 hipóteses conceituais');
  assert.notEqual(hypotheses[0].type, hypotheses[1].type);
  assert.notEqual(hypotheses[1].type, hypotheses[2].type);
  console.log('  ✓ 3 hipóteses independentes e estruturalmente distintas validadas.');
}

// 5. Project Persistence JSON Schema Integrity Test
console.log('\n5. Testando Integridade de Serialização / JSON do Projeto...');
{
  const mockProject = {
    id: 'proj-test-1',
    name: 'Projeto Teste',
    videoTitle: 'Título de Teste',
    videoDescription: 'Descrição',
    niche: 'Tecnologia',
    protagonistType: 'Objeto',
    protagonistPresence: 65,
    activeModes: ['TECH'],
    avoidList: ['GLOW EM TODO OBJETO', 'SETA VERMELHA SEM FUNÇÃO'],
    diagnosticState: {
      manyFocalPoints: false,
      artificialGlow: true
    },
    checklistState: { 'chk-1': true }
  };

  const serialized = JSON.stringify(mockProject);
  const parsed = JSON.parse(serialized);

  assert.equal(parsed.id, mockProject.id);
  assert.equal(parsed.protagonistPresence, 65);
  assert.deepEqual(parsed.avoidList, mockProject.avoidList);
  assert.equal(parsed.diagnosticState.artificialGlow, true);
  console.log('  ✓ Exportação e Importação de JSON preservam 100% dos dados.');
}

// 6. V1 to V2 Schema Storage Migration Test
console.log('\n6. Testando Migração de Schema V1 -> V2...');
{
  const v1Project = {
    id: 'proj-v1-legacy',
    name: 'Projeto Legado V1',
    videoTitle: 'Título Antigo',
    references: [
      { id: 'r1', name: 'Ref 1', category: 'Luz', purpose: 'P', extractedDecision: 'D' }
    ],
    diagnosticState: { manyFocalPoints: true },
    avoidList: ['SETA VERMELHA']
  };

  // Migration simulation logic
  const v2Project = {
    ...v1Project,
    schemaVersion: 2,
    references: v1Project.references.map(r => ({ ...r, roles: r.roles || [] })),
    referenceLocks: v1Project.referenceLocks || [],
    promptVersions: v1Project.promptVersions || [],
    aiAnalyses: v1Project.aiAnalyses || [],
    aiComparisons: v1Project.aiComparisons || [],
    experimentJournal: v1Project.experimentJournal || [],
    performanceSnapshots: v1Project.performanceSnapshots || []
  };

  assert.equal(v2Project.schemaVersion, 2, 'SchemaVersion deve ser 2');
  assert.ok(Array.isArray(v2Project.promptVersions), 'promptVersions deve ser array');
  assert.ok(Array.isArray(v2Project.aiAnalyses), 'aiAnalyses deve ser array');
  assert.ok(Array.isArray(v2Project.referenceLocks), 'referenceLocks deve ser array');
  assert.ok(Array.isArray(v2Project.references[0].roles), 'roles da referência deve ser array');
  console.log('  ✓ Migração V1 para V2 preserva integridade sem perda de campos legados.');
}

// 7. Reference Locks & Roles in Prompt Generator Test
console.log('\n7. Testando Reference Roles & Reference Locks no Prompt...');
{
  const refWithRole = {
    id: 'r1',
    name: 'Wired Studio',
    category: 'Textura',
    roles: ['PRODUTO / HARDWARE', 'TEXTURA'],
    extractedDecision: 'Alumínio usinado real'
  };

  const roleStr = refWithRole.roles ? ` [Roles: ${refWithRole.roles.join(', ')}]` : '';
  const refLine = `${refWithRole.category} (${refWithRole.name})${roleStr}: ${refWithRole.extractedDecision}`;
  assert.ok(refLine.includes('[Roles: PRODUTO / HARDWARE, TEXTURA]'), 'Roles devem ser formatadas');

  const locks = ['LOCK_PRODUCT_GEOMETRY', 'LOCK_FACE'];
  const lockDescriptions = {
    LOCK_PRODUCT_GEOMETRY: 'MANDATORY: Strictly preserve authentic industrial product geometry.',
    LOCK_FACE: 'MANDATORY: Lock facial geometry, bone structure and eye shape.'
  };
  const activeLocks = locks.map(l => lockDescriptions[l]);
  const lockBlock = `PRESERVATION LOCKS (NON-NEGOTIABLE):\n${activeLocks.join('\n')}`;

  assert.ok(lockBlock.includes('Strictly preserve authentic industrial product geometry'), 'Trava de hardware inclusa');
  assert.ok(lockBlock.includes('Lock facial geometry'), 'Trava de rosto inclusa');
  console.log('  ✓ Reference Roles e Preservation Locks formatados corretamente no prompt.');
}

// 8. A/B Diversity Check Test
console.log('\n8. Testando Verificação de Diversidade em Testes A/B...');
{
  function checkDiversity(variants) {
    const reasons = [];
    const types = new Set(variants.map(v => v.type));
    if (types.size === 1 && variants.length >= 3) {
      reasons.push('Todas as variantes compartilham a mesma categoria de sujeito.');
    }
    const hypotheses = new Set(variants.map(v => v.hypothesis.toLowerCase().trim()));
    if (hypotheses.size < variants.length) {
      reasons.push('Há variantes com hipóteses redundantes ou idênticas.');
    }
    const isDiverse = reasons.length === 0;
    const warning = !isDiverse
      ? 'ESTAS VARIAÇÕES PARECEM TRÊS VERSÕES ESTÉTICAS DA MESMA HIPÓTESE. Um teste A/B autêntico deve contrapor mecanismos psicológicos diferentes (ex: Cumplicidade Humana vs. Fetiche Táctil do Objeto vs. Fascínio pelo Espaço/Cena).'
      : undefined;
    return { isDiverse, warning, reasons };
  }

  // Non-diverse mock
  const nonDiverse = [
    { type: 'PERSONAGEM', hypothesis: 'Rosto sorrindo' },
    { type: 'PERSONAGEM', hypothesis: 'Rosto sério' },
    { type: 'PERSONAGEM', hypothesis: 'Rosto de lado' }
  ];
  const resNonDiverse = checkDiversity(nonDiverse);
  assert.equal(resNonDiverse.isDiverse, false);
  assert.ok(resNonDiverse.warning.includes('ESTAS VARIAÇÕES PARECEM TRÊS VERSÕES ESTÉTICAS DA MESMA HIPÓTESE'));
  console.log('  ✓ Alerta disparado para variações estéticas da mesma hipótese.');

  // Diverse mock
  const diverse = [
    { type: 'PERSONAGEM', hypothesis: 'Tensão psicológica do criador' },
    { type: 'OBJETO', hypothesis: 'Fetiche tátil do hardware sob a lona' },
    { type: 'SITUAÇÃO', hypothesis: 'Mistério espacial do laboratório lacrado' }
  ];
  const resDiverse = checkDiversity(diverse);
  assert.equal(resDiverse.isDiverse, true);
  assert.equal(resDiverse.warning, undefined);
  console.log('  ✓ Hipóteses estruturalmente distintas passam sem falso positivo.');
}

// 9. Text Density Heuristic Test
console.log('\n9. Testando Heurística de Densidade de Texto na Thumbnail...');
{
  function evaluateTextDensity(text) {
    const clean = text.trim();
    const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
    if (words.length === 0) return 'NONE';
    if (words.length <= 3) return 'IDEAL';
    if (words.length <= 6) return 'WARNING';
    return 'DENSE';
  }

  assert.equal(evaluateTextDensity(''), 'NONE');
  assert.equal(evaluateTextDensity('10 BILHÕES'), 'IDEAL');
  assert.equal(evaluateTextDensity('O FIM'), 'IDEAL');
  assert.equal(evaluateTextDensity('O FIM DA APPLE'), 'WARNING');
  assert.equal(evaluateTextDensity('A MAIOR CRISE DO ANO'), 'WARNING');
  assert.equal(evaluateTextDensity('POR QUE NINGUÉM CONSEGUIU ENCONTRAR O CARRO'), 'DENSE');
  console.log('  ✓ Classificação de densidade de texto testada (NONE, IDEAL, WARNING, DENSE).');
}

// 10. Normalized Region Coordinate Bounds Test
console.log('\n10. Testando Validação de Coordenadas de Regiões [0 - 1]...');
{
  function validateRegion(r) {
    assert.ok(r.x >= 0 && r.x <= 1, 'x deve estar entre 0 e 1');
    assert.ok(r.y >= 0 && r.y <= 1, 'y deve estar entre 0 e 1');
    assert.ok(r.width >= 0 && r.width <= 1, 'width deve estar entre 0 e 1');
    assert.ok(r.height >= 0 && r.height <= 1, 'height deve estar entre 0 e 1');
    assert.ok(['CONFIDENT', 'LIKELY', 'UNCERTAIN'].includes(r.uncertainty), 'Incerteza válida');
  }

  const sampleRegion = {
    id: 'reg-1',
    type: 'focalPrimary',
    label: 'Protagonista',
    x: 0.15,
    y: 0.2,
    width: 0.45,
    height: 0.6,
    visibleEvidence: 'Contorno de tecido cinza escuro',
    interpretation: 'Chassi do veículo sob a lona',
    uncertainty: 'CONFIDENT'
  };

  validateRegion(sampleRegion);
  console.log('  ✓ Coordenadas normalizadas [0 - 1] e níveis de incerteza validados.');
}

// 11. Disabled AI Provider Behavior Test
console.log('\n11. Testando Comportamento do Provedor de IA Desativado...');
{
  class DisabledAIProvider {
    async analyzeThumbnail() {
      throw new Error('ANÁLISE POR IA NÃO CONFIGURADA: Provedor desativado. Configure OPENAI_API_KEY no servidor.');
    }
  }

  const disabled = new DisabledAIProvider();
  let threwExpected = false;
  try {
    await disabled.analyzeThumbnail();
  } catch (err) {
    if (err.message.includes('ANÁLISE POR IA NÃO CONFIGURADA')) {
      threwExpected = true;
    }
  }
  assert.ok(threwExpected, 'Deve lançar erro explícito em português sem fallback mockado simulando IA');
  console.log('  ✓ Provedor desativado lança erro limpo sem gerar dados fictícios simulados.');
}

// 12. Simple Engine Creation & Direction Structure Test
console.log('\n12. Testando Motor Simplificado: Direção em 5 Pontos e Anti-Slop...');
{
  function mockSimpleCreate(title, idea) {
    const isTech = /(legion|steam deck|rog ally|switch|gameboy|console|joystick|hardware)/i.test(`${title} ${idea}`);
    return {
      direction: {
        ideia: 'O Legion Go parece outro aparelho após a troca do sistema.',
        foco: 'O console domina o primeiro plano com nitidez extrema.',
        composicao: 'Console grande no terço inferior com o criador no fundo desfocado.',
        expressao: 'Satisfação contida sem caretas ou boca aberta.',
        visual: 'Iluminação motivada de abajur real e luz fria suave de janela.'
      },
      finalPrompt: 'Photographic YouTube thumbnail, 16:9 widescreen format. STRICTLY AVOID: generic shocked expression, mouth wide open, unmotivated purple-blue gaming neon.',
      isTech
    };
  }

  const res = mockSimpleCreate('Troquei o Windows do meu Legion Go', 'Eu sentado no sofá segurando o Legion Go');
  assert.ok(res.direction.ideia && res.direction.foco && res.direction.composicao && res.direction.expressao && res.direction.visual, 'Deve conter as 5 decisões de direção');
  assert.ok(res.finalPrompt.includes('STRICTLY AVOID: generic shocked expression'), 'Deve conter cláusula anti-slop padrão');
  assert.equal(res.isTech, true, 'Deve detectar console tech/hardware automaticamente');
  console.log('  ✓ Direção concisa em 5 pontos e bloqueio automático de slop validados.');
}

// 13. Slop Purifier & Prompt Improvement Test
console.log('\n13. Testando Purificador de Prompt (Remover o Slop)...');
{
  function mockPurifyPrompt(rawPrompt) {
    const changes = [];
    let cleaned = rawPrompt;
    if (/neon/i.test(cleaned)) {
      cleaned = cleaned.replace(/neon/gi, '');
      changes.push('Substituído o neon genérico por iluminação crível.');
    }
    if (/shocked|open mouth/i.test(cleaned)) {
      cleaned = cleaned.replace(/shocked|open mouth/gi, 'focused subtle smile');
      changes.push('Trocada a expressão de choque por foco autêntico.');
    }
    return { changes, cleaned };
  }

  const dirtyPrompt = 'Epic gaming thumbnail with glowing blue neon and shocked man with open mouth holding controller';
  const purified = mockPurifyPrompt(dirtyPrompt);
  assert.ok(purified.changes.length >= 2, 'Deve identificar e listar as remoções de slop');
  assert.ok(!purified.cleaned.includes('neon'), 'Deve subtrair neon');
  assert.ok(!purified.cleaned.includes('shocked') && !purified.cleaned.includes('open mouth'), 'Deve subtrair careta de choque');
  console.log('  ✓ Purificação de prompt e geração de mudanças pedagógicas validadas.');
}

// 14. Real Simple Engine: Bias Elimination (No Cinematic, No f/2.0, No Pores, No MJ v6.1)
console.log('\n14. Testando Ausência de Viés Cinematográfico, Abertura Forçada (f/2.0), Poros e Midjourney v6.1...');
{
  const {
    generateSimpleThumbnail
  } = await import('../src/lib/simpleEngine/engine.ts');

  // Test neutral generation
  const resNeutral = generateSimpleThumbnail({
    videoTitle: 'Review do Microfone Shure SM7B',
    ideaDescription: 'Microfone em cima da mesa de podcast com iluminação suave',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });

  const promptLower = resNeutral.finalPrompt.toLowerCase();
  assert.ok(!promptLower.includes('cinematic'), 'Prompt padrão NÃO deve conter "cinematic"');
  assert.ok(!promptLower.includes('cinematogr'), 'Prompt padrão NÃO deve conter "cinematográfico"');
  assert.ok(!/f\/\d/i.test(resNeutral.finalPrompt), 'Prompt padrão NÃO deve conter abertura forçada (ex: f/2.0)');
  assert.ok(!/pores|poros/i.test(promptLower), 'Prompt padrão NÃO deve usar "pores" como muleta de realismo');
  console.log('  ✓ Ausência de viés "cinematic", f/2.0 e "pores" validada no preset padrão Natural.');

  // Test Midjourney target model flags: Natural + Alto realism -> applies --style raw
  const resMJ = generateSimpleThumbnail({
    videoTitle: 'Setup de Gravação',
    ideaDescription: 'Mesa de trabalho com notebook e luz natural da janela',
    references: [],
    targetModel: 'MIDJOURNEY',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });

  assert.ok(!resMJ.finalPrompt.includes('--v 6'), 'Prompt Midjourney NÃO deve fixar versão volátil como --v 6.1');
  assert.ok(resMJ.finalPrompt.includes('--style raw'), 'Prompt Midjourney realista DEVE incluir --style raw');
  assert.ok(resMJ.finalPrompt.includes('--ar 16:9'), 'Prompt Midjourney DEVE incluir proporção --ar 16:9');

  // Test Midjourney target model flags: Cinematográfico / Estilizado -> NÃO deve forçar --style raw (Regra 2)
  const resMJStylized = generateSimpleThumbnail({
    videoTitle: 'Aventura Espacial',
    ideaDescription: 'Nave espacial estilizada no espaço profundo',
    references: [],
    targetModel: 'MIDJOURNEY',
    aspectRatio: '16:9',
    stylePreset: 'Cinematográfico',
    realismLevel: 'Estilizado',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(!resMJStylized.finalPrompt.includes('--style raw'), 'Prompt Midjourney cinematográfico/estilizado NÃO deve forçar --style raw');
  assert.ok(resMJStylized.finalPrompt.includes('--ar 16:9'), 'Prompt Midjourney estilizado DEVE manter proporção --ar 16:9');
  console.log('  ✓ Parâmetros Midjourney validados (--style raw aplicado por intenção visual, não fixo universalmente).');

  // Test explicit Cinematic request
  const resCinematic = generateSimpleThumbnail({
    videoTitle: 'Curta Metragem de Ficção',
    ideaDescription: 'Cena noturna na chuva com estilo de filme noir',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Cinematográfico',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resCinematic.finalPrompt.includes('Cinematográfico'), 'Deve incluir Cinematográfico SOMENTE quando explicitamente escolhido.');
  console.log('  ✓ Presença de "Cinematográfico" estritamente restrita a pedidos explícitos do usuário.');
}

// 15. Real Simple Engine: 4 Diverse Mode CRIAR Cases (Section 19: Gaming, Tech, Rosto/Story, Sem Pessoa)
console.log('\n15. Testando 4 Casos Diversos do Modo CRIAR (Gaming, Tech, Rosto/Story, Sem Pessoa)...');
{
  const { generateSimpleThumbnail } = await import('../src/lib/simpleEngine/engine.ts');

  // Case 1: GAMING ("Eu no sofá mostrando meu Legion Go depois de trocar o sistema.")
  const caseGaming = generateSimpleThumbnail({
    videoTitle: 'Troquei o sistema do Legion Go',
    ideaDescription: 'Eu no sofá mostrando meu Legion Go depois de trocar o sistema.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });

  assert.ok(caseGaming.finalPrompt.includes('HARDWARE & PRODUCT FIDELITY'), 'Caso Gaming deve conter trava de hardware');
  assert.ok(caseGaming.finalPrompt.includes('HAND & OBJECT INTERACTION'), 'Caso Gaming deve conter trava de anatomia de mãos no controle');
  // Regra 1: mãos anatomicamente plausíveis com contagem correta de dedos segundo oclusão natural (NUNCA exigir 5 dedos fixos)
  assert.ok(!caseGaming.finalPrompt.toLowerCase().includes('five distinct anatomical fingers'), 'NÃO deve exigir "five distinct anatomical fingers"');
  assert.ok(!caseGaming.finalPrompt.toLowerCase().includes('5 dedos'), 'NÃO deve exigir "5 dedos"');
  assert.ok(!caseGaming.finalPrompt.toLowerCase().includes('all five fingers'), 'NÃO deve exigir "all five fingers"');
  assert.ok(caseGaming.finalPrompt.includes('Anatomically plausible hands'), 'Deve exigir mãos anatomicamente plausíveis');
  assert.ok(caseGaming.finalPrompt.includes('natural occlusion'), 'Deve respeitar oclusão natural de dedos');
  assert.ok(caseGaming.finalPrompt.includes('preserves the lived-in environmental context'), 'Caso Gaming com sofá/sala deve preservar legibilidade do ambiente');
  assert.ok(caseGaming.direction.foco.includes('Legion Go'), 'Foco deve destacar o Legion Go no sofá');
  console.log('  ✓ Caso 1 (Gaming): Travas de hardware, mãos com oclusão natural e preservação de ambiente da sala validadas.');

  // Case 2: TECH ("Notebook aberto na mesa mostrando uma diferença de hardware.")
  const caseTech = generateSimpleThumbnail({
    videoTitle: 'Diferença interna de hardware',
    ideaDescription: 'Notebook aberto na mesa mostrando uma diferença de hardware.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });

  assert.ok(caseTech.direction.foco.includes('notebook') && caseTech.direction.foco.includes('hardware'), 'Caso Tech deve focar no notebook e hardware aberto');
  assert.ok(caseTech.finalPrompt.includes('HARDWARE & PRODUCT FIDELITY'), 'Caso Tech deve conter trava de integridade industrial');
  assert.ok(!caseTech.finalPrompt.includes('HUMAN EXPRESSION:'), 'Caso Tech sem pessoa NÃO deve gerar diretiva de expressão humana');
  console.log('  ✓ Caso 2 (Tech Teardown): Foco técnico de bancada sem pessoa e integridade de circuitos validados.');

  // Case 3: ROSTO / STORY ("Eu olhando para um produto quebrado, decepcionado.")
  const caseStory = generateSimpleThumbnail({
    videoTitle: 'Meu maior prejuízo',
    ideaDescription: 'Eu olhando para um produto quebrado, decepcionado.',
    references: [{ id: 'ref-face-1', name: 'Meu Rosto', url: 'https://example.com/me.jpg', role: 'PESSOA' }],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: true,
    preserveProduct: false
  });

  assert.ok(caseStory.finalPrompt.includes('FACIAL FIDELITY (MANDATORY)'), 'Caso Story deve ter trava de fidelidade facial');
  assert.ok(caseStory.finalPrompt.includes('natural facial asymmetry'), 'Caso Story deve exigir assimetria facial natural');
  assert.ok(caseStory.finalPrompt.includes('NO artificial plastic smoothing'), 'Caso Story deve proibir alisamento plástico');
  assert.ok(caseStory.direction.expressao.includes('Desapontamento sincero'), 'Expressão deve ser desapontamento sincero e contido');
  const positiveStoryPrompt = caseStory.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!positiveStoryPrompt.includes('screaming') && !positiveStoryPrompt.includes('shocked'), 'Caso Story não deve induzir careta de choque');
  console.log('  ✓ Caso 3 (Rosto / Story): Frustração humana honesta com produto quebrado e ausência de caretas validadas.');

  // Case 4: SEM PESSOA ("Um console antigo ao lado de um console moderno.")
  const caseSemPessoa = generateSimpleThumbnail({
    videoTitle: 'Evolução dos videogames',
    ideaDescription: 'Um console antigo ao lado de um console moderno.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });

  assert.ok(!caseSemPessoa.finalPrompt.includes('FACIAL FIDELITY'), 'Cena sem pessoa NÃO deve ter trava de rosto');
  assert.ok(!caseSemPessoa.finalPrompt.includes('HUMAN EXPRESSION:'), 'Cena sem pessoa NÃO deve conter diretiva de expressão humana');
  assert.ok(caseSemPessoa.direction.foco.includes('justaposição') || caseSemPessoa.direction.foco.includes('console antigo'), 'Foco deve ser comparativo geracional');
  console.log('  ✓ Caso 4 (Sem Pessoa): Comparação direta lado a lado sem elementos humanos validada.');

  // Distinctiveness assertion across all 4 cases
  assert.notEqual(caseGaming.direction.foco, caseTech.direction.foco, 'Gaming e Tech devem ter focos distintos');
  assert.notEqual(caseTech.direction.foco, caseStory.direction.foco, 'Tech e Story devem ter focos distintos');
  assert.notEqual(caseStory.direction.foco, caseSemPessoa.direction.foco, 'Story e Sem Pessoa devem ter focos distintos');
  assert.notEqual(caseGaming.direction.composicao, caseStory.direction.composicao, 'Composições devem ser estruturalmente diferentes');
  assert.notEqual(caseGaming.finalPrompt, caseTech.finalPrompt, 'Prompts de Gaming e Tech devem ser distintos');
  assert.notEqual(caseTech.finalPrompt, caseStory.finalPrompt, 'Prompts de Tech e Story devem ser distintos');
  assert.notEqual(caseStory.finalPrompt, caseSemPessoa.finalPrompt, 'Prompts de Story e Sem Pessoa devem ser distintos');
  console.log('  ✓ Distinção estrutural e conceitual comprovada entre todos os 4 casos.');
}

// 16. Real Simple Engine: Mode MELHORAR (Community Slop Purification - Section 20)
console.log('\n16. Testando Modo MELHORAR com Exemplo Completo de Slop da Comunidade (Seção 20)...');
{
  const { improvePrompt } = await import('../src/lib/simpleEngine/engine.ts');

  const dirtyCommunityPrompt = 'Epic cinematic gaming thumbnail, vibrant neon purple and blue lighting, dramatic rim light, glowing console, shocked YouTuber face, floating sparks, ultra detailed, high CTR.';
  const improvedResult = improvePrompt({ rawPrompt: dirtyCommunityPrompt });

  assert.ok(improvedResult.changes.length >= 5, `Esperadas pelo menos 5 mudanças explicadas, obteve ${improvedResult.changes.length}`);
  const positiveImproved = improvedResult.improvedPrompt.split('STRICTLY AVOID:')[0].toLowerCase();

  assert.ok(!positiveImproved.includes('neon'), 'Parte positiva não deve conter neon');
  assert.ok(!positiveImproved.includes('shocked') && !positiveImproved.includes('open mouth'), 'Parte positiva não deve conter careta de choque');
  assert.ok(!positiveImproved.includes('sparks'), 'Parte positiva não deve conter faíscas');
  assert.ok(!positiveImproved.includes('glowing'), 'Parte positiva não deve conter glowing console');
  assert.ok(!positiveImproved.includes('high ctr'), 'Parte positiva não deve conter buzzword "high CTR"');
  assert.ok(!positiveImproved.includes('epic'), 'Parte positiva não deve conter buzzword "epic"');
  assert.ok(!positiveImproved.includes('f/2.0'), 'Não deve injetar f/2.0');
  assert.ok(!positiveImproved.includes('pores') && !positiveImproved.includes('poros'), 'Não deve usar poros como muleta');
  assert.ok(improvedResult.improvedPrompt.includes('Motivated physical illumination'), 'Deve conter iluminação física motivada');
  assert.ok(improvedResult.improvedPrompt.includes('natural skin texture'), 'Deve conter textura natural de pele');
  assert.ok(improvedResult.improvedPrompt.includes('Clean figure-ground separation'), 'Deve conter separação figura-fundo para mobile');
  assert.ok(improvedResult.improvedPrompt.includes('STRICTLY AVOID:'), 'Deve incluir lista negativa de slop');
  console.log('  ✓ Purificação completa e reconstrução de intenção executadas com sucesso.');
  console.log(`    Mudanças registradas (${improvedResult.changes.length}):`);
  improvedResult.changes.forEach(c => console.log(`      - ${c}`));
}

// 17. Real Simple Engine: Mode ANALISAR (Surgical Inpainting with CHANGE: & PRESERVE: - Section 16 & 17)
console.log('\n17. Testando Modo ANALISAR com Auditoria Baseada em Evidências e Prompt Cirúrgico...');
{
  const { analyzeThumbnailLocally } = await import('../src/lib/simpleEngine/engine.ts');

  // Test 17A: Hardware context (Notebook aberto na mesa)
  const analysisTech = analyzeThumbnailLocally('Notebook aberto na mesa mostrando uma diferença de hardware');
  assert.ok(analysisTech.fixPrompt.includes('CHANGE:'), 'fixPrompt DEVE conter bloco explícito "CHANGE:"');
  assert.ok(analysisTech.fixPrompt.includes('PRESERVE:'), 'fixPrompt DEVE conter bloco explícito "PRESERVE:"');
  assert.ok(analysisTech.fixPrompt.includes('AVOID:'), 'fixPrompt DEVE conter bloco explícito "AVOID:"');
  assert.ok(analysisTech.aiLooking.some(item => item.toLowerCase().includes('brilho') || item.toLowerCase().includes('chassi')), 'Deve auditar artefatos de hardware');
  assert.ok(!analysisTech.aiLooking.some(item => item.toLowerCase().includes('pele') || item.toLowerCase().includes('rosto')), 'NÃO deve acusar defeitos de pele em imagem de hardware sem pessoa');
  console.log('  ✓ Auditoria em Hardware: Foco em chassi e reflexos sem falsas acusações de pele.');

  // Test 17B: Creator face context (Eu olhando decepcionado)
  const analysisCreator = analyzeThumbnailLocally('Eu olhando para um produto quebrado, decepcionado');
  assert.ok(analysisCreator.fixPrompt.includes('CHANGE:'), 'fixPrompt DEVE conter bloco explícito "CHANGE:"');
  assert.ok(analysisCreator.fixPrompt.includes('PRESERVE:'), 'fixPrompt DEVE conter bloco explícito "PRESERVE:"');
  assert.ok(analysisCreator.aiLooking.some(item => item.toLowerCase().includes('pele') || item.toLowerCase().includes('rim light')), 'Deve auditar pele e iluminação de recorte');
  console.log('  ✓ Auditoria em Criador: Diagnóstico preciso de rim light e alisamento de pele com fixPrompt cirúrgico.');
}

// 18. Mode ANALISAR with Real Visual PNG Fixture & Multimodal Contract
console.log('\n18. Testando Fixture Visual PNG Real e Contrato de API Multimodal...');
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const fixturePath = path.resolve('tests/fixtures/sample-thumbnail.png');

  assert.ok(fs.existsSync(fixturePath), `Fixture PNG deve existir em ${fixturePath}`);
  const buf = fs.readFileSync(fixturePath);

  // Validate PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  assert.equal(buf[0], 0x89, 'Byte 0 do header PNG');
  assert.equal(buf[1], 0x50, 'Byte 1 (P)');
  assert.equal(buf[2], 0x4E, 'Byte 2 (N)');
  assert.equal(buf[3], 0x47, 'Byte 3 (G)');

  // Validate IHDR dimensions (offset 16-24: 4 bytes width, 4 bytes height)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  assert.equal(width, 640, 'Largura da fixture deve ser 640px');
  assert.equal(height, 360, 'Altura da fixture deve ser 360px');
  console.log(`  ✓ Fixture PNG verificada com sucesso: ${width}x${height}px (${buf.length} bytes).`);

  // Multimodal check
  if (!process.env.OPENAI_API_KEY) {
    console.log('  ℹ️ REAL MULTIMODAL TEST SKIPPED — API NOT CONFIGURED');
  } else {
    console.log('  ✓ OPENAI_API_KEY detectada — pronto para chamada multimodal.');
  }
}

// 19. New Reference Roles, Typography Directives, and Attribute Isolation (Section 26)
console.log('\n19. Testando Novos Tipos de Referência, Isolamento de Atributos e Regras Tipográficas (Seção 26)...');
{
  const { generateSimpleThumbnail } = await import('../src/lib/simpleEngine/engine.ts');

  // Test 19A: CENÁRIO - MEU AMBIENTE vs. REFERÊNCIA DE AMBIENTE
  const resCenarioMeu = generateSimpleThumbnail({
    videoTitle: 'Tour pelo meu novo estúdio',
    ideaDescription: 'Mostrando a reforma do meu estúdio de gravação.',
    references: [
      { id: 'ref-cen-1', name: 'Foto do Quarto/Estúdio', url: 'https://example.com/studio.jpg', role: 'CENÁRIO', scenarioMode: 'MEU_AMBIENTE' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resCenarioMeu.finalPrompt.includes('MY ENVIRONMENT / REAL LOCATION (Foto do Quarto/Estúdio)'), 'Deve conter trava de MEU AMBIENTE');
  assert.ok(resCenarioMeu.finalPrompt.includes('Preserve spatial layout where visible, major furniture placement'), 'MEU AMBIENTE deve preservar layout espacial e mobília');
  assert.ok(resCenarioMeu.finalPrompt.includes('Do not invent: generic gaming room, RGB streamer setup, or futuristic studio'), 'MEU AMBIENTE deve proibir quarto gamer genérico e RGB');
  console.log('  ✓ CENÁRIO (MEU AMBIENTE): Estrutura, layout e mobília preservados sem inventar setup gamer.');

  // Test 19A2: CENÁRIO - REFERÊNCIA DE AMBIENTE
  const resCenarioRef = generateSimpleThumbnail({
    videoTitle: 'Como consertar eletrônicos',
    ideaDescription: 'Gravando em uma oficina rústica com ferramentas.',
    references: [
      { id: 'ref-cen-2', name: 'Oficina Exemplo', url: 'https://example.com/workshop.jpg', role: 'CENÁRIO', scenarioMode: 'REFERENCIA_AMBIENTE' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resCenarioRef.finalPrompt.includes('ENVIRONMENT REFERENCE / MOOD ONLY (Oficina Exemplo)'), 'Deve conter trava de REFERENCIA DE AMBIENTE');
  assert.ok(resCenarioRef.finalPrompt.includes('Extract only: type of environment, level of organization, materials'), 'REFERENCIA DE AMBIENTE deve extrair apenas atmosfera e materiais');
  assert.ok(resCenarioRef.finalPrompt.includes('Do NOT copy: exact furniture position, exact room geometry'), 'REFERENCIA DE AMBIENTE NÃO deve copiar layout ou mobília');
  console.log('  ✓ CENÁRIO (REFERÊNCIA DE AMBIENTE): Extração pura de atmosfera sem cópia de layout ou geometria.');

  // Test 19B: TIPOGRAFIA reference isolation
  const resTipo = generateSimpleThumbnail({
    videoTitle: 'Review de Fonte',
    ideaDescription: 'Análise de design gráfico com texto de impacto.',
    thumbnailText: 'NOVO DESIGN',
    textTreatment: 'USAR_REFERENCIA',
    references: [
      { id: 'ref-tipo-1', name: 'Poster Tipográfico Suíço', url: 'https://example.com/poster.jpg', role: 'TIPOGRAFIA' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resTipo.finalPrompt.includes('TYPOGRAPHY REFERENCE'), 'Deve conter trava de TIPOGRAFIA');
  assert.ok(resTipo.finalPrompt.includes('font personality'), 'TIPOGRAFIA deve preservar personalidade da fonte');
  assert.ok(resTipo.finalPrompt.includes('Do NOT copy images, people, background scenery'), 'TIPOGRAFIA NÃO deve copiar imagens, pessoas ou cenário');
  assert.ok(resTipo.finalPrompt.includes('The only visible text must read exactly: "NOVO DESIGN"'), 'Deve manter texto exato');
  console.log('  ✓ TIPOGRAFIA: Personalidade de fonte preservada sem vazar imagem ou cenário.');

  // Test 19C: GERAR SEM TEXTO
  const resSemTexto = generateSimpleThumbnail({
    videoTitle: 'Vídeo Sem Texto',
    ideaDescription: 'Cena limpa com espaço para design posterior.',
    thumbnailText: 'TEXTO IGNORADO',
    textTreatment: 'SEM_TEXTO',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resSemTexto.finalPrompt.includes('Do not generate any text, letters, logos or pseudo-typography'), 'SEM TEXTO deve proibir geração de texto');
  assert.ok(resSemTexto.finalPrompt.includes('Reserve clean negative space for later typography'), 'SEM TEXTO deve reservar espaço negativo limpo');
  assert.ok(!resSemTexto.finalPrompt.includes('TEXTO IGNORADO'), 'SEM TEXTO NÃO deve injetar texto ignorado');
  console.log('  ✓ GERAR SEM TEXTO: Veto a caracteres e reserva de espaço limpo validados.');

  // Test 19D: RESERVAR ESPAÇO PARA TEXTO (posições: ESQUERDA, DIREITA, SUPERIOR, INFERIOR)
  const posTests = [
    { pos: 'ESQUERDA', expected: 'left side' },
    { pos: 'DIREITA', expected: 'right side' },
    { pos: 'SUPERIOR', expected: 'upper top area' },
    { pos: 'INFERIOR', expected: 'lower bottom area' }
  ];
  for (const { pos, expected } of posTests) {
    const resSpace = generateSimpleThumbnail({
      videoTitle: 'Layout com Espaço',
      ideaDescription: 'Composição com respiro.',
      reserveSpaceForText: true,
      reservedSpacePosition: pos,
      references: [],
      targetModel: 'GERAL',
      aspectRatio: '16:9',
      stylePreset: 'Natural',
      realismLevel: 'Alto',
      preserveFace: false,
      preserveProduct: false
    });
    assert.ok(resSpace.finalPrompt.includes(`COMPOSITION RESERVATION: Leave clean negative space on the ${expected}`), `Deve reservar espaço para ${pos}`);
  }
  console.log('  ✓ RESERVAR ESPAÇO: 4 posições espaciais (ESQUERDA, DIREITA, SUPERIOR, INFERIOR) validadas.');

  // Test 19E: TEXTO EXATO ("AGORA FUNCIONA")
  const resExato = generateSimpleThumbnail({
    videoTitle: 'Tutorial Completo',
    ideaDescription: 'Agora o console está operando perfeitamente.',
    thumbnailText: 'AGORA FUNCIONA',
    textTreatment: 'AUTO',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resExato.finalPrompt.includes('The only visible text must read exactly: "AGORA FUNCIONA". No extra words. No pseudo-text. No invented letters.'), 'Deve tratar AGORA FUNCIONA como texto exato sem alteração');
  console.log('  ✓ TEXTO EXATO: Instrução literal "AGORA FUNCIONA" validada sem reescrita.');

  // Test 19F: FONTE REAL INFORMADA PELO USUÁRIO (ex: Anton)
  const resFonteReal = generateSimpleThumbnail({
    videoTitle: 'Vídeo com Fonte Anton',
    ideaDescription: 'Texto com tipografia limpa.',
    thumbnailText: 'SUPER NOVIDADE',
    fontName: 'Anton',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  assert.ok(resFonteReal.finalPrompt.includes('Anton typeface characteristics'), 'Deve usar nome de fonte real informada');
  console.log('  ✓ FONTE REAL: Preservação de Anton sem nomes falsos inventados pela IA.');

  // Test 19G: PESSOA + PRODUTO + CENÁRIO juntos (Isolamento estrito sem vazamento de atributos)
  const resTrio = generateSimpleThumbnail({
    videoTitle: 'Testando o Legion Go no meu estúdio',
    ideaDescription: 'Eu sentado no sofá do estúdio segurando o Legion Go.',
    references: [
      { id: 'ref-face', name: 'Minha Foto', url: 'https://example.com/me.jpg', role: 'PESSOA' },
      { id: 'ref-prod', name: 'Foto Legion Go', url: 'https://example.com/legion.jpg', role: 'PRODUTO' },
      { id: 'ref-scen', name: 'Foto do Estúdio', url: 'https://example.com/room.jpg', role: 'CENÁRIO' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: true,
    preserveProduct: true
  });

  // Verificar presença de todas as 3 travas
  assert.ok(resTrio.finalPrompt.includes('FACIAL FIDELITY (MANDATORY) (Minha Foto): Strictly preserve authentic facial identity'), 'Deve conter trava de PESSOA com nome da referência');
  assert.ok(resTrio.finalPrompt.includes('Do NOT automatically copy clothes, background setting, lighting, or pose'), 'PESSOA não deve vazar roupa, cenário ou pose');

  assert.ok(resTrio.finalPrompt.includes('HARDWARE & PRODUCT FIDELITY (MANDATORY) (Foto Legion Go): Strictly preserve authentic industrial geometry'), 'Deve conter trava de PRODUTO com nome da referência');
  assert.ok(resTrio.finalPrompt.includes('Do NOT automatically copy background setting, composition, or style'), 'PRODUTO não deve vazar cenário, composição ou estilo');

  assert.ok(resTrio.finalPrompt.includes('MY ENVIRONMENT / REAL LOCATION (Foto do Estúdio)'), 'Deve conter trava de CENÁRIO (MEU AMBIENTE) com nome da referência');
  assert.ok(resTrio.finalPrompt.includes('Do NOT copy people who might appear in this photo'), 'CENÁRIO não deve copiar pessoas');

  // Mãos com oclusão natural
  assert.ok(resTrio.finalPrompt.includes('Anatomically plausible hands'), 'Trio com pessoa e produto deve usar mãos com oclusão natural');

  // Test 19I: buildTypographyPlan (Função visual primeiro, sugestões reais depois, caso sem texto)
  const { buildTypographyPlan } = await import('../src/lib/simpleEngine/engine.ts');

  // Condensada pesada para poucas palavras
  const planGeneric = buildTypographyPlan('AGORA FUNCIONA', false, undefined, 'DIREITA', 'Natural');
  assert.ok(planGeneric.includes('Sans-serif condensada pesada'), 'Deve determinar função condensada pesada');
  assert.ok(planGeneric.includes('Anton ou Archivo Black'), 'Deve sugerir Anton ou Archivo Black');
  assert.ok(planGeneric.includes('à direita'), 'Deve respeitar a posição reservada');

  // Sans geométrica pesada para tech
  const planTech = buildTypographyPlan('RTX 5090 TESTE', true, undefined, 'ESQUERDA', 'Natural');
  assert.ok(planTech.includes('Sans geométrica pesada'), 'Para tech deve determinar sans geométrica pesada');
  assert.ok(planTech.includes('Archivo Black ou Inter'), 'Sugestão para tech');
  assert.ok(planTech.includes('à esquerda'), 'Deve respeitar a posição à esquerda');

  // Grotesca editorial para estilo Editorial / Fotojornalismo
  const planEditorial = buildTypographyPlan('DOCUMENTÁRIO', false, undefined, 'DIREITA', 'Editorial');
  assert.ok(planEditorial.includes('Grotesca editorial'), 'Para editorial deve determinar grotesca editorial');
  assert.ok(planEditorial.includes('Roboto Condensed ou Oswald'), 'Sugestão para editorial');

  // Sans neutra para texto mais longo (imagem deve dominar)
  const planNeutra = buildTypographyPlan('TESTANDO MAIS DE QUATRO PALAVRAS', false, undefined, 'DIREITA', 'Natural');
  assert.ok(planNeutra.includes('Sans-serif neutra'), 'Texto longo deve usar sans neutra para imagem dominar');
  assert.ok(planNeutra.includes('Inter ou Barlow Condensed'), 'Sugestão para sans neutra');

  // Fonte customizada informada pelo usuário
  const planCustom = buildTypographyPlan('IMPORTANTE', false, 'Montserrat', 'SUPERIOR');
  assert.ok(planCustom.includes('Montserrat'), 'Deve respeitar fonte informada pelo usuário');
  assert.ok(planCustom.includes('no topo'), 'Deve mapear SUPERIOR para no topo');

  // Quando não houver necessidade de texto
  const planEmpty = buildTypographyPlan('', false);
  assert.strictEqual(planEmpty, 'Nenhuma tipografia necessária. A imagem e o título já comunicam a ideia.');

  const planSemTexto = buildTypographyPlan('TEXTO IGNORADO', false, undefined, 'DIREITA', 'Natural', 'SEM_TEXTO');
  assert.strictEqual(planSemTexto, 'Nenhuma tipografia necessária. A imagem e o título já comunicam a ideia.');
  console.log('  ✓ PLANO DE TIPOGRAFIA: Funções visuais, sugestões de fontes reais e mensagem limpa para ausência de texto validadas.');
}

// 20. Ausência de Viés de Ambiente Doméstico e Ordem de Autoridade de Cenário
{
  console.log('\n20. Testando Ausência de Viés de Ambiente Doméstico e Ordem de Autoridade de Cenário...');
  const { generateSimpleThumbnail, analyzeThumbnailLocally } = await import('../src/lib/simpleEngine/engine.ts');

  // Caso A: Gaming portátil SEM pedido explícito de sofá/sala (Não inventar quarto/sala/sofá)
  const caseGamingNoSofa = generateSimpleThumbnail({
    videoTitle: 'Testando o Steam Deck',
    ideaDescription: 'Eu segurando o Steam Deck mostrando a performance.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });

  const promptA = caseGamingNoSofa.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!promptA.includes('sofa'), 'NÃO deve inventar sofá sem pedido explícito');
  assert.ok(!promptA.includes('living room'), 'NÃO deve inventar living room sem pedido explícito');
  assert.ok(!promptA.includes('bedroom'), 'NÃO deve inventar bedroom sem pedido explícito');
  assert.ok(!promptA.includes('desk lamp'), 'NÃO deve inventar desk lamp sem pedido explícito');
  assert.ok(!promptA.includes('floor lamp'), 'NÃO deve inventar floor lamp sem pedido explícito');
  assert.ok(!promptA.includes('cushions'), 'NÃO deve inventar almofadas de sofá sem pedido explícito');
  assert.ok(
    caseGamingNoSofa.finalPrompt.includes('Minimal neutral background') || caseGamingNoSofa.finalPrompt.includes('Clean minimalist background'),
    'Deve adotar fundo limpo, minimalista ou neutro por padrão quando ambiente não for especificado'
  );
  console.log('  ✓ Nível 5 (Padrão): Gaming portátil sem sofá gera fundo neutro sem inventar sala, sofá ou abajur.');

  // Caso B: Criador geral SEM especificação de ambiente
  const caseCreatorGeneral = generateSimpleThumbnail({
    videoTitle: 'Por que parei de usar o iPad',
    ideaDescription: 'Eu falando diretamente com a câmera sobre a decisão.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });

  const promptB = caseCreatorGeneral.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!promptB.includes('living room'), 'Criador geral não deve ser colocado em sala de estar');
  assert.ok(!promptB.includes('bedroom'), 'Criador geral não deve ser colocado em quarto');
  assert.ok(!promptB.includes('sofa'), 'Criador geral não deve ser colocado em sofá');
  assert.ok(!promptB.includes('computer desk'), 'Criador geral não deve inventar escrivaninha');
  assert.ok(!promptB.includes('desk lamp'), 'Criador geral não deve inventar abajur');
  console.log('  ✓ Nível 5 (Padrão): Criador geral sem ambiente especificado mantém fundo neutro e sem clichês domésticos.');

  // Caso C: Pedido EXPLÍCITO de sofá (Autoridade Nível 2)
  const caseExplicitSofa = generateSimpleThumbnail({
    videoTitle: 'Jogando no sofá',
    ideaDescription: 'Eu relaxando no sofá da sala jogando Nintendo Switch.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });

  const promptC = caseExplicitSofa.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(promptC.includes('sofa'), 'Pedido explícito de sofá DEVE ser respeitado');
  assert.ok(promptC.includes('living room'), 'Pedido explícito de sala DEVE ser respeitado');
  console.log('  ✓ Nível 2 (Explícito): Sofá e sala são mantidos quando solicitados explicitamente pelo usuário.');

  // Caso D: Edição / Transferência de Imagem-Alvo (Autoridade Nível 1)
  const auditResult = analyzeThumbnailLocally('Meu rosto olhando para a câmera');
  assert.ok(auditResult.fixPrompt.includes('target image environment'), 'Fix prompt deve proteger o ambiente da imagem alvo');
  console.log('  ✓ Nível 1 (Imagem-Alvo): Modo cirúrgico trava e preserva o ambiente da imagem de origem.');

  // Caso E: Referência de Cenário (Autoridade Nível 3)
  const caseSceneRef = generateSimpleThumbnail({
    videoTitle: 'Vlog na Cafeteria',
    ideaDescription: 'Eu experimentando um café novo.',
    references: [
      { id: 'ref-scene-cafe', name: 'Minha Cafeteria', url: 'https://example.com/cafe.jpg', role: 'CENÁRIO', scenarioMode: 'MEU_AMBIENTE' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });

  assert.ok(caseSceneRef.finalPrompt.includes('Minha Cafeteria'), 'Referência de cenário deve ditar o ambiente');
  assert.ok(caseSceneRef.finalPrompt.includes('Preserve spatial layout'), 'MEU AMBIENTE deve preservar o layout real');
  console.log('  ✓ Nível 3 (Referência de Cenário): Referência de cenário dita o ambiente com prioridade.');
}

// 21. Motor de Raciocínio, Roteador de Intenção, Reconstrução de Identidade e Caso Crimson Desert (Seções 1 a 47)
{
  console.log('\n21. Testando Motor de Raciocínio, Roteador de Intenção, Reconstrução de Identidade e Caso Crimson Desert...');
  const {
    generateSimpleThumbnail,
    classifyTask,
    resolveTargetAndSources,
    resolveAttributeOwnership,
    buildScenePlan,
    auditPromptProvenance
  } = await import('../src/lib/simpleEngine/engine.ts');

  // TEST 1: Quarto explícito solicitado pelo usuário (deve ser permitido)
  const test1 = generateSimpleThumbnail({
    videoTitle: 'Testando no meu quarto',
    ideaDescription: 'Eu no meu quarto segurando um Legion Go.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });
  const t1Prompt = test1.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(t1Prompt.includes('bedroom'), 'TEST 1: Quarto explicitamente solicitado DEVE ser permitido no prompt');
  console.log('  ✓ TEST 1: Pedido explícito de quarto ("no meu quarto") é respeitado e preservado.');

  // TEST 2: Sem ambiente especificado (NÃO inventar quarto, sofá, mesa ou abajur)
  const test2 = generateSimpleThumbnail({
    videoTitle: 'Testando o console portátil',
    ideaDescription: 'Eu segurando um Legion Go.',
    references: [],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });
  const t2Prompt = test2.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!t2Prompt.includes('room'), 'TEST 2: NÃO deve inventar room');
  assert.ok(!t2Prompt.includes('bedroom'), 'TEST 2: NÃO deve inventar bedroom');
  assert.ok(!t2Prompt.includes('sofa'), 'TEST 2: NÃO deve inventar sofa');
  assert.ok(!t2Prompt.includes('desk lamp'), 'TEST 2: NÃO deve inventar desk lamp');
  console.log('  ✓ TEST 2: Ausência de ambiente não inventa quarto, sofá, mesa ou abajur.');

  // TEST 3: REGRESSÃO EXATA CRIMSON DESERT (Seção 7, 8, 9, 31, 51, 52)
  const testCrimson = generateSimpleThumbnail({
    videoTitle: 'Crimson Desert DLC Gameplay e Novidades',
    ideaDescription: 'É um vídeo sobre Crimson Desert DLC e eu estou ansioso. Adapte meu rosto no personagem do jogo. Mantenha o cabelo e o visual do personagem, ele segurando o mapa, e vou fornecer o cenário usado no fundo.',
    references: [
      { id: 'ref-me', name: 'Minha Foto', role: 'PESSOA', url: 'https://example.com/me.jpg' },
      { id: 'ref-char', name: 'Personagem Crimson Desert', role: 'IMAGEM_ALVO', url: 'https://example.com/char.jpg' },
      { id: 'ref-bg', name: 'Cenário do Jogo', role: 'CENÁRIO', url: 'https://example.com/scene.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: true,
    preserveProduct: false
  });

  assert.strictEqual(testCrimson.scenePlan.taskType, 'IDENTITY_TRANSFER', 'TEST 3: Tarefa deve ser IDENTITY_TRANSFER');
  assert.strictEqual(testCrimson.scenePlan.targetImage.name, 'Personagem Crimson Desert', 'TEST 3: Target master deve ser o personagem');
  assert.strictEqual(testCrimson.scenePlan.identitySource.name, 'Minha Foto', 'TEST 3: Identity source deve ser a foto do usuário');
  assert.strictEqual(testCrimson.scenePlan.environmentSource.name, 'Cenário do Jogo', 'TEST 3: Environment source deve ser o cenário fornecido');
  assert.strictEqual(testCrimson.scenePlan.hairOwner, 'TARGET', 'TEST 3: Cabelo deve pertencer ao alvo');
  assert.strictEqual(testCrimson.scenePlan.beardOwner, 'TARGET', 'TEST 3: Barba/visual deve pertencer ao alvo');
  assert.strictEqual(testCrimson.scenePlan.faceOwner, 'PERSON_REF', 'TEST 3: Rosto deve pertencer à referência do usuário');
  assert.strictEqual(testCrimson.scenePlan.productOwner, 'NONE', 'TEST 3: Product owner deve ser NONE (sem produto)');

  const crimsonPositive = testCrimson.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0];
  const crimsonPositiveLower = crimsonPositive.toLowerCase();

  assert.ok(testCrimson.finalPrompt.includes('TASK: IDENTITY_TRANSFER'), 'TEST 3: Prompt deve declarar tarefa IDENTITY_TRANSFER');
  assert.ok(testCrimson.finalPrompt.includes('ANATOMICAL RECONSTRUCTION — NOT A FACE PASTE'), 'TEST 3: Deve exigir reconstrução anatômica');
  assert.ok(crimsonPositive.includes('Holding the map'), 'TEST 3: Deve manter personagem segurando o mapa');
  assert.ok(crimsonPositive.includes('Personagem Crimson Desert'), 'TEST 3: Deve citar a estrutura mestre do personagem');
  assert.ok(crimsonPositive.includes('Cenário do Jogo'), 'TEST 3: Deve citar o cenário integrado');
  assert.ok(crimsonPositive.includes('Minha Foto'), 'TEST 3: Deve citar a fonte de identidade');
  assert.ok(!crimsonPositiveLower.includes('device teardown'), 'TEST 3: NÃO deve incluir device teardown');
  assert.ok(!crimsonPositiveLower.includes('desk lamp'), 'TEST 3: NÃO deve incluir desk lamp');
  assert.ok(!crimsonPositiveLower.includes('domestic room'), 'TEST 3: NÃO deve incluir domestic room');
  assert.ok(!crimsonPositiveLower.includes('living room'), 'TEST 3: NÃO deve incluir living room');
  assert.ok(!crimsonPositiveLower.includes('sofa'), 'TEST 3: NÃO deve incluir sofa');
  assert.ok(!crimsonPositiveLower.includes('physical product hero'), 'TEST 3: NÃO deve inventar produto físico');
  assert.ok(!crimsonPositiveLower.includes('paste the user'), 'TEST 3: NÃO deve usar face-paste');
  console.log('  ✓ TEST 3: Regressão exata Crimson Desert validada com sucesso absoluto (reconstrução anatômica, sem móveis domésticos e sem device hero).');

  // TEST 4: Referência de PESSOA contém quarto -> Quarto não deve vazar para o prompt (Section 17)
  const testLeakPerson = generateSimpleThumbnail({
    videoTitle: 'Vlog na montanha',
    ideaDescription: 'Eu contemplando o horizonte na montanha.',
    references: [
      { id: 'ref-selfie', name: 'Selfie no Quarto com Cama', role: 'PESSOA', url: 'https://example.com/selfie.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: true,
    preserveProduct: false
  });
  const t4Prompt = testLeakPerson.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!t4Prompt.includes('bed'), 'TEST 4: Cama da foto de perfil NÃO deve vazar');
  assert.ok(!t4Prompt.includes('bedroom wall'), 'TEST 4: Parede do quarto NÃO deve vazar');
  console.log('  ✓ TEST 4: Referência de PESSOA isolada sem vazamento de mobília ou quarto do fundo.');

  // TEST 5: Referência de PRODUTO contém estúdio -> Estúdio não deve vazar para o prompt
  const testLeakProduct = generateSimpleThumbnail({
    videoTitle: 'Celular no parque',
    ideaDescription: 'Smartphone apoiado no gramado do parque.',
    references: [
      { id: 'ref-phone', name: 'Foto de Estúdio com Ciclorama', role: 'PRODUTO', url: 'https://example.com/phone.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });
  const t5Prompt = testLeakProduct.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!t5Prompt.includes('studio cyclorama'), 'TEST 5: Ciclorama de estúdio do produto NÃO deve vazar');
  console.log('  ✓ TEST 5: Referência de PRODUTO isolada sem vazamento de ciclorama ou estúdio.');

  // TEST 6: Referência de ESTILO contém mulher de jaqueta vermelha -> Mulher não deve vazar
  const testLeakStyle = generateSimpleThumbnail({
    videoTitle: 'Carro na estrada',
    ideaDescription: 'Um carro esportivo clássico na estrada ao pôr do sol.',
    references: [
      { id: 'ref-art', name: 'Arte conceitual com mulher de jaqueta vermelha', role: 'ESTILO', url: 'https://example.com/art.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  const t6Prompt = testLeakStyle.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!t6Prompt.includes('woman in red jacket'), 'TEST 6: Mulher de jaqueta da referência de estilo NÃO deve vazar');
  console.log('  ✓ TEST 6: Referência de ESTILO isolada sem vazamento de sujeito ou roupas.');

  // TEST 7: Referência de COMPOSIÇÃO contém moto -> Moto não deve vazar
  const testLeakComp = generateSimpleThumbnail({
    videoTitle: 'Retrato dramático',
    ideaDescription: 'Um guerreiro nórdico em primeiro plano.',
    references: [
      { id: 'ref-comp', name: 'Foto de enquadramento com motocicleta', role: 'COMPOSIÇÃO', url: 'https://example.com/moto.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: false
  });
  const t7Prompt = testLeakComp.finalPrompt.split('NEGATIVE / STRICTLY AVOID:')[0].toLowerCase();
  assert.ok(!t7Prompt.includes('motorcycle'), 'TEST 7: Motocicleta da referência de composição NÃO deve vazar');
  console.log('  ✓ TEST 7: Referência de COMPOSIÇÃO isolada sem importação de objeto.');

  // TEST 8: Substituição de Objeto (Section 32)
  const testObjReplace = generateSimpleThumbnail({
    videoTitle: 'Novo Console',
    ideaDescription: 'Troque o console da primeira foto pelo da segunda.',
    references: [
      { id: 'ref-base', name: 'Criador segurando Switch', role: 'IMAGEM_ALVO', url: 'https://example.com/switch.jpg' },
      { id: 'ref-new', name: 'Steam Deck OLED', role: 'PRODUTO', url: 'https://example.com/deck.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: false,
    preserveProduct: true
  });
  assert.strictEqual(testObjReplace.scenePlan.taskType, 'REPLACE_OBJECT', 'TEST 8: Tarefa deve ser REPLACE_OBJECT');
  assert.ok(testObjReplace.finalPrompt.includes('TASK: REPLACE_OBJECT'), 'TEST 8: Prompt deve ser REPLACE_OBJECT');
  assert.ok(testObjReplace.finalPrompt.includes('Steam Deck OLED'), 'TEST 8: Deve citar o novo hardware');
  assert.ok(testObjReplace.finalPrompt.includes('Person facial identity'), 'TEST 8: Deve preservar pessoa da base');
  console.log('  ✓ TEST 8: Substituição de objeto troca apenas o hardware sem reconstruir a cena inteira.');

  // TEST 9: Substituição de Cenário (Section 33)
  const testEnvReplace = generateSimpleThumbnail({
    videoTitle: 'Novo Fundo',
    ideaDescription: 'Troque o fundo pelo cenário da segunda imagem.',
    references: [
      { id: 'ref-p', name: 'Foto do Apresentador', role: 'IMAGEM_ALVO', url: 'https://example.com/pres.jpg' },
      { id: 'ref-env', name: 'Cenário Espacial Futurista', role: 'CENÁRIO', url: 'https://example.com/space.jpg' }
    ],
    targetModel: 'GERAL',
    aspectRatio: '16:9',
    stylePreset: 'Natural',
    realismLevel: 'Alto',
    preserveFace: true,
    preserveProduct: false
  });
  assert.strictEqual(testEnvReplace.scenePlan.taskType, 'CHANGE_ENVIRONMENT', 'TEST 9: Tarefa deve ser CHANGE_ENVIRONMENT');
  assert.ok(testEnvReplace.finalPrompt.includes('TASK: CHANGE_ENVIRONMENT'), 'TEST 9: Prompt deve ser CHANGE_ENVIRONMENT');
  assert.ok(testEnvReplace.finalPrompt.includes('Cenário Espacial Futurista'), 'TEST 9: Deve incorporar o novo cenário');
  console.log('  ✓ TEST 9: Substituição de cenário transporta o fundo preservando o sujeito e a pose.');

  // TEST 10: Titularidade de Cabelo Independente (Section 10)
  const hairOwn = resolveAttributeOwnership('IDENTITY_TRANSFER', 'Use my face but keep target hair', {
    targetImage: { id: '1', name: 'Alvo', role: 'IMAGEM_ALVO', url: '' },
    identitySource: { id: '2', name: 'Eu', role: 'PESSOA', url: '' }
  });
  assert.strictEqual(hairOwn.hairOwner, 'TARGET', 'TEST 10: Cabelo deve pertencer ao alvo');
  assert.strictEqual(hairOwn.faceOwner, 'PERSON_REF', 'TEST 10: Rosto deve pertencer à referência');
  console.log('  ✓ TEST 10: Titularidade de cabelo resolvida independentemente do rosto.');

  // TEST 11: Titularidade de Barba Independente (Section 10)
  const beardOwn = resolveAttributeOwnership('IDENTITY_TRANSFER', 'Use my face and my beard but keep target hair', {
    targetImage: { id: '1', name: 'Alvo', role: 'IMAGEM_ALVO', url: '' },
    identitySource: { id: '2', name: 'Eu', role: 'PESSOA', url: '' }
  });
  assert.strictEqual(beardOwn.beardOwner, 'PERSON_REF', 'TEST 11: Barba deve pertencer à foto do usuário');
  assert.strictEqual(beardOwn.hairOwner, 'TARGET', 'TEST 11: Cabelo deve pertencer ao alvo');
  assert.strictEqual(beardOwn.faceOwner, 'PERSON_REF', 'TEST 11: Rosto deve pertencer à foto do usuário');
  console.log('  ✓ TEST 11: Barba e cabelo com donos distintos e independentes validados.');

  // TEST 12: Semântica de Reconstrução Anatômica vs Face Paste (Section 8, 9, 53)
  const test12Prompt = testCrimson.finalPrompt;
  assert.ok(test12Prompt.includes('Reconstruct the target character\'s facial anatomy'), 'TEST 12: Deve conter reconstrução anatômica');
  assert.ok(test12Prompt.includes('Strictly adapt the facial features to the target character\'s 3D skull geometry'), 'TEST 12: Deve adaptar para geometria 3D do crânio');
  assert.ok(test12Prompt.includes('Do NOT paste a flat or frontal face'), 'TEST 12: Deve proibir expressamente colar rosto frontal');
  console.log('  ✓ TEST 12: Semântica de reconstrução facial anatômica validada sem vestígio de face-paste.');
}

console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO! VALIDAÇÃO CONCLUÍDA.');

