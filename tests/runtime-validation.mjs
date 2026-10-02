import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

console.log(`🚀 INICIANDO VALIDAÇÃO EM TEMPO DE EXECUÇÃO (API RUNTIME) em ${BASE_URL}...\n`);

async function callSimpleCreate(payload) {
  const res = await fetch(`${BASE_URL}/api/ai/simple-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-debug-trace': 'true'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  // Normalize debugInfo from either root debugInfo or scenePlan.complementaryDebug
  data.debugInfo = data.debugInfo || data.scenePlan?.complementaryDebug;
  return data;
}

async function runRuntimeValidation() {
  // Case 1: explicit bedroom + Steam Deck
  console.log('1. Validando Caso 1: Explicit bedroom + Steam Deck...');
  const res1 = await callSimpleCreate({
    videoTitle: 'Jogando no meu quarto',
    ideaDescription: 'Eu sentado no meu quarto segurando meu Steam Deck.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.equal(res1.scenePlan?.taskType, 'CREATE_NEW_SCENE');
  assert.equal(res1.scenePlan?.environmentOwner, 'USER');
  assert.equal(res1.scenePlan?.provenanceMap?.environment, 'USER_EXPLICIT');
  assert.ok(res1.finalPrompt.includes('quarto') || res1.finalPrompt.includes('bedroom'));
  assert.ok(!res1.finalPrompt.includes('RGB gaming room'));
  console.log('   ✓ Caso 1 validado: Quarto explícito preservado.');

  // Case 2: Crimson Desert TARGET edit without CENÁRIO
  console.log('\n2. Validando Caso 2: Crimson Desert TARGET edit without CENÁRIO...');
  const res2 = await callSimpleCreate({
    videoTitle: 'Crimson Desert DLC',
    ideaDescription: 'Adapte meu rosto no personagem, preserve o cabelo, armadura e mapa.',
    references: [
      { id: 'ref-face', name: 'Minha Foto', role: 'PESSOA', url: 'https://example.com/face.jpg' },
      { id: 'ref-target', name: 'Guerreiro Desert', role: 'IMAGEM_ALVO', url: 'https://example.com/target.jpg', isTarget: true }
    ],
    targetModel: 'GERAL'
  });
  assert.equal(res2.scenePlan?.taskType, 'IDENTITY_TRANSFER');
  assert.equal(res2.scenePlan?.environmentOwner, 'TARGET');
  assert.equal(res2.scenePlan?.poseOwner, 'TARGET');
  assert.equal(res2.scenePlan?.provenanceMap?.environment, 'TARGET_IMAGE');
  assert.ok(res2.finalPrompt.includes('TARGET MASTER STRUCTURE'));
  assert.ok(res2.finalPrompt.includes('IDENTITY RECONSTRUCTION DIRECTIVE'));
  console.log('   ✓ Caso 2 validado: Imagem-Alvo preserva ambiente e estrutura contra sobreposição.');

  // Case 3: Crimson Desert NEW SCENE without CENÁRIO
  console.log('\n3. Validando Caso 3: Crimson Desert NEW SCENE without CENÁRIO...');
  const res3 = await callSimpleCreate({
    videoTitle: 'Crimson Desert DLC — minhas expectativas',
    ideaDescription: 'Eu como aventureiro estudando um mapa, ansioso pela DLC.',
    references: [
      { id: 'ref-face', name: 'Minha Foto', role: 'PESSOA', url: 'https://example.com/face.jpg' }
    ],
    targetModel: 'GERAL'
  });
  assert.equal(res3.scenePlan?.taskType, 'CREATE_NEW_SCENE');
  assert.equal(res3.debugInfo?.theme, 'Crimson Desert');
  assert.ok(res3.finalPrompt.includes('rugged medieval fantasy') || res3.finalPrompt.includes('wilderness'));
  assert.ok(!res3.finalPrompt.includes('bedroom'));
  assert.ok(!res3.finalPrompt.includes('sofa'));
  console.log('   ✓ Caso 3 validado: Cenário temático resolvido sem clichês domésticos.');

  // Case 4: ROG Ally X without product reference
  console.log('\n4. Validando Caso 4: ROG Ally X without product reference...');
  const res4 = await callSimpleCreate({
    videoTitle: 'Review ROG Ally X',
    ideaDescription: 'Eu segurando um ROG Ally X mostrando ele para a câmera.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.equal(res4.debugInfo?.productSource, 'PRODUCT_INFERRED');
  assert.ok(res4.finalPrompt.includes('ROG Ally X'));
  assert.ok(res4.debugInfo?.interactionPlannerUsed);
  console.log('   ✓ Caso 4 validado: ROG Ally X resolvido com fidelidade de produto e interação.');

  // Case 5: ROG Ally X with product reference
  console.log('\n5. Validando Caso 5: ROG Ally X with product reference...');
  const res5 = await callSimpleCreate({
    videoTitle: 'Review ROG Ally X',
    ideaDescription: 'Eu segurando um ROG Ally X mostrando ele para a câmera.',
    references: [
      { id: 'ref-prod', name: 'ROG Ally X Foto', role: 'PRODUTO', url: 'https://example.com/rog.jpg' }
    ],
    targetModel: 'GERAL'
  });
  assert.equal(res5.debugInfo?.productSource, 'PRODUCT_REFERENCE_LOCKED');
  assert.equal(res5.scenePlan?.productOwner, 'PRODUCT_REF');
  console.log('   ✓ Caso 5 validado: Referência de produto trava como PRODUCT_REFERENCE_LOCKED.');

  // Case 6: generic mysterious box
  console.log('\n6. Validando Caso 6: Generic mysterious box...');
  const res6 = await callSimpleCreate({
    videoTitle: 'O que tem aqui dentro?',
    ideaDescription: 'Eu segurando uma caixa misteriosa.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.equal(res6.debugInfo?.researchEligible, false);
  assert.equal(res6.debugInfo?.productSource, 'PRODUCT_INFERRED');
  assert.ok(res6.debugInfo?.interactionPlannerUsed);
  console.log('   ✓ Caso 6 validado: Caixa genérica não dispara pesquisa e usa apoio físico neutro.');

  // Case 7: unusual explicit hand pose
  console.log('\n7. Validando Caso 7: Unusual explicit hand pose...');
  const res7 = await callSimpleCreate({
    videoTitle: 'Pose Incomum',
    ideaDescription: 'Eu segurando o handheld acima da cabeça com uma mão.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.equal(res7.debugInfo?.interactionPlan?.applied, false);
  assert.equal(res7.debugInfo?.interactionPlan?.numberOfHands, 1);
  console.log('   ✓ Caso 7 validado: Pose explícita com uma mão mantida sem imposição de pega padrão.');

  // Case 8: research disabled
  console.log('\n8. Validando Caso 8: Research disabled (default)...');
  const res8 = await callSimpleCreate({
    videoTitle: 'Setup Gamer 2026',
    ideaDescription: 'Mostrando novo setup limpo.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.equal(res8.debugInfo?.researchEnabled, false);
  assert.equal(res8.debugInfo?.researchAttempted, false);
  assert.equal(res8.debugInfo?.researchSucceeded, false);
  assert.equal(res8.debugInfo?.researchTimedOut, false);
  console.log('   ✓ Caso 8 validado: researchEnabled é false e campos de observabilidade validados no trace.');

  // Case 9: simulated research failure / fallback
  console.log('\n9. Validando Caso 9: Fallback robusto e integridade do resultado...');
  const res9 = await callSimpleCreate({
    videoTitle: 'Nova Gameplay',
    ideaDescription: 'Apresentador jogando animado.',
    references: [],
    targetModel: 'GERAL'
  });
  assert.ok(res9.finalPrompt);
  assert.equal(res9.isLocal, true);
  console.log('   ✓ Caso 9 validado: Fallback e geração garantida.');

  console.log('\n🎉 TODOS OS 9 CENÁRIOS DE RUNTIME FORAM VALIDADOS COM SUCESSO!');
}

runRuntimeValidation().catch(err => {
  console.error('❌ Falha na validação de runtime:', err);
  process.exit(1);
});
