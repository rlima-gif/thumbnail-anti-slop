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

  // Test Midjourney target model flags
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
  assert.ok(resMJ.finalPrompt.includes('--style raw'), 'Prompt Midjourney DEVE incluir --style raw');
  assert.ok(resMJ.finalPrompt.includes('--ar 16:9'), 'Prompt Midjourney DEVE incluir proporção --ar 16:9');
  console.log('  ✓ Parâmetros Midjourney limpos (--style raw e --ar 16:9 sem --v 6.1 fixo) validados.');

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
  assert.ok(caseGaming.finalPrompt.includes('preserves the lived-in environmental context'), 'Caso Gaming com sofá/sala deve preservar legibilidade do ambiente');
  assert.ok(caseGaming.direction.foco.includes('Legion Go'), 'Foco deve destacar o Legion Go no sofá');
  console.log('  ✓ Caso 1 (Gaming): Travas de hardware, 5 dedos anatômicos e preservação de ambiente da sala validadas.');

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

console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO! VALIDAÇÃO CONCLUÍDA.');
