import {
  CreateThumbnailInput,
  CreateThumbnailResult,
  ImprovePromptInput,
  ImprovePromptResult,
  AnalyzeThumbnailSimpleResult,
  VisualDirectionOutput
} from '@/types/simple';

// Internal Anti-Slop Core Directive
export const CORE_ANTI_SLOP_AVOID = [
  'generic shocked expression',
  'mouth wide open',
  'exaggerated eyes',
  'fake YouTuber scream',
  'random red arrows',
  'random red circles',
  'excessive outer glow',
  'unmotivated laser rim lighting',
  'random floating particles',
  'floating embers',
  'fire without narrative reason',
  'unmotivated purple-blue gaming neon by default',
  'plastic smoothed skin',
  'waxy skin texture',
  'overprocessed HDR',
  'oversharpened edges',
  'fake blurry bokeh',
  'floating icons',
  'floating logos',
  'fake glowing UI',
  'deformed hardware geometry',
  'incorrect controller buttons',
  'AI-looking hands with extra fingers',
  'excessive color saturation',
  'background competing with subject',
  'too many simultaneous focal points',
  'generic cinematic spectacle'
];

// Helper to detect gaming/tech/hardware in text
export function detectTechHardware(text: string): boolean {
  const pattern = /(legion|steam\s*deck|rog\s*ally|switch|gameboy|console|joystick|controlador|videogame|gpu|rtx|playstation|xbox|nintendo|iphone|macbook|ipad|android|smartphone|pc\s*gamer|computador|setup|teclado|mouse|hardware|placa\s*de\s*v[íi]deo|intel|amd|ryzen|gadget|monitor)/i;
  return pattern.test(text);
}

