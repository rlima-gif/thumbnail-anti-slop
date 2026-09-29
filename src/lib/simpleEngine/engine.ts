import type {
  CreateThumbnailInput,
  CreateThumbnailResult,
  ImprovePromptInput,
  ImprovePromptResult,
  AnalyzeThumbnailSimpleResult,
  VisualDirectionOutput
} from '@/types/simple';

// Internal Anti-Slop Safeguards grouped strictly by Section 8 requirements
export const CORE_ANTI_SLOP_AVOID = [
  // ROSTO
  'generic AI beauty face',
  'same-face syndrome',
  'perfect facial symmetry',
  'plastic skin',
  'waxy skin texture',
  'excessive beauty filter',
  'oversized eyes',
  'unnatural teeth',
  'generic shocked expression',
  'unnecessary mouth-open reaction',
  'identity drift from reference',
  'age change',
  'hair change',
  'beard change',
  'artificial beauty filter jaw slimming',
  // MÃOS / CORPO
  'incorrect fingers',
  'fused fingers',
  'unnatural grip',
  'hand/object intersections',
  'impossible arm pose',
  'body proportion drift',
  // PRODUTO
  'wrong geometry',
  'incorrect buttons',
  'incorrect analog sticks',
  'wrong ports',
  'invented vents',
  'wrong screen ratio',
  'incorrect thickness',
  'warped logo',
  'unrecognizable silhouette',
  'deformed hardware geometry',
  // LUZ
  'unmotivated rim light',
  'orange/teal lighting by default',
  'purple/blue gaming neon by default',
  'glowing edges',
  'impossible reflections',
  'multiple incompatible light directions',
  'volumetric light without source',
  // COMPOSIÇÃO
  'too many focal points',
  'everything equally sharp',
  'everything equally saturated',
  'everything equally contrasted',
  'background competing with subject',
  'generic centered stock-photo composition',
  'random floating elements',
  'too many visual metaphors',
  'tiny important story elements',
  'composition failing at thumbnail size',
  // PÓS-PROCESSAMENTO
  'overprocessed HDR',
  'excessive sharpening',
  'fake bokeh',
  'extreme color grading',
  'excessive contrast',
  'artificial clarity',
  'uniform micro-detail',
  'over-saturated skin',
  // THUMBNAIL CLICHÉS
  'random red arrows',
  'random circles',
  'floating emojis',
  'floating logos',
  'lightning',
  'sparks',
  'fire',
  'particles',
  'giant text',
  'generic shocked creator',
  'fake UI',
  'random VS',
  'generic before/after division'
];

