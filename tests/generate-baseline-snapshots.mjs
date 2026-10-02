import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { generateSimpleThumbnail } = await import('../src/lib/simpleEngine/engine.ts');

const TARGET_MODELS = [
  'GERAL',
  'OPENAI_GPT_IMAGE_2_5_SUNBURST',
  'GOOGLE_NANO_BANANA_2',
  'MIDJOURNEY_V8_2',
  'FLUX_2_MAX'
];

const BASELINE_CASES = [
  {
    id: 'case_1_explicit_bedroom_steamdeck',
    name: '1. Explicit bedroom + Steam Deck',
    input: {
      videoTitle: 'Jogando no meu quarto',
      ideaDescription: 'Eu sentado no meu quarto segurando meu Steam Deck.',
      references: []
    }
  },
  {
    id: 'case_2_identity_transfer_crimson_desert',
    name: '2. Identity transfer with TARGET (Crimson Desert-style case)',
    input: {
      videoTitle: 'A Jornada no Deserto Carmesim',
      ideaDescription: 'Meu rosto adaptado no guerreiro segurando o mapa mágico',
      references: [
        { id: 'ref-face', name: 'Minha Foto', role: 'PESSOA', url: 'https://example.com/face.jpg' },
        { id: 'ref-master', name: 'Guerreiro Desert', role: 'IMAGEM_ALVO', url: 'https://example.com/target.jpg', isTarget: true }
      ]
    }
  },
  {
    id: 'case_3_produto_reference_present',
    name: '3. PRODUTO reference present',
    input: {
      videoTitle: 'Unboxing Gamer',
      ideaDescription: 'Mostrando o novo headset gamer na mão.',
      references: [
        { id: 'ref-prod', name: 'Headset Pro X', role: 'PRODUTO', url: 'https://example.com/headset.jpg' }
      ]
    }
  },
  {
    id: 'case_4_explicit_unusual_hand_pose',
    name: '4. Explicit unusual hand pose',
    input: {
      videoTitle: 'Pose Incomum',
      ideaDescription: 'Eu segurando o handheld acima da cabeça com uma mão.',
      references: []
    }
  },
  {
    id: 'case_5_object_replacement',
    name: '5. Object replacement',
    input: {
      videoTitle: 'Novo Console',
      ideaDescription: 'Troque o console da primeira foto pelo da segunda.',
      references: [
        { id: 'ref-base', name: 'Foto Base', role: 'IMAGEM_ALVO', url: 'https://example.com/base.jpg', isTarget: true },
        { id: 'ref-prod', name: 'Controle Pro', role: 'PRODUTO', url: 'https://example.com/controller.jpg' }
      ]
    }
  },
  {
    id: 'case_6_explicit_cenario_reference',
    name: '6. Explicit CENÁRIO reference',
    input: {
      videoTitle: 'Gravação na Floresta',
      ideaDescription: 'Eu explicando o projeto no cenário da foto.',
      references: [
        { id: 'ref-env', name: 'Floresta Tropical', role: 'CENÁRIO', url: 'https://example.com/forest.jpg' }
      ]
    }
  },
  {
    id: 'case_7_generic_creation_no_references',
    name: '7. Generic creation with no references',
    input: {
      videoTitle: 'Dicas de Produtividade',
      ideaDescription: 'Criador olhando para a câmera com expressão confiante e minimalista.',
      references: []
    }
  },
  {
    id: 'case_8a_anti_slop_gaming_no_room',
    name: '8a. Anti-slop gaming portable without domestic room cliches',
    input: {
      videoTitle: 'O Futuro dos Portáteis',
      ideaDescription: 'Criador segurando console portátil focado na tela.',
      references: []
    }
  },
  {
    id: 'case_8b_anti_slop_natural_portrait',
    name: '8b. Anti-slop natural portrait without beauty filter or neon',
    input: {
      videoTitle: 'Entrevista Exclusiva',
      ideaDescription: 'Retrato autêntico de um especialista falando, sem filtros artificiais.',
      references: []
    }
  }
];

const snapshots = {};

for (const c of BASELINE_CASES) {
  snapshots[c.id] = {
    id: c.id,
    name: c.name,
    input: c.input,
    models: {}
  };

  for (const model of TARGET_MODELS) {
    const fullInput = {
      ...c.input,
      targetModel: model,
      aspectRatio: '16:9',
      stylePreset: 'Natural',
      realismLevel: 'Alto',
      approachIndex: 0
    };

    const res = generateSimpleThumbnail(fullInput);

    snapshots[c.id].models[model] = {
      targetModel: model,
      taskType: res.scenePlan?.taskType,
      environmentOwner: res.scenePlan?.environmentOwner,
      productOwner: res.scenePlan?.productOwner,
      poseOwner: res.scenePlan?.poseOwner,
      hairOwner: res.scenePlan?.hairOwner,
      beardOwner: res.scenePlan?.beardOwner,
      provenanceMap: res.scenePlan?.provenanceMap,
      change: res.scenePlan?.change,
      preserve: res.scenePlan?.preserve,
      finalPrompt: res.finalPrompt,
      outputMetadata: res.outputMetadata
    };
  }
}

const outPath = path.join(__dirname, 'fixtures', 'baseline-snapshots.json');
fs.writeFileSync(outPath, JSON.stringify(snapshots, null, 2), 'utf8');
console.log(`Generated baseline snapshots for ${BASELINE_CASES.length} cases across ${TARGET_MODELS.length} models to ${outPath}`);