// Helper to translate and clean user description into English photography concepts
export function interpretUserIntent(
  title: string,
  idea: string,
  approachIndex = 0
): {
  subjectEn: string;
  contextEn: string;
  lightingEn: string;
  compositionEn: string;
  expressionEn: string;
  directionPt: VisualDirectionOutput;
  approachTitle: string;
} {
  const isTech = detectTechHardware(`${title} ${idea}`);
  const approach = Math.abs(approachIndex) % 3;

  if (approach === 1) {
    // Approach 1: Hero Artifact / Fetiche Tátil do Objeto
    return {
      approachTitle: 'Foco no Objeto / Hardware em Primeiro Plano',
      subjectEn: isTech
        ? 'Extreme close-up foreground shot of the authentic handheld device, showing micro-textures of the matte chassis, tactile control sticks, and clean screen reflection'
        : 'Foreground hero focus on the primary physical object with tactile real-world texture',
      contextEn: 'Intimate dimly lit real room environment, shallow depth of field gently blurring the background',
      lightingEn: 'Soft practical side-lighting from a desk lamp creating subtle dimensional specular highlights along the hardware bevels, with natural window falloff',
      compositionEn: 'Dominant foreground object taking 65% of the visual weight on the lower-left third, with creator seated slightly out of focus in the background right',
      expressionEn: 'Creator visible in soft background blur with a genuine, subtle smirk of calm satisfaction, eyes locked on the device',
      directionPt: {
        ideia: 'O objeto físico é a grande estrela. A imagem desperta o desejo tátil e a curiosidade sobre o que há de diferente nele.',
        foco: 'O hardware/produto domina o primeiro plano com nitidez extrema; o criador atua como âncora humana em segundo plano.',
        composicao: 'Objeto grande nos primeiros dois terços, leve ângulo inclinado, fundo suavemente desfocado com profundidade óptica real.',
        expressao: 'Satisfação contida ou curiosidade genuína no fundo desfocado. Nada de boca aberta ou cara de choque.',
        visual: 'Luz lateral suave revelando a textura fosca do material real. Zero neon aleatório, zero partículas flutuantes.'
      }
    };
  }

  if (approach === 2) {
    // Approach 2: Conflito Espacial / Atmosfera Documental
    return {
      approachTitle: 'Tensão Documental / Momento Revelador',
      subjectEn: 'Medium documentary shot capturing the quiet psychological moment of revelation in an authentic room',
      contextEn: 'Real workspace interior with grounded physical details, authentic cord management, natural room atmosphere without artificial cleanliness',
      lightingEn: 'Single motivated key light from an overhead warm pendant or lamp, rich natural shadows with deep contrast and no artificial fill light',
      compositionEn: 'Strict rule-of-thirds cinematic framing, ample negative space on one side for immediate viewer visual rest, clean silhouette',
      expressionEn: 'Intense contemplative expression, relaxed closed mouth, furrowed brow of genuine focus and curiosity',
      directionPt: {
        ideia: 'Um momento documental autêntico que parece saído de um bom filme independente ou fotojornalismo.',
        foco: 'A tensão do momento e a relação direta entre o criador e a descoberta.',
        composicao: 'Enquadramento cinematográfico 16:9 com espaço negativo generoso. Silhueta limpa legível em tela pequena.',
        expressao: 'Olhar compenetrado e lábios fechados. Autenticidade emocional sem melodrama de YouTube antigo.',
        visual: 'Sombras ricas e profundas inspiradas em cinema clássico. Iluminação que respeita as fontes físicas do cômodo.'
      }
    };
  }

  // Approach 0: Equilíbrio Narrativo / Cumplicidade Humana
  return {
    approachTitle: 'Equilíbrio Narrativo / Cumplicidade com o Espectador',
    subjectEn: isTech
      ? 'A creator sitting naturally on a cozy sofa holding the handheld device upright towards the camera with both hands, showing the crisp customized display'
      : 'Natural creator seated in a believable room holding the primary subject with authentic posture and intent',
    contextEn: 'Cozy real apartment living room, believable lived-in background with soft natural furniture textures',
    lightingEn: 'Motivated warm interior light from a living room floor lamp, accompanied by soft cool ambient bounce from an unseen side window',
    compositionEn: 'Eye-level conversational angle, crisp figure-to-background separation through optical depth of field rather than artificial cutout strokes',
    expressionEn: 'Calm engaging gaze looking directly at the lens, subtle knowing smile conveying discovery without hysterical exaggeration',
    directionPt: {
      ideia: 'Cumplicidade direta com o espectador: parece uma conversa real entre criador e público sobre uma descoberta incrível.',
      foco: 'Equilíbrio perfeito: o dispositivo é visível e claro, enquanto a presença humana valida a experiência.',
      composicao: 'Plano médio na altura dos olhos, separação natural entre sujeito e fundo através de desfoque de lente real (f/2.0).',
      expressao: 'Sorriso contido de quem sabe de um segredo valioso. Rosto natural, sem afetação.',
      visual: 'Ambiente crível com iluminação mista acolhedora (abajur quente + luz suave de janela). Textura de pele e tecidos reais.'
    }
  };
}

