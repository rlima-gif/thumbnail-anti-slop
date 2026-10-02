import type {
  CreateThumbnailInput,
  ScenePlan,
  ThemeContext
} from '../../types/simple.ts';
import { detectExplicitEnvironment, detectTechHardware } from './engine.ts';

// Known specific entities that are grounded research candidates
const KNOWN_NAMED_ENTITIES: Array<{
  pattern: RegExp;
  name: string;
  domain: string;
  world: string;
  defaultStory: string;
  environmentNeed: boolean;
  isSpecificEntity: boolean;
}> = [
  {
    pattern: /\b(?:crimson\s*desert)\b/i,
    name: 'Crimson Desert',
    domain: 'fantasy action / exploration',
    world: 'rugged medieval fantasy wilderness, stone outposts, ancient ruins, and dramatic vistas',
    defaultStory: 'Adventurer studying a map while anticipating a perilous new quest',
    environmentNeed: true,
    isSpecificEntity: true
  },
  {
    pattern: /\b(?:rog\s*ally\s*x|rog\s*ally)\b/i,
    name: 'ROG Ally X',
    domain: 'handheld gaming hardware',
    world: 'clean tech environment or focused personal workspace with authentic scale',
    defaultStory: 'Creator presenting the handheld device with authentic grip and focused curiosity',
    environmentNeed: false,
    isSpecificEntity: true
  },
  {
    pattern: /\b(?:steam\s*deck(?:\s*oled)?)\b/i,
    name: 'Steam Deck',
    domain: 'handheld gaming hardware',
    world: 'grounded personal gaming setting',
    defaultStory: 'Player engaged with the handheld device with natural ergonomic hold',
    environmentNeed: false,
    isSpecificEntity: true
  },
  {
    pattern: /\b(?:nintendo\s*switch(?:\s*2|\s*oled)?|switch\s*2)\b/i,
    name: 'Nintendo Switch',
    domain: 'handheld gaming hardware',
    world: 'clean gaming atmosphere',
    defaultStory: 'Creator showcasing the portable console',
    environmentNeed: false,
    isSpecificEntity: true
  },
  {
    pattern: /\b(?:xbox\s*series\s*[sx]|playstation\s*5|ps5)\b/i,
    name: 'Next-Gen Console',
    domain: 'home gaming console',
    world: 'modern entertainment living space or clean hardware showcase',
    defaultStory: 'Creator examining or presenting the gaming console',
    environmentNeed: false,
    isSpecificEntity: true
  }
];

// Generic concepts that must NOT be treated as external research candidates
const GENERIC_EXCLUSION_PATTERNS = [
  /\bcaixa\s*misteriosa\b/i,
  /\bmysterious\s*box\b/i,
  /\bgeneric\s*controller\b/i,
  /\bcontrole\s*gen[ée]rico\b/i,
  /\bum\s*computador\b/i,
  /\buma\s*floresta\b/i,
  /\ba\s*forest\b/i,
  /\bum\s*quarto\b/i,
  /\ba\s*bedroom\b/i,
  /\buma\s*mulher\b/i,
  /\bum\s*homem\b/i
];

/**
 * Checks if a candidate entity is sufficiently specific for external research,
 * rejecting trivial generic phrases.
 */
export function isEligibleNamedEntity(text: string): boolean {
  for (const excl of GENERIC_EXCLUSION_PATTERNS) {
    if (excl.test(text)) return false;
  }
  for (const entity of KNOWN_NAMED_ENTITIES) {
    if (entity.pattern.test(text) && entity.isSpecificEntity) return true;
  }

  // Regex heuristic for named capitalized titles/products (e.g. "Elden Ring", "Cyberpunk", "RTX 5090")
  const specificHeuristic = /\b(?:elden\s*ring|cyberpunk(?:\s*2077)?|gta\s*6|black\s*myth(?:\s*wukong)?|rtx\s*50\d0|iphone\s*1\d|galaxy\s*s\d\d)\b/i;
  return specificHeuristic.test(text);
}

/**
 * Extracts named entities from user text
 */
