import { ProjectData, ABVariant } from '@/types';
import { buildAvoidTokens } from './promptGenerator';

export function generateABVariants(project: ProjectData): ABVariant[] {
  const avoidList = buildAvoidTokens(project).slice(0, 15).join(', ');
  const title = project.videoTitle || 'A História Não Contada';

  // Variant A: PERSONAGEM (Humano / Criador / Sujeito)
  const variantA: ABVariant = {
    id: 'A',
    type: 'PERSONAGEM',
    hypothesis: 'O clique é impulsionado pela cumplicidade humana e tensão psicológica refletida no olhar de quem vivenciou o fato.',
    viewerQuestion: 'O que essa pessoa sabe ou descobriu que a deixou nesse estado de perplexidade contida?',
    protagonist: 'Pessoa em close médio (3/4 angle), postura corporal autêntica, olhar fixo em um documento ou tela fora de campo.',
    composition: 'Enquadramento fechado com o criador no terço direito e espaço negativo escuro à esquerda; iluminação suave de Rembrandt.',
    contrast: 'Pico de luz suave concentrado na face e nas têmporas, fundo 3 stops mais escuro.',
    whatChanges: 'Transfere todo o peso dramático para o rosto humano, transformando o objeto em mero reflexo contextual secundário.',
    whatRemains: 'A paleta de cores institucional do canal, o mistério central do título e a iluminação motivada sóbria.',
    prompt: [
      `[VARIANT A — CHARACTER-DRIVEN EDITORIAL THUMBNAIL]`,
      `GOAL: Express intense psychological tension for the video "${title}".`,
      `SUBJECT: Compelling authentic human character in intimate medium close-up (85mm lens at f/2.2). Contextual expression of quiet revelation and furrowed brow, zero exaggerated shock scream.`,
      `COMPOSITION: Asymmetric rule-of-thirds framing. Protagonist occupying right third, looking intently towards dramatic negative space on the left.`,
      `LIGHTING: Single soft motivated key light creating authentic Rembrandt triangle on cheek; natural physical shadow falloff into neutral backdrop.`,
      `TEXTURE: Natural skin pores, authentic hair strands, subtle 35mm film grain, tactile clothing fabric.`,
      `AVOID: ${avoidList}.`,
      `PRIORITY: Authentic human vulnerability and psychological tension over theatrical gimmicks.`
    ].join('\n')
  };

  // Variant B: OBJETO (Hardware / Produto / Item Narrativo)
  const variantB: ABVariant = {
    id: 'B',
    type: 'OBJETO',
    hypothesis: 'O clique é provocado pelo magnetismo e fetiche táctil de um objeto concreto que sintetiza o segredo ou fracasso do vídeo.',
    viewerQuestion: 'Que peça/máquina misteriosa é essa e por que ela custou tanto ou causou tanto impacto?',
    protagonist: 'O artefato físico / hardware / documento em close-up macro sobre bancada técnica, com detalhes mecânicos precisos.',
    composition: 'Enquadramento centralizado imponente ou diagonal tensa; objeto ocupando 75% da altura da tela.',
    contrast: 'Reflexo metálico especular nítido nas arestas do produto recortado contra escuridão industrial.',
    whatChanges: 'Elimina completamente rostos humanos. A autoridade e a curiosidade derivam 100% da verossimilhança do objeto.',
    whatRemains: 'A promessa temática do título, a atmosfera cinematográfica e a ausência total de poluição visual.',
    prompt: [
      `[VARIANT B — HERO OBJECT / HARDWARE INTEGRITY THUMBNAIL]`,
      `GOAL: Industrial design showcase and tactile mystery for video "${title}".`,
      `SUBJECT: Hero physical object / technical hardware as solitary protagonist, centered with commanding presence. Tactile industrial materials (brushed matte aluminum, real seams, micro-scratches, genuine physical ports).`,
      `COMPOSITION: Razor-sharp 16:9 macro framing on 100mm macro lens. Shallow depth of field (f/2.8) throwing industrial workbench into soft neutral bokeh.`,
      `LIGHTING: Low-key precision studio lighting with motivated cold overhead panel and subtle warm grazing edge light highlighting true geometric contours.`,
      `AVOID: ${avoidList}, floating badges, fake holograms, fake UI overlays.`,
      `PRIORITY: Uncompromising physical materiality and instant silhouette readability at 10% mobile scale.`
    ].join('\n')
  };

  // Variant C: SITUAÇÃO (Cena / Evento / Transformação / Espaço)
  const variantC: ABVariant = {
    id: 'C',
    type: 'SITUAÇÃO',
    hypothesis: 'O clique é despertado pelo fascínio do "lugar proibido" ou da cena após o desastre, onde o ambiente conta a história inteira.',
    viewerQuestion: 'O que aconteceu nessa sala lacrada quando as portas se fecharam?',
    protagonist: 'O ambiente em si (um laboratório abandonado, uma mesa de reunião com cadeiras caídas, um galpão vazio iluminado por um facho de luz).',
    composition: 'Plano aberto cinematográfico com grande profundidade de campo em perspectiva de ponto de fuga central de um ponto.',
    contrast: 'Facho de luz de alta intensidade cortando a penumbra e revelando apenas um detalhe crucial no centro da sala.',
    whatChanges: 'O protagonista deixa de ser uma pessoa ou objeto isolado e passa a ser o ecossistema espacial onde a história ocorreu.',
    whatRemains: 'A sobriedade de direção de arte, a paleta documental restrita e a ausência de elementos mágicos de IA.',
    prompt: [
      `[VARIANT C — NARRATIVE SITUATION / SPATIAL TENSION THUMBNAIL]`,
      `GOAL: Atmospheric environmental storytelling capturing the aftermath for "${title}".`,
      `SUBJECT: Atmospheric architectural environment with heavy narrative presence (a sealed sterile development room, long casting shadows, single illuminated workstation).`,
      `COMPOSITION: Wide cinematic 35mm composition with deep perspective leading lines converging towards a singular illuminated mystery point in the midground.`,
      `LIGHTING: Dramatic motivated volumetric beam of light cutting through dusty atmospheric gloom; rich inky blacks in the corners with zero artificial HDR boost.`,
      `AVOID: ${avoidList}, busy crowds, chaotic explosions, floating text.`,
      `PRIORITY: Cinematic spatial atmosphere that makes the viewer feel like they are trespassing on a forbidden scene.`
    ].join('\n')
  };

  return [variantA, variantB, variantC];
}

