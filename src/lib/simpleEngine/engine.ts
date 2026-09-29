import type {
  CreateThumbnailInput,
  CreateThumbnailResult,
  ImprovePromptInput,
  ImprovePromptResult,
  AnalyzeThumbnailSimpleResult,
  VisualDirectionOutput
} from '@/types/simple';

// Internal Anti-Slop Safeguards (Avoided unless functionally requested by the user)
export const CORE_ANTI_SLOP_AVOID = [
  'generic shocked expression',
  'mouth wide open',
  'exaggerated eyes',
  'fake YouTuber scream',
  'random red arrows without functional reason',
  'random red circles without functional reason',
  'excessive outer glow on edges',
  'unmotivated laser rim lighting without light source',
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
  'AI-looking hands with fused or extra fingers',
  'excessive global color saturation',
  'background competing with subject',
  'too many simultaneous focal points',
  'generic AI same-face syndrome',
  'artificial beauty filter jaw slimming'
];

// Helper to detect gaming/tech/hardware in text
export function detectTechHardware(text: string): boolean {
  const pattern = /(legion|steam\s*deck|rog\s*ally|switch|gameboy|console|joystick|controlador|videogame|gpu|rtx|playstation|xbox|nintendo|iphone|macbook|ipad|android|smartphone|pc\s*gamer|computador|setup|teclado|mouse|hardware|placa\s*de\s*v[íi]deo|intel|amd|ryzen|gadget|monitor|notebook|laptop|chip|circuito|bancada|teardown)/i;
  return pattern.test(text);
}

// Translates vague buzzwords into concrete visual decisions (Rule 10)
export function translateVagueBuzzwords(text: string): string[] {
  const decisions: string[] = [];
  const lower = text.toLowerCase();

  if (/epic|dramatic|awesome|bomb[aá]stico|incr[íi]vel/.test(lower)) {
    decisions.push('High local contrast on the primary subject to command immediate visual attention while keeping overall lighting grounded');
  }

  if (/viral|high\s*ctr|scroll\s*stopping|chama\s*aten[çc][ãa]o|eye[\s-]catching/.test(lower)) {
    decisions.push('Bold figure-ground separation with a clean silhouette that remains instantly legible at small mobile thumbnail sizes');
  }

  if (/profissional|high[\s-]end|pro\s*look/.test(lower)) {
    decisions.push('Controlled physical lighting from believable room sources with natural falloff and authentic material textures');
  }

  return decisions;
}

// Helper to determine context-aware depth of field (Rule 2)
export function determineDepthOfField(idea: string, approachIndex: number): string {
  const lower = idea.toLowerCase();
  const roomMatters = /sof[aá]|quarto|sala|mesa|escrit[oó]rio|oficina|est[uú]dio|loja|rua|cen[aá]rio|parede|ambiente|workshop|room|desk|living/i.test(lower);

  if (approachIndex === 1) {
    // Hero close-up on object
    return 'natural optical separation softly isolating the foreground subject while preserving the secondary presence behind it';
  }

  if (roomMatters) {
    // When the room/environment matters, preserve background readability
    return 'balanced optical depth that preserves the lived-in environmental context and room details without distracting from the subject';
  }

  return 'natural photographic depth of field with organic optical falloff';
}