export function extractNamedEntities(text: string): string[] {
  const found: string[] = [];
  for (const entity of KNOWN_NAMED_ENTITIES) {
    if (entity.pattern.test(text)) {
      found.push(entity.name);
    }
  }

  // Generic match for quoted phrases or specific product models
  const productModelMatch = text.match(/\b([A-Z][a-zA-Z0-9]+(?:\s+[A-Z0-9][a-zA-Z0-9]*){1,3})\b/g);
  if (productModelMatch) {
    for (const m of productModelMatch) {
      if (m.length > 3 && isEligibleNamedEntity(m) && !found.includes(m)) {
        found.push(m);
      }
    }
  }

  return found;
}

/**
 * Detects important objects mentioned in the user idea
 */
export function extractImportantObjects(text: string): string[] {
  const lower = text.toLowerCase();
  const objects: string[] = [];

  if (/\b(?:mapa|map)\b/i.test(lower)) objects.push('map');
  if (/\b(?:rog\s*ally\s*x|rog\s*ally)\b/i.test(lower)) objects.push('ROG Ally X');
  if (/\b(?:steam\s*deck)\b/i.test(lower)) objects.push('Steam Deck');
  if (/\b(?:headset|fone)\b/i.test(lower)) objects.push('headset');
  if (/\b(?:caixa\s*misteriosa|caixa|box)\b/i.test(lower)) objects.push('box');
  if (/\b(?:controle|controller|joystick)\b/i.test(lower)) objects.push('game controller');
  if (/\b(?:smartphone|celular|iphone)\b/i.test(lower)) objects.push('smartphone');
  if (/\b(?:teclado|keyboard)\b/i.test(lower)) objects.push('keyboard');
  if (/\b(?:laptop|notebook)\b/i.test(lower)) objects.push('laptop');
  if (/\b(?:c[âa]mera|camera)\b/i.test(lower)) objects.push('camera');
  if (/\b(?:espada|sword|weapon|arma)\b/i.test(lower)) objects.push('weapon');

  return objects;
}

/**
 * Determines whether the environment is already authoritatively owned by:
 * - USER_EXPLICIT
 * - TARGET_IMAGE
 * - SCENARIO_REFERENCE
 */
export function isEnvironmentAuthoritativelyOwned(plan: ScenePlan, userText: string): boolean {
  // 1. Explicit user room/location request in prompt text
  const explicitEnv = detectExplicitEnvironment(userText);
  if (explicitEnv.hasExplicitEnv) return true;
  if (plan.environmentOwner === 'USER') return true;

  // 2. Target master image owns environment
  if (plan.environmentOwner === 'TARGET' || plan.targetImage) return true;

  // 3. Scenario reference owns environment
  if (plan.environmentOwner === 'SCENARIO_REF' || plan.environmentSource) return true;

  // 4. Provenance map check
  if (plan.provenanceMap?.environment === 'USER_EXPLICIT' ||
      plan.provenanceMap?.environment === 'TARGET_IMAGE' ||
      plan.provenanceMap?.environment === 'SCENARIO_REFERENCE') {
    return true;
  }

  return false;
}

/**
 * Core Theme Context Resolver:
 * Resolves narrative, domain, and environmental needs when context is unresolved.
 * Strict NO-OP if the environment or scene context is already authoritatively owned.
 */