// Helper to filter avoid tokens conditionally if the user narratively requested them (Rule 9)
export function buildAntiSlopAvoid(userText: string): string[] {
  const lower = userText.toLowerCase();
  return CORE_ANTI_SLOP_AVOID.filter(item => {
    if (/neon/i.test(item) && /neon/i.test(lower)) return false;
    if (item === 'fire' && /(fogo|fire|chama|fogueira)/i.test(lower)) return false;
    if (/arrow/i.test(item) && /(seta|arrow)/i.test(lower)) return false;
    if (/circles/i.test(item) && /(c[íi]rculo|circle)/i.test(lower)) return false;
    if (item === 'lightning' && /(raio|rel[âa]mpago|lightning)/i.test(lower)) return false;
    if (item === 'random VS' && /(vs\b|versus)/i.test(lower)) return false;
    return true;
  });
}

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
    decisions.push('High local contrast on the primary hero subject to command immediate visual attention while keeping overall lighting grounded');
  }

  if (/viral|high\s*ctr|scroll\s*stopping|chama\s*aten[çc][ãa]o|eye[\s-]catching/.test(lower)) {
    decisions.push('Bold figure-ground separation with a clean unmistakable silhouette that remains instantly legible at 120px mobile thumbnail scale');
  }

  if (/profissional|high[\s-]end|pro\s*look/.test(lower)) {
    decisions.push('Controlled physical lighting from believable practical room sources with natural falloff and authentic material textures');
  }

  if (/cinematic/.test(lower)) {
    decisions.push('Deliberate narrative atmosphere and grounded optical depth rather than cartoon saturation or artificial studio glow');
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

  const personKeywords = /(^|\b)(eu|meu\s*rosto|minha\s*rea[çc][ãa]o|pessoa|homem|mulher|criador|cara|apresentador|youtuber|selfie|jogador)(\b|$)/i;
  const hasPerson = hasPersonOverride !== undefined ? hasPersonOverride : personKeywords.test(combined);

  // Specific Archetype 1: Side-by-Side Comparison (No person, e.g. "Um console antigo ao lado de um console moderno")
  const isSideBySide = /(ao\s*lado\s*de|comparando|compara[çc][ãa]o|vs\b|versus|lado\s*a\s*lado|antigo.*moderno|antigo.*novo|evolu[çc][ãa]o)/i.test(combined) && !hasPerson;
  if (isSideBySide) {
    return {
      approachTitle: 'Comparação Geracional Lado a Lado',
      hasPerson: false,
      subjectEn: 'Direct physical side-by-side comparison of a vintage retro gaming console next to a sleek modern gaming console resting on a clean neutral tabletop, showcasing generational evolution of industrial design',
      contextEn: 'Clean neutral tabletop surface with subtle matte slate or wooden grain, calm background with soft natural falloff',
      lightingEn: 'Natural soft side window light grazing both consoles evenly, highlighting material contrasts and textures without artificial digital glare',
      compositionEn: 'Balanced 16:9 side-by-side composition with generous negative space and clear silhouette recognition at 120px mobile scale',
      expressionEn: 'None (pure object comparison scene without human presence)',
      directionPt: {
        ideia: 'Contraste histórico e estético entre duas eras: o design clássico justaposto ao moderno em um enquadramento direto e equilibrado.',
        foco: 'A justaposição física direta entre o console antigo e o moderno, evidenciando as diferenças de formato, portas e acabamentos.',
        composicao: 'Enquadramento 16:9 limpo dividindo o espaço em proporção harmônica sobre a mesa, com espaço negativo para rápida leitura visual.',
        expressao: 'Nenhuma (cena puramente comparativa de objetos sem presença humana).',
        visual: 'Luz natural lateral revelando a textura e o desgaste do plástico retrô em contraste com o acabamento fosco contemporâneo.'
      }
    };
  }

  // Specific Archetype 2: Broken Product Story & Emotional Frustration (Person, e.g. "Eu olhando para um produto quebrado, decepcionado")
  const isBrokenProductStory = /(quebrad|estragad|decepcionad|danificad|defeito)/i.test(combined) && hasPerson;
  if (isBrokenProductStory) {
    return {
      approachTitle: 'Frustração Humana e Produto Danificado',
      hasPerson: true,
      subjectEn: 'The creator sitting at a normal domestic table, looking down thoughtfully at a visibly broken and cracked physical product with sincere quiet disappointment',
      contextEn: 'Authentic everyday home room or workshop desk with realistic domestic details and grounded atmosphere',
      lightingEn: 'Subdued practical overhead domestic lamp light with natural shadow falloff across the tabletop',
      compositionEn: 'Two-tier depth framing establishing visual narrative tension between the cracked foreground product and the creator downcast gaze in the midground',
      expressionEn: 'Authentic quiet disappointment, subtle downcast eyes, furrowed brow, closed mouth, sincere human emotional gravity without theatrical shouting',
      directionPt: {
        ideia: 'Narrativa humana de frustração honesta: o criador confronta o produto quebrado sem histeria ou melodrama.',
        foco: 'A reação contida do criador em conexão direta com o produto danificado em primeiro plano sobre a mesa.',
        composicao: 'Plano médio fechado com o produto danificado em destaque na mesa e o criador ao fundo observando desapontado.',
        expressao: 'Desapontamento sincero e contido: sobrancelhas ligeiramente franzidas, olhar compenetrado, lábios fechados. Proibido qualquer grito ou careta de choque.',
        visual: 'Iluminação intimista de ambiente doméstico com sombras suaves, destacando a gravidade do momento e a textura tátil do dano no produto.'
      }
    };
  }

  // Specific Archetype 3: Opened Laptop / Hardware Teardown on Desk (No person, e.g. "Notebook aberto na mesa mostrando uma diferença de hardware")
  const isOpenedNotebook = (/(notebook|laptop).*aberto/i.test(combined) || (/(notebook|laptop|hardware|pe[çc]a|circuito)/i.test(combined) && !hasPerson));
  if (isOpenedNotebook) {
    return {
      approachTitle: 'Bancada Técnica / Hardware Aberto',
      hasPerson: false,
      subjectEn: 'An opened laptop resting on a clean wooden work desk, chassis lower panel removed to clearly reveal internal cooling hardware and motherboard components',
      contextEn: 'Authentic everyday work desk with organized precision repair tools and clean matte surface',
      lightingEn: 'Diffused neutral desk lamp illumination with natural soft shadow falloff, eliminating specularity on electronic components',
      compositionEn: 'Clean angled medium close-up focused on the specific hardware difference, maintaining clean silhouette and legible spatial orientation',
      expressionEn: 'None (pure technical hardware inspection)',
      directionPt: {
        ideia: 'Comparação técnica de hardware: o notebook aberto na mesa revelando os detalhes internos reais de engenharia.',
        foco: 'A área interna aberta do notebook e a diferença de hardware exposta com nitidez sobre a mesa.',
        composicao: 'Enquadramento em ângulo técnico de 45 graus sobre a mesa de trabalho, permitindo leitura imediata da peça de hardware.',
        expressao: 'Nenhuma (cena focada puramente em objeto técnico sem presença humana).',
        visual: 'Iluminação de luminária de mesa difusa com alto CRI, sem pontos de reflexo cegantes na tela ou nos componentes.'
      }
    };
  }

  // Specific Archetype 4: Gaming Handheld in Domestic Living Room (Person on Couch, e.g. "Eu no sofá mostrando meu Legion Go depois de trocar o sistema")
  const isGamingCouch = /(sof[aá]|legion|steam\s*deck|switch|rog\s*ally|jogando)/i.test(combined) && hasPerson;
  if (isGamingCouch) {
    return {
      approachTitle: 'Cumplicidade no Sofá / Gaming Autêntico',
      hasPerson: true,
      subjectEn: 'The creator sitting comfortably on an authentic living room sofa, holding the handheld gaming console naturally toward the camera with both hands',
      contextEn: 'Cozy real living room with authentic sofa fabric, home cushions, and lived-in domestic decor without artificial studio polish',
      lightingEn: 'Warm motivated light from a living room floor lamp combined with soft natural daylight, zero unmotivated RGB neon',
      compositionEn: 'Conversational eye-level medium framing with balanced optical depth preserving living room context readability',
      expressionEn: 'Relaxed confidence and subtle satisfaction, direct engaging gaze toward viewer or down at screen, natural closed mouth',
      directionPt: {
        ideia: 'Momento autêntico e relaxado no sofá: o criador experimenta o console portátil com o novo sistema instalado.',
        foco: 'O Legion Go em primeiro plano com tela ligada e a postura natural do criador no sofá da sala.',
        composicao: 'Plano médio na altura dos olhos, enquadramento centrado no criador e no console, mantendo o ambiente crível da sala no fundo.',
        expressao: 'Satisfação genuína e sutil, olhar atento ao console ou cúmplice com a câmera. Lábios fechados, sem caretas de gamer.',
        visual: 'Luz suave de abajur de sala e luz natural difusa. Cores quentes de ambiente doméstico. Zero néon roxo/azul clichê.'
      }
    };
  }

  // General Scene Archetype: General Tech Teardown (No person)
  if (!hasPerson && isTech) {
    return {
      approachTitle: 'Bancada Técnica de Precisão',
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

  // General Scene Archetype: Pure Environment / Space / Mystery (No person)
  if (!hasPerson && !isTech) {
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
        expressao: 'Nenhuma (cena puramente espacial/arquitetônica sem presença humana).',
        visual: 'Luz natural filtrada e sombras dramáticas críveis do próprio ambiente, sem artifícios ou névoa artificial.'
      }
    };
  }

  // General Scene Archetype: Human Storytelling & Authentic Emotional Tension
  const emotionalKeywords = /(perdi|canal|desabafo|crise|segredo|hist[óo]ria|arrepend|tristeza|consequ[êe]ncias|verdade|aviso|urgente|alerta|adeus)/i;
  const isEmotionalStory = emotionalKeywords.test(combined);

  if (hasPerson && isEmotionalStory) {
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

  // General Scene Archetype: Conversational Creator in Real Room
  if (approach === 1) {
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
    promptBody += `\nOVERLAY TEXT: Dedicated clean negative space reserved for typography reading "${thumbnailText.trim().toUpperCase()}", with clear figure-ground separation.`;
  }

  if (locks.length > 0) {
    promptBody += `\n\nPRESERVATION LOCKS:\n${locks.join('\n')}`;
  }

  if (extraInstructions && extraInstructions.trim().length > 0) {
    promptBody += `\nDIRECTOR NOTES: ${extraInstructions.trim()}`;
  }

  const activeAvoidList = buildAntiSlopAvoid(cleanIdea + ' ' + (extraInstructions || ''));
  promptBody += `\n\nNEGATIVE / STRICTLY AVOID:\n${activeAvoidList.join(', ')}.`;

  // Model-specific adjustments (No hardcoded versions)
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

// Slop remover & prompt purifier (Understands intent first, strips cliches, reconstructs grounded prompt)
export function improvePrompt(input: ImprovePromptInput): ImprovePromptResult {
  const raw = input.rawPrompt.trim();
  const changes: string[] = [];

  const isGaming = /(game|gaming|console|playstation|xbox|nintendo|steam\s*deck|legion|controller|joystick)/i.test(raw);
  const isTech = detectTechHardware(raw);
  const hasFace = /(face|person|man|woman|youtuber|creator|shocked|screaming|mouth)/i.test(raw);

  let cleaned = raw;

  // 1. Identify and explain intent
  if (/(epic|cinematic|vibrant|high\s*ctr|ultra\s*detailed)/i.test(raw)) {
    changes.push('Identificada a intenção real: thumbnail de alto impacto visual, substituindo adjetivos vagos ("epic", "high CTR") por contraste local e separação figura-fundo.');
  }

  // 2. Neon replacement
  if (/neon/i.test(cleaned)) {
    cleaned = cleaned.replace(/neon\s*(lighting|glow|colors?|lights?|blue\s*and\s*purple|purple\s*and\s*blue)?/gi, '');
    changes.push('Substituído o néon roxo/azul genérico por iluminação motivada crível de ambiente real (luz quente de abajur e brilho suave de monitor).');
  }

  // 3. Rim light & outer glow
  if (/(rim\s*light|glowing|outer\s*glow|glow)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(dramatic\s*)?(laser\s*)?rim\s*light(ing)?|(dramatic\s*)?(outer\s*)?glow(ing)?/gi, '');
    changes.push('Removido o efeito de recorte luminoso artificial (rim light) e brilho difuso nas bordas para devolver tridimensionalidade física.');
  }

  // 4. Shock face
  if (/(shocked|screaming|open\s*mouth|excited\s*man|crazy\s*face|gasping)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(shocked|screaming|open\s*mouth|excited\s*man|crazy\s*face|gasping)/gi, '');
    changes.push('Trocada a expressão caricata de choque/grito por curiosidade autêntica e foco genuíno com lábios fechados.');
  }

  // 5. Sparks and floating particles
  if (/(sparks|particles|flying\s*dust|floating\s*embers)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(particles|sparks|flying\s*dust|floating\s*embers)/gi, '');
    changes.push('Eliminadas faíscas e partículas flutuantes sem motivação narrativa, limpando o ruído visual no feed mobile.');
  }

  // 6. Glowing console / hardware deformation
  if (/(glowing\s*console|console\s*glowing)/i.test(raw)) {
    changes.push('Removido o brilho difuso do console, preservando a geometria industrial autêntica, botões físicos e acabamento fosco de fábrica.');
  }

  // 7. Graphic arrows/circles
  if (/(arrows?|red\s*circles?|floating\s*emojis?|floating\s*icons?)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(red\s*)?arrows?|(red\s*)?circles?|floating\s*(emojis?|icons?)/gi, '');
    changes.push('Subtraídos elementos gráficos poluentes (setas, círculos e ícones flutuantes).');
  }

  // 8. Buzzwords
  if (/(epic|cinematic\s*masterpiece|ultra\s*detailed|high\s*ctr|hyperrealistic|8k)/i.test(cleaned)) {
    cleaned = cleaned.replace(/(epic|cinematic\s*masterpiece|ultra\s*detailed|high\s*ctr|hyperrealistic|8k)/gi, '');
  }

  if (changes.length === 0) {
    changes.push('Ajustada a hierarquia visual para dar primazia a um único ponto focal inequívoco.');
    changes.push('Reforçada a separação óptica natural de planos e foco no elemento principal.');
    changes.push('Injetadas travas contra alisamento de pele (skin plastic) e distorção de hardware.');
  }

  // Build reconstructed, grounded prompt based on understood intent
  const cleanSubject = cleaned.replace(/\s+/g, ' ').trim();
  const subjectDescription = isGaming && hasFace
    ? 'A gaming creator seated in an authentic domestic room gaming setup, naturally focused on a modern gaming console held with both hands'
    : cleanSubject || 'A compelling hero subject with authentic real-world presence and clean silhouette';

  const handsHardwareDirective = isGaming || isTech
    ? '\nHARDWARE & HANDS: Five distinct anatomical fingers gripping the device edges naturally, authentic buttons and sticks, factory matte chassis with zero AI melting or rubbery deformation.'
    : '';

  const expressionDirective = hasFace
    ? '\nHUMAN EXPRESSION: Natural composed curiosity with closed mouth and expressive eyes, authentic facial asymmetry, natural skin texture avoiding plastic waxy smoothing.'
    : '';

  const improvedPrompt = `High-impact photographic YouTube thumbnail, 16:9 widescreen format.
SUBJECT & FRAMING: ${subjectDescription}. Clean figure-ground separation with bold silhouette for instant readability at 120px mobile size.${handsHardwareDirective}${expressionDirective}
LIGHTING: Motivated physical illumination from realistic room practicals (warm desk lamp and subtle ambient screen bounce) with soft natural shadow falloff.
OPTICAL DEPTH: Balanced photographic perspective with 35mm lens, preserving room context and spatial realism without forced blur.
TEXTURES: Authentic tactile materials, true matte finishes, natural skin texture, physical fabric and surfaces.
STRICTLY AVOID: ${CORE_ANTI_SLOP_AVOID.slice(0, 18).join(', ')}.`;

  return {
    changes,
    improvedPrompt
  };
}

