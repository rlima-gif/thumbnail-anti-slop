import { ProjectData } from '@/types';
import { ANTI_SLOP_CATALOG } from '@/data/antiSlopCatalog';

export interface IntermediateDirectionSummary {
  conceito: string;
  pergunta: string;
  protagonista: string;
  composicao: string;
  contraste: string;
  oQueNaoMostrar: string[];
}

export function generateDirectionSummary(project: ProjectData): IntermediateDirectionSummary {
  const conceito = project.visualPromise.trim()
    ? project.visualPromise
    : project.videoTitle
    ? `Contar a história por trás de: "${project.videoTitle}"`
    : 'Conceito visual editorial focado em intriga e clareza imediata.';

  const pergunta = project.viewerQuestion.trim()
    ? project.viewerQuestion
    : 'O que está acontecendo aqui e por que isso importa?';

  const protagonista = `${project.protagonistType}: ${project.protagonist || 'Sujeito principal com silhueta clara e reconhecível'}. Presença estimada no quadro: ${project.protagonistPresence}%.`;

  const composicao = project.composition.trim()
    ? project.composition
    : `Enquadramento 16:9, regra dos terços com espaço negativo preservado para respiro visual e leitura mobile.`;

  const contraste = `Contraste concentrado no ponto focal primário. Paleta: ${project.palette || 'Tons neutros com acento luminoso único'}. Iluminação: ${project.lighting || 'Motivada por fonte física tangível'}.`;

  const oQueNaoMostrar = project.avoidList.slice(0, 8);
  if (oQueNaoMostrar.length === 0) {
    oQueNaoMostrar.push('Careta genérica de choque', 'Glow artificial', 'Setas vermelhas desnecessárias');
  }

  return {
    conceito,
    pergunta,
    protagonista,
    composicao,
    contraste,
    oQueNaoMostrar
  };
}

export function buildAvoidTokens(project: ProjectData): string[] {
  const set = new Set<string>();

  // Add keywords mapped from anti-slop items
  for (const avoidName of project.avoidList) {
    const item = ANTI_SLOP_CATALOG.find(
      c => c.name.toLowerCase() === avoidName.toLowerCase() || c.id === avoidName
    );
    if (item) {
      item.promptAvoidKeywords.forEach(k => set.add(k));
    } else {
      set.add(avoidName.toLowerCase());
    }
  }

  // Mode specific avoid tokens
  if (project.activeModes.includes('ROSTO_REAL')) {
    set.add('eye enlargement');
    set.add('automatic jaw slimming');
    set.add('plastic airbrushed skin');
    set.add('artificial cartoon smile');
    set.add('generic shock face');
    set.add('altered facial identity');
    set.add('floating pasted head');
  }

  if (project.activeModes.includes('GAMING')) {
    set.add('random neon glow');
    set.add('gratuitous RGB lighting everywhere');
    set.add('random floating sparks and fire');
    set.add('electricity effects');
    set.add('glowing laser eyes');
    set.add('futuristic generic city');
    set.add('fake video game HUD overlay');
    set.add('distorted gamepad buttons');
    set.add('malformed gaming console');
    set.add('floating fake corporate logos');
  }

  if (project.activeModes.includes('TECH')) {
    set.add('reinterpreted hardware geometry');
    set.add('distorted USB ports');
    set.add('mutant gadget buttons');
    set.add('impossible glossy plastic texture');
  }

  if (project.activeModes.includes('SEM_TEXTO')) {
    set.add('text');
    set.add('watermark');
    set.add('letters');
    set.add('alphanumeric characters');
    set.add('captions');
  }

  // Baseline quality safeguards
  set.add('deformed hands');
  set.add('extra fingers');
  set.add('fused objects');
  set.add('melted contours');
  set.add('unmotivated harsh rim light');
  set.add('cheap sticker cutout effect');

  return Array.from(set);
}