export function resolveThemeContext(
  input: CreateThumbnailInput,
  plan: ScenePlan
): ThemeContext {
  const { videoTitle = '', ideaDescription = '' } = input;
  const userText = `${videoTitle} ${ideaDescription}`.trim();
  const lower = userText.toLowerCase();

  const namedEntities = extractNamedEntities(userText);
  const importantObjects = extractImportantObjects(userText);

  // Check if environment is already authoritatively owned
  const envOwned = isEnvironmentAuthoritativelyOwned(plan, userText);

  // Match known specific entity profile
  const matchedEntity = KNOWN_NAMED_ENTITIES.find(e => e.pattern.test(userText));

  let theme: string | undefined;
  let subjectDomain: string | undefined;
  let visualWorld: string | undefined;
  let defaultStory: string | undefined;
  let environmentNeed = false;
  let researchCandidate = false;

  if (matchedEntity) {
    theme = matchedEntity.name;
    subjectDomain = matchedEntity.domain;
    visualWorld = matchedEntity.world;
    defaultStory = matchedEntity.defaultStory;
    // Environment need is only considered if not already owned by higher authority
    environmentNeed = !envOwned && matchedEntity.environmentNeed && plan.taskType === 'CREATE_NEW_SCENE';
    researchCandidate = matchedEntity.isSpecificEntity;
  } else if (detectTechHardware(userText)) {
    theme = 'Hardware & Tech';
    subjectDomain = 'technology / consumer electronics';
    visualWorld = 'focused tech environment with clean physical surfaces and matte finishes';
    defaultStory = 'Creator showcasing physical hardware with authentic grip and focus';
    environmentNeed = false;
    researchCandidate = namedEntities.length > 0 && namedEntities.some(isEligibleNamedEntity);
  } else if (/\b(?:aventureiro|rpg|dlc|gameplay|game|deserto|castelo|combate)\b/i.test(lower)) {
    theme = 'Gaming Adventure';
    subjectDomain = 'interactive entertainment / gaming';
    visualWorld = 'thematic expedition setting with authentic spatial scale';
    defaultStory = 'Hero or creator immersed in thematic exploration';
    environmentNeed = !envOwned && plan.taskType === 'CREATE_NEW_SCENE';
    researchCandidate = namedEntities.length > 0;
  } else {
    theme = 'General Creator Content';
    subjectDomain = 'creator media / vlog / presentation';
    visualWorld = 'clean minimalist studio backdrop with soft optical falloff';
    defaultStory = 'Creator communicating core idea directly to viewer';
    environmentNeed = false;
    researchCandidate = false;
  }

  // Construct single Primary Visual Story
  let primaryVisualStory = defaultStory;
  if (theme === 'Crimson Desert') {
    if (importantObjects.includes('map')) {
      primaryVisualStory = 'Creator embodied as an adventurer studying a map while anticipating new content';
    } else {
      primaryVisualStory = 'Creator embodied as an adventurer in the world of Crimson Desert';
    }
  } else if (importantObjects.includes('ROG Ally X')) {
    primaryVisualStory = 'Creator holding ROG Ally X with both hands displaying hardware to camera';
  } else if (importantObjects.includes('Steam Deck')) {
    primaryVisualStory = 'Creator holding Steam Deck handheld device with authentic ergonomic grip';
  } else if (importantObjects.includes('box')) {
    primaryVisualStory = 'Creator presenting a mysterious unbranded box with genuine curiosity';
  }

  return {
    theme,
    subjectDomain,
    namedEntities,
    narrativeGoal: /dlc|expectativa|hype|ansioso/i.test(lower) ? 'anticipation + exploration' : 'demonstration and engagement',
    userEmotion: /ansioso|expectativa/i.test(lower) ? 'intense curiosity and focused anticipation' : 'composed confidence and natural focus',
    importantSubjects: ['creator'],
    importantObjects,
    visualWorld,
    environmentNeed,
    contextConfidence: matchedEntity ? 0.95 : namedEntities.length > 0 ? 0.8 : 0.6,
    researchCandidate,
    primaryVisualStory
  };
}

/**
 * Visual Element Relevance Filter:
 * Ensures only elements directly communicating the primary visual story are kept.
 * Subtraction is always preferred over decoration.
 */
export function filterIrrelevantVisualClutter(
  elements: string[],
  primaryVisualStory: string
): string[] {
  const storyLower = primaryVisualStory.toLowerCase();
  const CLUTTER_TOKENS = [
    'monster', 'castle', 'explosion', 'particles', 'sparks', 'fire',
    'magic glow', 'floating ui', 'red arrows', 'logos', 'hud', 'futuristic neon'
  ];

  return elements.filter(el => {
    const elLower = el.toLowerCase();
    for (const token of CLUTTER_TOKENS) {
      if (elLower.includes(token) && !storyLower.includes(token)) {
        return false;
      }
    }
    return true;
  });
}
