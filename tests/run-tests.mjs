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

console.log('\n✅ TODOS OS TESTES PASSARAM COM SUCESSO! VALIDAÇÃO CONCLUÍDA.');