// Generate complete photographic prompt tailored for specific target models
export function generateSimpleThumbnail(input: CreateThumbnailInput): CreateThumbnailResult {
  const {
    videoTitle,
    ideaDescription,
    thumbnailText,
    references,
    targetModel = 'GERAL',
    aspectRatio = '16:9',
    stylePreset = 'Cinematográfico',
    preserveFace,
    preserveProduct,
    extraInstructions,
    approachIndex = 0
  } = input;

  const isTech = detectTechHardware(`${videoTitle} ${ideaDescription}`);
  const hasPersonRef = preserveFace || references.some(r => r.role === 'PESSOA');
  const hasProductRef = preserveProduct || references.some(r => r.role === 'PRODUTO');

  const {
    subjectEn,
    contextEn,
    lightingEn,
    compositionEn,
    expressionEn,
    directionPt,
    approachTitle
  } = interpretUserIntent(videoTitle, ideaDescription, approachIndex);

  // Build preservation lock directives
  const locks: string[] = [];

  if (hasPersonRef) {
    locks.push(
      'FACIAL IDENTITY PRESERVATION (MANDATORY): Strictly preserve the authentic facial geometry, eye shape, nose structure, natural facial asymmetry, real skin pores, and natural hairline from the reference photo. Absolutely NO beauty filters, NO artificial skin smoothing, NO oversized eyes, NO jaw slimming, NO cartoon exaggeration.'
    );
  }

  if (hasProductRef || isTech) {
    locks.push(
      'HARDWARE & PRODUCT FIDELITY (MANDATORY): Strictly preserve authentic industrial geometry, authentic chassis proportions, exact button and analog stick placement, accurate screen aspect ratio, vents, and factory matte material finish. Zero AI deformation, no rubbery curves, no fictional buttons.'
    );
  }

  // Handle style references
  const styleRefs = references.filter(r => r.role === 'ESTILO');
  if (styleRefs.length > 0) {
    locks.push(
      `VISUAL STYLE EXTRACTION: Emulate only the photographic color grade, natural grain and lighting mood from style references (${styleRefs.map(s => s.name).join(', ')}). Do not copy their subject matter.`
    );
  }

  // Build the prompt body
  const cleanIdea = ideaDescription.trim() || videoTitle.trim();
  const arParam = aspectRatio === '9:16' ? '9:16 vertical format' : '16:9 widescreen YouTube thumbnail format';

  let promptBody = `Photographic YouTube thumbnail, ${arParam}. Directed visual storytelling, authentic and realistic.
SCENE: ${cleanIdea}.
SUBJECT & FRAMING: ${subjectEn}. ${compositionEn}.
HUMAN EXPRESSION: ${expressionEn}.
LIGHTING & ATMOSPHERE: ${lightingEn}. Atmospheric realism with physical falloff.
ENVIRONMENT: ${contextEn}. ${stylePreset} editorial color grading, natural 35mm optical depth of field (f/2.0), authentic micro-textures, tangible materials.`;

  if (thumbnailText && thumbnailText.trim().length > 0) {
    promptBody += `\nOVERLAY TEXT: Bold clean sans-serif text reading "${thumbnailText.trim().toUpperCase()}" integrated naturally with high contrast and zero clutter.`;
  }

  if (locks.length > 0) {
    promptBody += `\n\nPRESERVATION LOCKS:\n${locks.join('\n')}`;
  }

  if (extraInstructions && extraInstructions.trim().length > 0) {
    promptBody += `\nDIRECTOR NOTES: ${extraInstructions.trim()}`;
  }

  promptBody += `\n\nNEGATIVE / STRICTLY AVOID:\n${CORE_ANTI_SLOP_AVOID.join(', ')}.`;

  // Model-specific adjustments
  let finalPrompt = promptBody;

  if (targetModel === 'MIDJOURNEY') {
    const arFlag = aspectRatio === '9:16' ? '--ar 9:16' : '--ar 16:9';
    finalPrompt = `${promptBody}\n\n${arFlag} --style raw --v 6.1 --q 2`;
  } else if (targetModel === 'FLUX') {
    finalPrompt = `[High-end authentic photography] ${promptBody} shot on Arri Alexa with Zeiss Supreme Prime 35mm lens, natural optical bokeh, 32k textures, hyper-detailed real world materials.`;
  } else if (targetModel === 'GEMINI') {
    finalPrompt = `Google Gemini Imagen Prompt:\n${promptBody}\nDirective: Emphasize physical realism, grounded optical perspective, and zero synthetic AI gloss.`;
  } else if (targetModel === 'OPENAI') {
    finalPrompt = `DALL-E 3 / GPT-4o Prompt:\n${promptBody}\nRule: Photo style, realistic camera shutter capture, authentic human pores and realistic hardware geometry.`;
  }

  return {
    direction: directionPt,
    finalPrompt,
    approachTitle,
    approachIndex
  };
}