export interface ABDiversityResult {
  isDiverse: boolean;
  warning?: string;
  reasons: string[];
}

export function checkABVariantDiversity(variants: ABVariant[]): ABDiversityResult {
  const reasons: string[] = [];

  if (!variants || variants.length < 2) {
    return { isDiverse: true, reasons: [] };
  }

  // Check unique types
  const types = new Set(variants.map(v => v.type));
  if (types.size < variants.length && variants.length >= 3 && types.size === 1) {
    reasons.push('Todas as variantes compartilham a mesma categoria de sujeito (apenas variações estéticas do mesmo elemento).');
  }

  // Check hypothesis similarity
  const hypotheses = variants.map(v => v.hypothesis.toLowerCase().trim());
  const uniqueHypotheses = new Set(hypotheses);
  if (uniqueHypotheses.size < variants.length) {
    reasons.push('Há variantes com hipóteses redundantes ou idênticas.');
  }

  // Check viewerQuestion similarity
  const questions = variants.map(v => v.viewerQuestion.toLowerCase().trim());
  const uniqueQuestions = new Set(questions);
  if (uniqueQuestions.size < variants.length) {
    reasons.push('A pergunta silenciosa do espectador não foi alterada entre as versões.');
  }

  const isDiverse = reasons.length === 0;
  const warning = !isDiverse
    ? 'ESTAS VARIAÇÕES PARECEM TRÊS VERSÕES ESTÉTICAS DA MESMA HIPÓTESE. Um teste A/B autêntico deve contrapor mecanismos psicológicos diferentes (ex: Cumplicidade Humana vs. Fetiche Táctil do Objeto vs. Fascínio pelo Espaço/Cena).'
    : undefined;

  return { isDiverse, warning, reasons };
}