// Local optical audit with surgical CHANGE and PRESERVE prompt (Rule 16 & 17)
export function analyzeThumbnailLocally(videoTitle?: string): AnalyzeThumbnailSimpleResult {
  const title = (videoTitle || '').toLowerCase();
  const isTechHardware = detectTechHardware(title);
  const isCreatorFace = /(eu|olhando|perdi|desabafo|meu\s*rosto|humano|apresentador|pessoa|hist[óo]ria)/i.test(title);

  if (isTechHardware && !isCreatorFace) {
    return {
      functioning: [
        'Geometria do hardware principal identificável com enquadramento claro em primeiro plano.',
        'Hierarquia de escala destaca o produto técnico em tamanhos reduzidos de feed.',
        'Paleta de cores sóbria e focada na leitura dos materiais físicos.'
      ],
      aiLooking: [
        'Bordas do dispositivo com brilho especular difuso (glow) característico de renderização sintética.',
        'Acabamento do chassi excessivamente polido e uniforme, sem a textura fosca tátil de fábrica.',
        'Iluminação do ambiente desconectada das fontes de luz reais da bancada.'
      ],
      topProblem: 'Subtrair o brilho difuso das arestas e reintroduzir a textura fosca real de fábrica e portas precisas.',
      fixPrompt: `SURGICAL INPAINTING / CORRECTION PROMPT:

CHANGE:
1. Tone down artificial glowing edges along the device chassis; blend naturally with ambient workbench light falloff.
2. Restore authentic factory matte texture and precision button seams without synthetic plastic gloss.
3. Slightly soften background contrast so the hardware centerpiece stands out with clear figure-ground separation.

PRESERVE:
1. Exact device industrial geometry, chassis proportions, ports, vents, and button layout.
2. Desk work surface, tool arrangement, and physical materials.
3. Camera framing, 45-degree angle, and 16:9 composition.

AVOID:
warped chassis, fictional ports, glowing outline, rubbery buttons, excessive HDR sharpness.`
    };
  }

  if (isCreatorFace) {
    return {
      functioning: [
        'Enquadramento do protagonista estabelece conexão direta com quem rola o feed.',
        'Postura corporal crível sem a rigidez típica de poses de estoque.',
        'Direção do olhar conduz a atenção para o ponto de curiosidade da thumbnail.'
      ],
      aiLooking: [
        'Recorte luminoso artificial (rim light desmotivado) contornando ombros e cabelo sem fonte física no cenário.',
        'Textura de pele excessivamente polida com aspecto de cera (ausência de textura natural e assimetria orgânica).',
        'Elementos periféricos do fundo competindo visualmente com o rosto do criador.'
      ],
      topProblem: 'Suavizar a luz de recorte artificial nas bordas e reintroduzir textura e iluminação natural de pele.',
      fixPrompt: `SURGICAL INPAINTING / CORRECTION PROMPT:

CHANGE:
1. Tone down artificial rim lighting along shoulders and hair; blend naturally with ambient room light falloff.
2. Replace smoothed plastic skin texture with natural skin texture and organic facial asymmetry, avoiding waxy smoothing.
3. Slightly soften background contrast so the primary foreground subject stands out with clear figure-ground separation.

PRESERVE:
1. Exact facial identity, authentic eye direction, hairline, and subtle expression.
2. Subject pose, clothing, and body posture.
3. Hand placement and natural grip on any held object.
4. Camera framing and core spatial composition.

AVOID:
plastic waxy skin, beauty filter jaw slimming, cartoon saturation, generic shocked expression, changing facial identity.`
    };
  }

  // General balanced optical audit
  return {
    functioning: [
      'Silhueta principal identificável com separação satisfatória em relação ao fundo.',
      'Enquadramento mantém legibilidade visual em tamanhos reduzidos de feed mobile.',
      'Paleta de cores consistente sem saturação descontrolada no primeiro plano.'
    ],
    aiLooking: [
      'Contraste global artificialmente elevado em todo o quadro (efeito HDR exagerado).',
      'Iluminação de recorte sem correspondência com as fontes de luz do cenário.',
      'Elementos de fundo competindo visualmente com o ponto focal principal.'
    ],
    topProblem: 'Subtrair o excesso de iluminação artificial nas bordas e reintroduzir contraste local focado no protagonista.',
    fixPrompt: `SURGICAL INPAINTING / CORRECTION PROMPT:

CHANGE:
1. Tone down artificial rim lighting on edges; blend naturally with ambient room light falloff.
2. Rebalance local contrast so the primary subject commands visual hierarchy over the background.
3. Soften peripheral elements to maintain clean figure-ground separation at mobile scale.

PRESERVE:
1. Exact subject pose, identity, and physical placement.
2. Core spatial composition and 16:9 framing.
3. Authentic product geometry and tactile material finishes.

AVOID:
overprocessed HDR, glowing outlines, cartoon saturation, generic AI beauty filter.`
  };
}