export function generateFinalPrompt(project: ProjectData): {
  promptText: string;
  negativeDirection: string;
} {
  const avoidTokens = buildAvoidTokens(project);

  // Extract reference decisions with roles
  const referenceLines = project.references
    .map(r => {
      const roleStr = r.roles && r.roles.length > 0 ? ` [Roles: ${r.roles.join(', ')}]` : '';
      return `${r.category} (${r.name})${roleStr}: ${r.extractedDecision}`;
    })
    .join('; ');

  // Reference Locks directives
  const lockDescriptions: Record<string, string> = {
    LOCK_FACE: 'MANDATORY: Lock facial geometry, bone structure, eye shape and authentic human asymmetry. Do not alter identity.',
    LOCK_HAIR: 'MANDATORY: Lock natural hairstyle, density, hairline and fiber texture.',
    LOCK_BEARD: 'MANDATORY: Lock facial hair styling, natural grain and grooming lines.',
    LOCK_AGE: 'MANDATORY: Preserve authentic subject age; strictly prohibit airbrush de-aging or silicone smoothing.',
    LOCK_CLOTHING: 'MANDATORY: Preserve precise garment structure, fabric weight, seamlines and authentic drape.',
    LOCK_POSE: 'MANDATORY: Lock exact physical stance, head angle, shoulder vector and gaze direction.',
    LOCK_PRODUCT_GEOMETRY: 'MANDATORY: Strictly preserve authentic industrial product geometry, bevel radii, material finishes and physical proportions.',
    LOCK_SCREEN_ASPECT: 'MANDATORY: Preserve true screen aspect ratios, bezel thickness and UI display geometry without warping.',
    LOCK_CONTROLLER_LAYOUT: 'MANDATORY: Strictly preserve physical button positions, analog sticks, trigger shapes and OEM controller layout.',
    LOCK_COMPOSITION: 'MANDATORY: Lock exact camera angle, perspective lines, framing borders and negative space distribution.',
    LOCK_BACKGROUND: 'MANDATORY: Preserve background environment scale, architectural lines and depth subordinate hierarchy.'
  };

  const activeLocks = (project.referenceLocks || []).map(l => lockDescriptions[l] || l);

  // Mode instructions
  const modeNotes: string[] = [];
  if (project.activeModes.includes('SEM_TEXTO')) {
    modeNotes.push('NO TEXT MODE: Deliver story entirely through gesture, spatial relationships, authentic material contrast, narrative object and expression. No typography.');
  }
  if (project.activeModes.includes('ROSTO_REAL')) {
    modeNotes.push('REAL FACE FIDELITY: Maintain strict facial identity, natural age, organic nose and eye geometry, authentic beard and skin pore texture, natural human asymmetry. The image must read as a photograph produced specifically for the thumbnail, never a head pasted into the thumbnail.');
  }
  if (project.activeModes.includes('GAMING')) {
    modeNotes.push('SUBTRACTIVE GAMING DIRECTION: Prioritize physically recognizable hardware, authentic matte materials, grounded game atmosphere and motivated studio or room lighting. Avoid generic esports neon clutter.');
  }
  if (project.activeModes.includes('TECH')) {
    modeNotes.push('STRICT HARDWARE INTEGRITY: Preserve true industrial design proportions, genuine tactile buttons, accurate analog controls, authentic ports and screen finishes. Do not reinterpret known hardware.');
  }
  if (project.activeModes.includes('BEFORE_AFTER')) {
    modeNotes.push('DYNAMIC CONTRAST TRANSITION: Structure comparison using spatial contrast, material state change, reflection or environmental transition rather than a crude 50/50 vertical split line.');
  }

  const promptBlocks = [
    `THUMBNAIL GOAL:\nDeliver immediate narrative intrigue and 0.5-second feed readability for a video titled "${project.videoTitle || 'Editorial Feature'}". Visual promise: ${project.visualPromise || 'Revealing the hidden truth behind the story'}.`,

    `VIEWER QUESTION:\n${project.viewerQuestion || 'What happened here and what is the hidden consequence?'}`,

    `SUBJECT:\n${project.protagonistType} protagonist: ${project.protagonist || 'Primary subject with crisp iconic silhouette'}, occupying approximately ${project.protagonistPresence}% of frame composition.${project.secondarySubject ? ` Subordinate secondary element: ${project.secondarySubject}.` : ''}`,

    `STORY MOMENT:\n${project.storyMoment || 'The critical tension moment immediately preceding the revelation; charged atmosphere with narrative weight.'}`,

    `COMPOSITION:\n16:9 widescreen YouTube thumbnail aspect ratio. ${project.composition || 'Strict rule of thirds with deliberate negative space allowing viewer eyes to settle immediately on the primary focal point'}. Clean silhouette legibility when scaled down to 120px mobile preview.`,

    `CAMERA:\n${project.camera || 'High-end cinema prime lens (50mm or 85mm) at eye-level, natural perspective without wide-angle fish-eye distortion'}.`,

    `EXPRESSION:\n${project.expression || 'Subtle, contextual and grounded human expression with authentic nuance; no exaggerated open-mouth scream or fake shock'}.`,

    `LIGHTING:\n${project.lighting || 'Motivated directional light source with authentic physical falloff (e.g. single key light from camera-left with natural shadow depth). Coherent shadows and believable reflections'}.`,

    `COLOR:\n${project.palette || 'Restrained palette: deep neutral foundations with exactly one saturated accent hue directing ocular focus to the narrative question'}. Controlled saturation throughout.`,

    `BACKGROUND:\n${project.background || 'Subordinate environment contextualizing the narrative without competing for visual acuity'}.`,

    `DEPTH:\n${project.depth || 'Optical depth of field with sharp critical focus on protagonist and gentle gradual falloff; clean figure-ground separation'}.`,

    `MATERIALS / TEXTURE:\nAuthentic physical tactile surfaces with realistic micro-texture (cotton, brushed matte metal, concrete, natural skin texture, subtle 35mm film grain).`,

    `TEXT:\n${project.activeModes.includes('SEM_TEXTO') || !project.thumbnailText.trim() ? 'NO text rendered in the image. Pure visual storytelling with reserved negative space.' : `Negative space reserved for clean post-production typography: "${project.thumbnailText}". Do not render distorted AI letterforms.`}`,

    `REFERENCE FUNCTIONS:\n${referenceLines || 'Editorial magazine cover photography, documentary lighting and premium key art composition'}.`,

    ...(activeLocks.length > 0
      ? [`PRESERVATION LOCKS (NON-NEGOTIABLE):\n${activeLocks.join('\n')}`]
      : []),

    `CHANNEL VISUAL LANGUAGE:\n${project.channelIdentity || 'Art-directed, authoritative, grounded and honest; free from disposable clickbait tropes'}. Style: ${project.visualStyle || 'High fidelity editorial documentary photography'}.`,

    `REALISM / INTEGRATION:\n${modeNotes.join(' ') || 'Organic physical integration of subject in the environment with physically coherent lighting angle and matching color temperature.'}`,

    `AVOID:\n${avoidTokens.join(', ')}.`,

    `FINAL PRIORITY:\nPrioritize a believable visual idea and immediate readability over spectacle. The thumbnail must feel intentionally art-directed rather than AI-generated.`
  ];

  const promptText = promptBlocks.join('\n\n');
  const negativeDirection = avoidTokens.join(', ');

  return { promptText, negativeDirection };
}