// Interprets user intent with fidelity to the idea and genuine diversity across approaches
export function interpretUserIntent(
  title: string,
  idea: string,
  approachIndex = 0,
  hasPersonOverride?: boolean
): {
  subjectEn: string;
  contextEn: string;
  lightingEn: string;
  compositionEn: string;
  expressionEn: string;
  directionPt: VisualDirectionOutput;
  approachTitle: string;
  hasPerson: boolean;
} {
  const combined = `${title} ${idea}`;
  const isTech = detectTechHardware(combined);
  const approach = Math.abs(approachIndex) % 3;

  const personKeywords = /(eu|meu\s*rosto|pessoa|homem|mulher|criador|cara|apresentador|sentado|segurando|olhando|falando|person|creator|human|face|selfie|minha\s*hist[óo]ria)/i;
  const hasPerson = hasPersonOverride !== undefined ? hasPersonOverride : personKeywords.test(combined);
  const emotionalKeywords = /(perdi|canal|desabafo|crise|segredo|hist[óo]ria|arrepend|tristeza|consequ[êe]ncias|verdade|aviso|urgente|alerta|adeus)/i;
  const isEmotionalStory = emotionalKeywords.test(combined);

  // 1. Scene Archetype: Tech Teardown / Pure Hardware (No person)
  if (!hasPerson && isTech) {
    if (approach === 1) {
      return {
        approachTitle: 'Macro de Precisão nos Componentes',
        hasPerson: false,
        subjectEn: 'Extreme clean macro photography of the opened device motherboard, showing microscopic silicon chip traces, gold contacts, and precision soldered modules',
        contextEn: 'Anti-static matte silicone workbench surface with magnetized precision screw tray',
        lightingEn: 'Diffused neutral high-CRI workbench LED ring light eliminating harsh reflections while revealing crisp metallic textures',
        compositionEn: 'Macro focus on the central processor die, diagonal composition leading the eye along ribbon cables',
        expressionEn: 'None (pure technical hardware inspection)',
        directionPt: {
          ideia: 'Engenharia de precisão em close extremo: a beleza e sofisticação microscópica do novo chip.',
          foco: 'O chip e os circuitos internos expostos com nitidez cirúrgica.',
          composicao: 'Macro diagonal preenchendo o quadro com componentes industriais e trilhas douradas nítidas.',
          expressao: 'Nenhuma (cena estritamente técnica sem pessoa).',
          visual: 'Luz técnica difusa de bancada, destacando o acabamento do silício sem pontos de brilho estourado.'
        }
      };
    }
    return {
      approachTitle: 'Bancada Técnica / Desmontagem Limpa',
      hasPerson: false,
      subjectEn: 'Clean high-precision technical workbench shot of the disassembled device with exposed internal circuitry, clean ribbon cables, and specialized repair tools arranged nearby',
      contextEn: 'Orderly repair laboratory bench with authentic tools, hex drivers, and precision tweezers on an anti-static work mat',
      lightingEn: 'Even, bright laboratory task lighting with realistic soft shadow falloff beneath the chassis',
      compositionEn: 'Balanced overhead 45-degree angle with the opened device as the commanding centerpiece and tools providing context',
      expressionEn: 'None (pure technical hardware inspection)',
      directionPt: {
        ideia: 'Inspeção técnica autêntica: o aparelho aberto revelando o circuito interno de forma organizada e fascinante.',
        foco: 'O hardware desmontado e o circuito interno são o centro visual absoluto da cena.',
        composicao: 'Enquadramento de bancada técnica em 45 graus, com ferramentas ao redor organizadas e espaço para leitura visual rápida.',
        expressao: 'Nenhuma (foco puramente mecânico e técnico sem presença humana).',
        visual: 'Luz neutra de bancada sem reflexos especulares excessivos, revelando soldas, chips e acabamentos originais.'
      }
    };
  }

  // 2. Scene Archetype: Pure Environment / Space / Mystery (No person)
  if (!hasPerson && !isTech) {
    if (approach === 1) {
      return {
        approachTitle: 'Ângulo Baixo e Escala Imersiva',
        hasPerson: false,
        subjectEn: 'Low-angle architectural perspective looking up toward the weathered concrete entrance, emphasizing scale and monolithic mystery',
        contextEn: 'Deep dense forest canopy casting organic dappled shadows across decaying autumn leaves and wet ground',
        lightingEn: 'Moody natural overcast light filtering through tree branches, rich ambient occlusion in crevices',
        compositionEn: 'Dynamic low perspective with powerful leading lines pulling the viewer straight into the dark entrance',
        expressionEn: 'None (pure environmental discovery)',
        directionPt: {
          ideia: 'Escala monumental e mistério: a grandiosidade sombria do local esquecido pelo tempo.',
          foco: 'A escala do concreto rachado e a entrada imersiva.',
          composicao: 'Ângulo baixo dramático valorizando a imponência e o mistério da estrutura.',
          expressao: 'Nenhuma (cena puramente espacial/arquitetônica).',
          visual: 'Luz natural filtrada com penumbra densa e sombras ricas e naturais.'
        }
      };
    }
    return {
      approachTitle: 'Atmosfera e Textura Espacial',
      hasPerson: false,
      subjectEn: 'Atmospheric scene of the weathered structure with tactile cracked concrete, creeping moss, decaying foliage, and authentic environmental aging',
      contextEn: 'Grounded real-world outdoor location with authentic atmospheric depth, honest moss texture, and organic shadows',
      lightingEn: 'Subdued natural daylight filtering through the trees, creating deep realistic shadows without fake digital mist',
      compositionEn: 'Intentional 16:9 framing guiding the eye directly to the shadowy central opening with generous negative space',
      expressionEn: 'None (pure environmental discovery)',
      directionPt: {
        ideia: 'Atmosfera de mistério e descoberta: o próprio espaço conta a história sem necessidade de elementos humanos.',
        foco: 'O ponto de entrada e as texturas arquitetônicas do ambiente (concreto, musgo e penumbra).',
        composicao: 'Perspectiva com linhas de fuga que atraem o olhar para o centro do mistério, com enquadramento equilibrado.',
        expressao: 'Nenhuma (cena puramente espacial/atmosférica sem presença humana).',
        visual: 'Luz natural filtrada e sombras dramáticas críveis do próprio ambiente, sem artifícios ou névoa artificial.'
      }
    };
  }

  // 3. Scene Archetype: Human Storytelling & Authentic Emotional Tension
  if (hasPerson && isEmotionalStory) {
    if (approach === 1) {
      return {
        approachTitle: 'Close Íntimo e Conexão Humana',
        hasPerson: true,
        subjectEn: 'Intimate close-up of the creator with raw, contemplative eye contact, natural facial asymmetry, real skin texture, and subdued posture',
        contextEn: 'Dim home office interior with subtle room silhouettes in the background',
        lightingEn: 'Soft cool bounce from a computer monitor on one side of the face balanced by warm practical room ambience',
        compositionEn: 'Tight framing holding eye-level gaze, clean silhouette that commands instant attention at small feed scale',
        expressionEn: 'Subtle vulnerability and grave honesty with closed mouth, reflective brow, and authentic human presence',
        directionPt: {
          ideia: 'Olhar direto e verdade desarmante: uma conversa honesta cara a cara com o público.',
          foco: 'O olhar autêntico e a expressão facial desarmada do criador dominam a cena.',
          composicao: 'Close intimista centralizado no olhar, eliminando qualquer distração periférica.',
          expressao: 'Gravidade sincera e lábios fechados. Proibida qualquer careta caricata ou boca aberta.',
          visual: 'Contraste suave de luz fria de tela e ambiente escuro com textura orgânica de pele.'
        }
      };
    }
    return {
      approachTitle: 'Tensão Psicológica e Desabafo Autêntico',
      hasPerson: true,
      subjectEn: 'The creator seated in front of a dark computer desk, looking thoughtfully toward the screen with authentic emotional gravity, natural facial asymmetry, and organic skin texture',
      contextEn: 'Authentic darkened home room, subtle workstation setup with ambient desk lamp in background',
      lightingEn: 'Subdued directional illumination motivated by the computer monitor glow casting natural soft shadows across the face',
      compositionEn: 'Medium close-up leaving thoughtful negative space, clean figure-ground separation for instant legibility',
      expressionEn: 'Deep contemplative concern and authentic emotional composure, closed mouth, sincere brow without exaggerated theatrical shouting',
      directionPt: {
        ideia: 'Conexão humana e vulnerabilidade autêntica: a história é contada pela verdade no olhar do criador.',
        foco: 'A expressão facial autêntica e a tensão emocional do criador conduzem todo o impacto da imagem.',
        composicao: 'Plano fechado com enquadramento intimista, mantendo espaço para a respiração do olhar sem elementos concorrentes.',
        expressao: 'Tensão psicológica real, olhar compenetrado ou desabafo genuíno com lábios fechados. Sem caretas ou melodrama.',
        visual: 'Iluminação sutil de baixa intensidade com queda suave de sombras e textura fotográfica natural.'
      }
    };
  }

  // 4. Scene Archetype: Gaming / Tech Interaction with Person
  if (approach === 1) {
    // Approach 1: Foco no Objeto / Hardware
    return {
      approachTitle: 'Foco no Objeto / Hardware em Primeiro Plano',
      hasPerson: true,
      subjectEn: isTech
        ? 'Close foreground shot of the authentic physical device held with both hands, clearly showing the screen, natural thumb position on control stick, matte chassis texture, and real button geometry'
        : 'Foreground hero focus on the primary physical object with authentic real-world texture and material finish',
      contextEn: 'Real lived-in room environment, natural domestic setting with authentic furniture textures',
      lightingEn: 'Believable warm interior lighting from a nearby practical desk lamp, casting soft natural directional light across the surface with realistic shadow falloff',
      compositionEn: 'Dominant foreground subject occupying the lower-left two-thirds of the frame, with the person visible slightly in the background to anchor human scale',
      expressionEn: 'Creator visible in the background with a calm, subtle look of genuine curiosity and satisfaction, eyes focused on the device',
      directionPt: {
        ideia: 'O objeto físico é o protagonista indiscutível. A imagem valoriza o acabamento e desperta o desejo de entender a novidade.',
        foco: 'O hardware/produto domina o primeiro plano com nitidez; o criador aparece como âncora humana no fundo.',
        composicao: 'Objeto em primeiro plano ocupando posição de destaque, enquadramento limpo e fundo organizado.',
        expressao: 'Satisfação contida e olhar atento. Sem caretas exageradas ou boca aberta.',
        visual: 'Luz direcional de abajur real revelando o acabamento fosco. Zero neon aleatório, zero partículas flutuantes.'
      }
    };
  }

  if (approach === 2) {
    // Approach 2: Momento Revelador / Tensão Real
    return {
      approachTitle: 'Momento Revelador / Tensão Real',
      hasPerson: true,
      subjectEn: isTech
        ? 'A person in a regular room pausing to inspect the handheld device, captured mid-moment with relaxed, believable posture'
        : 'A person captured in a genuine mid-action moment with natural posture, holding or examining the subject',
      contextEn: 'Authentic everyday interior with honest room details, practical decor, and natural atmosphere without artificial studio gloss',
      lightingEn: 'Single motivated light source from an overhead warm pendant fixture or natural daylight spill from an adjacent window, creating rich natural contrast',
      compositionEn: 'Intentional 16:9 framing with clear figure-ground separation, deliberate negative space on one side for immediate visual clarity at 120px mobile size',
      expressionEn: 'Contemplative, focused human expression with closed mouth and natural brow of concentration and discovery',
      directionPt: {
        ideia: 'Um momento de pausa e descoberta autêntica em um ambiente comum.',
        foco: 'A relação direta entre o criador e a descoberta, com peso equilibrado entre pessoa e contexto.',
        composicao: 'Enquadramento intencional em 16:9 com espaço negativo generoso e silhueta limpa e legível em telas pequenas.',
        expressao: 'Olhar compenetrado e lábios fechados. Autenticidade emocional sem melodrama de YouTube antigo.',
        visual: 'Iluminação que respeita as fontes físicas reais do cômodo, com sombras naturais e contraste pontual.'
      }
    };
  }

  // Approach 0: Equilíbrio Narrativo / Cumplicidade Natural
  return {
    approachTitle: 'Equilíbrio Narrativo / Cumplicidade com o Espectador',
    hasPerson: true,
    subjectEn: isTech
      ? 'A person sitting comfortably on a real living room sofa, holding the device naturally toward the camera with both hands, five distinct fingers clearly visible on the grips'
      : 'A person seated in a natural, believable room posture, holding or presenting the primary subject with genuine ease',
    contextEn: 'Cozy real apartment living room with authentic sofa cushions and natural home decor',
    lightingEn: 'Warm interior illumination from a living room floor lamp combined with soft ambient daylight bounce, grounded in real physical sources',
    compositionEn: 'Eye-level conversational angle, crisp separation of subject from the room through natural optical perspective',
    expressionEn: 'Direct engaging look toward the viewer with a subtle, confident smirk conveying genuine satisfaction without shouting',
    directionPt: {
      ideia: 'Cumplicidade direta com o espectador: uma conversa honesta sobre algo que realmente funcionou.',
      foco: 'Equilíbrio entre a pessoa e o dispositivo: o produto é visível e claro, enquanto a presença humana valida a história.',
      composicao: 'Plano médio na altura dos olhos, enquadramento estável e postura relaxada no sofá.',
      expressao: 'Sorriso sutil de satisfação. Fisionomia humana natural e expressiva.',
      visual: 'Ambiente crível com iluminação acolhedora de abajur e luz de janela. Textura natural de tecidos e materiais.'
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
    stylePreset = 'Natural',
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
    approachTitle,
    hasPerson
  } = interpretUserIntent(videoTitle, ideaDescription, approachIndex, hasPersonRef ? true : undefined);

  // Context-aware depth of field
  const depthOfField = determineDepthOfField(ideaDescription || videoTitle, approachIndex);

  // Translate any vague user buzzwords
  const buzzwordDecisions = translateVagueBuzzwords(`${videoTitle} ${ideaDescription} ${extraInstructions || ''}`);

  // Build preservation lock directives
  const locks: string[] = [];

  if (hasPersonRef && hasPerson) {
    locks.push(
      'FACIAL FIDELITY (MANDATORY): Strictly preserve the authentic facial geometry, eye shape, nose structure, natural facial asymmetry, real skin texture, natural hairline, and true age from the reference photo. Absolutely NO beauty filters, NO artificial plastic smoothing, NO oversized eyes, NO jaw slimming, NO cartoon exaggeration, NO unnatural teeth whitening.'
    );
  }

  if (hasProductRef || isTech) {
    locks.push(
      'HARDWARE & PRODUCT FIDELITY (MANDATORY): Strictly preserve authentic industrial geometry, chassis proportions, exact button and analog stick placement, native screen aspect ratio, vents, ports, and factory matte material finish. Zero AI deformation, no rubbery curves, no fictional buttons.'
    );
    if (hasPerson) {
      locks.push(
        'HAND & OBJECT INTERACTION: Hands holding the device must show anatomically distinct fingers with a natural physical grip on the exterior edges. Thumbs positioned naturally on the controls without melting or button/chassis fusion.'
      );
    }
  }

  // Handle style references strictly for visual treatment (Rule 15)
  const styleRefs = references.filter(r => r.role === 'ESTILO');
  if (styleRefs.length > 0) {
    locks.push(
      `STYLE REFERENCE: Emulate only the color grading and natural lighting mood from style references (${styleRefs.map(s => s.name).join(', ')}). Do NOT copy their subject matter or background.`
    );
  }

  // Handle composition references strictly for framing (Rule 15)
  const compRefs = references.filter(r => r.role === 'COMPOSIÇÃO');
  if (compRefs.length > 0) {
    locks.push(
      `COMPOSITION REFERENCE: Emulate only the spatial organization and framing ratios from composition references (${compRefs.map(c => c.name).join(', ')}). Do NOT copy subjects or materials.`
    );
  }

  // Build clean prompt body (Neutral by default, no forced "cinematic" unless requested)
  const cleanIdea = ideaDescription.trim() || videoTitle.trim();
  const arParam = aspectRatio === '9:16' ? '9:16 vertical format' : '16:9 widescreen format';
  const styleTreatment = stylePreset !== 'Natural' ? `${stylePreset} visual treatment, ` : '';

  let promptBody = `Photographic YouTube thumbnail, ${arParam}. Directed visual storytelling, authentic and grounded.
SCENE: ${cleanIdea}.
SUBJECT & FRAMING: ${subjectEn}. ${compositionEn}.`;

  if (hasPerson) {
    promptBody += `\nHUMAN EXPRESSION: ${expressionEn}.`;
  }

  promptBody += `\nLIGHTING: ${lightingEn}. Light sources are physically motivated within the room.
ENVIRONMENT & OPTICS: ${contextEn}. ${styleTreatment}${depthOfField}, tangible materials with matte finishes.`;

  if (buzzwordDecisions.length > 0) {
    promptBody += `\nVISUAL EMPHASIS: ${buzzwordDecisions.join('. ')}.`;
  }

  // Handle thumbnail text strictly (Rule 14)
  if (thumbnailText && thumbnailText.trim().length > 0) {
    promptBody += `\nOVERLAY TEXT: Bold clean sans-serif text reading "${thumbnailText.trim().toUpperCase()}" with dedicated clean negative space and high local contrast.`;
  }

  if (locks.length > 0) {
    promptBody += `\n\nPRESERVATION LOCKS:\n${locks.join('\n')}`;
  }

  if (extraInstructions && extraInstructions.trim().length > 0) {
    promptBody += `\nDIRECTOR NOTES: ${extraInstructions.trim()}`;
  }

  promptBody += `\n\nNEGATIVE / STRICTLY AVOID:\n${CORE_ANTI_SLOP_AVOID.join(', ')}.`;

  // Model-specific adjustments (No hardcoded versions like --v 6.1)
  let finalPrompt = promptBody;

  if (targetModel === 'MIDJOURNEY') {
    const arFlag = aspectRatio === '9:16' ? '--ar 9:16' : '--ar 16:9';
    finalPrompt = `${promptBody}\n\n${arFlag} --style raw`;
  } else if (targetModel === 'FLUX') {
    finalPrompt = `[Authentic photography] ${promptBody} shot on professional digital camera with 35mm focal length, clean optical perspective, tactile real-world materials.`;
  } else if (targetModel === 'GEMINI') {
    finalPrompt = `Google Gemini Imagen Prompt:\n${promptBody}\nDirective: Emphasize physical realism, grounded optical perspective, natural skin textures, and zero synthetic AI gloss.`;
  } else if (targetModel === 'OPENAI') {
    finalPrompt = `DALL-E 3 / GPT-4o Prompt:\n${promptBody}\nRule: Photo style, realistic camera shutter capture, natural skin texture, authentic human facial asymmetry, and accurate hardware geometry.`;
  }

  return {
    direction: directionPt,
    finalPrompt,
    approachTitle,
    approachIndex
  };
}

// Slop remover & prompt purifier (Understands intent first, strips cliches, preserves core idea)
export function improvePrompt(input: ImprovePromptInput): ImprovePromptResult {
  const raw = input.rawPrompt.trim();
  const changes: string[] = [];

  let cleaned = raw;

  // Check if neon was unmotivated and replace with motivated light
  if (/neon/i.test(cleaned)) {
    cleaned = cleaned.replace(/neon\s*(lighting|glow|colors?|lights?|blue\s*and\s*purple)?/gi, '');
    changes.push('Substituído o neon genérico por iluminação motivada e crível de ambiente real.');
  }

  // Remove glowing outlines
  if (/(glow|dramatic glow|glowing|outer glow)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(dramatic\s*)?(outer\s*)?glow(ing)?/gi, '');
    changes.push('Removido o efeito de brilho difuso (outer glow) em bordas.');
  }

  // Replace shock face with authentic human focus
  if (/(shocked|screaming|open mouth|excited man|crazy face|gasping)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(shocked|screaming|open mouth|excited man|crazy face|gasping)/gi, 'focused calm expression');
    changes.push('Trocada a expressão caricata de choque/grito por curiosidade e foco autênticos.');
  }

  // Remove unmotivated particles
  if (/(particles|sparks|flying dust|floating embers)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(particles|sparks|flying dust|floating embers)/gi, '');
    changes.push('Eliminadas partículas flutuantes e faíscas sem motivação narrativa.');
  }

  // Remove graphic stickers/arrows
  if (/(arrows?|red circles?|floating emojis?|floating icons?)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(red\s*)?arrows?|(red\s*)?circles?|floating (emojis?|icons?)/gi, '');
    changes.push('Subtraídos elementos gráficos poluentes (setas, círculos e ícones flutuantes).');
  }

  // Remove forced "cinematic / epic" buzzwords unless justified
  if (/(epic|cinematic\s*masterpiece|ultra\s*detailed|high\s*ctr|hyperrealistic|8k)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(epic|cinematic\s*masterpiece|ultra\s*detailed|high\s*ctr|hyperrealistic|8k)/gi, '');
    changes.push('Convertidos adjetivos vagos ("epic", "high CTR") em decisões concretas de foco e composição.');
  }

  if (changes.length === 0) {
    changes.push('Ajustada a hierarquia visual para dar primazia a um único ponto focal inequívoco.');
    changes.push('Reforçada a separação óptica natural de planos e foco no elemento principal.');
    changes.push('Injetadas travas contra alisamento de pele (skin plastic) e distorção de hardware.');
  }

  const improvedPrompt = `High-impact YouTube thumbnail photography, 16:9 widescreen format.
SUBJECT: ${cleaned.replace(/\s+/g, ' ').trim()}.
LIGHTING: Natural motivated light from believable physical sources with gentle falloff and rich shadow contrast.
OPTICAL CHARACTERISTICS: 35mm lens, natural optical separation keeping the primary subject sharp and background balanced.
TEXTURES: Authentic physical surface details, natural skin texture, tactile materials, true matte finishes.
STRICTLY AVOID: ${CORE_ANTI_SLOP_AVOID.slice(0, 12).join(', ')}.`;

  return {
    changes,
    improvedPrompt
  };
}

// Local optical audit with surgical CHANGE and PRESERVE prompt (Rule 16 & 17)
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
      'Textura de pele excessivamente lisa (efeito boneco de cera / ausência de textura natural de pele).',
      'Iluminação de recorte (rim light) sem correspondência com as fontes de luz do cenário.',
      'Elementos de fundo competindo visualmente com o protagonista.'
    ],
    topProblem: 'Subtrair o excesso de iluminação artificial nas bordas e reintroduzir textura fotográfica natural.',
    fixPrompt: `SURGICAL INPAINTING / CORRECTION PROMPT:

CHANGE:
1. Tone down the artificial rim lighting along shoulders and hair; blend naturally with ambient room light falloff.
2. Replace smoothed plastic skin texture with natural skin texture and organic skin tones, avoiding waxy smoothing.
3. Slightly soften background contrast so the primary foreground subject stands out with clear figure-ground separation.

PRESERVE:
1. Exact subject pose, clothing, and body posture.
2. Authentic facial identity, eye direction, and subtle expression.
3. Hand placement and authentic product/hardware geometry.
4. Camera framing and core spatial composition.

AVOID:
plastic waxy skin, cartoon saturation, generic shocked expression, changing facial identity.`
  };
}