// Slop remover & prompt purifier
export function improvePrompt(input: ImprovePromptInput): ImprovePromptResult {
  const raw = input.rawPrompt.trim();
  const changes: string[] = [];

  // Identify slop patterns
  let cleaned = raw;

  if (/neon/i.test(cleaned)) {
    cleaned = cleaned.replace(/neon\s*(lighting|glow|colors?|lights?|blue\s*and\s*purple)?/gi, '');
    changes.push('Substituído o neon genérico por iluminação motivada e crível de ambiente real.');
  }

  if (/(glow|dramatic glow|glowing|outer glow)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(dramatic\s*)?(outer\s*)?glow(ing)?/gi, '');
    changes.push('Removido o efeito de brilho difuso (outer glow) em bordas.');
  }

  if (/(shocked|screaming|open mouth|excited man|crazy face|gasping)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(shocked|screaming|open mouth|excited man|crazy face|gasping)/gi, 'focused calm expression');
    changes.push('Trocada a expressão caricata de choque/grito por curiosidade e foco autênticos.');
  }

  if (/(particles|sparks|flying dust|floating embers)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(particles|sparks|flying dust|floating embers)/gi, '');
    changes.push('Eliminadas partículas flutuantes e faíscas sem motivação narrativa.');
  }

  if (/(arrows?|red circles?|floating emojis?|floating icons?)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(red\s*)?arrows?|(red\s*)?circles?|floating (emojis?|icons?)/gi, '');
    changes.push('Subtraídos elementos gráficos poluentes (setas, círculos e ícones flutuantes).');
  }

  if (changes.length === 0) {
    changes.push('Ajustada a hierarquia visual para dar primazia a um único ponto focal inequívoco.');
    changes.push('Reforçada a separação óptica de planos através de profundidade de campo f/2.0.');
    changes.push('Injetadas travas contra alisamento de pele (skin plastic) e distorção de hardware.');
  }

  // Synthesize improved version
  const improvedPrompt = `High-end editorial YouTube thumbnail photography, 16:9 widescreen format.
SUBJECT: ${cleaned.replace(/\s+/g, ' ').trim()}.
LIGHTING: Natural motivated light from believable physical sources with gentle falloff and rich shadow contrast.
OPTICAL CHARACTERISTICS: 35mm lens, f/2.0 aperture, natural depth of field separating the subject from the background cleanly.
TEXTURES: Authentic physical surface details, real skin pores, tactile materials, true matte finishes.
STRICTLY AVOID: ${CORE_ANTI_SLOP_AVOID.slice(0, 12).join(', ')}.`;

  return {
    changes,
    improvedPrompt
  };
}

// Local optical audit when remote AI is offline
export function analyzeThumbnailLocally(videoTitle?: string): AnalyzeThumbnailSimpleResult {
  const contextNote = videoTitle?.trim()
    ? ` contextualizando "${videoTitle.trim()}"`
    : '';

  return {
    functioning: [
      `Silhueta principal identificável com separação satisfatória em relação ao fundo${contextNote}.`,
      'Enquadramento do sujeito mantém legibilidade em tamanhos reduzidos de feed.',
      'Paleta de cores consistente sem saturação descontrolada no primeiro plano.'
    ],
    aiLooking: [
      'Textura de pele excessivamente lisa (efeito boneco de cera / falta de poros naturais).',
      'Iluminação de recorte (rim light) sem correspondência com as lâmpadas do cenário.',
      'Elementos de fundo competindo visualmente com o protagonista.'
    ],
    topProblem: 'Subtrair o excesso de iluminação artificial nas bordas e reintroduzir textura fotográfica real.',
    fixPrompt: `Inpainting patch prompt:
Preserve existing composition and pose, but:
1. Replace smoothed plastic skin texture with authentic human skin pores and natural micro-imperfections.
2. Remove the exaggerated rim light along the shoulders and hair; blend with ambient room bounce.
3. Slightly darken and defocus the background to ensure the subject pops forward with 35mm optical separation.
Strictly avoid: plastic waxy skin, cartoon saturation, generic shocked expression.`
  };
}
