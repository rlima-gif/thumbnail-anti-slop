import type {
  AllowedResearchEntityType,
  AllowedResearchCategory,
  ResearchFact,
  ResearchResult,
  ScenePlan,
  SimpleReference
} from '../../types/simple.ts';
import { isEligibleNamedEntity } from './themeResolver.ts';
import { detectTechHardware } from './engine.ts';

export const ALLOWED_RESEARCH_ENTITY_TYPES: ReadonlySet<AllowedResearchEntityType> = new Set<AllowedResearchEntityType>([
  'PRODUCT',
  'GAME_OR_FICTIONAL_WORLD',
  'PUBLIC_PLACE_OR_LANDMARK',
  'VEHICLE_MODEL'
]);

export const ALLOWED_RESEARCH_CATEGORIES: ReadonlySet<AllowedResearchCategory> = new Set<AllowedResearchCategory>([
  'PRODUCT_GEOMETRY',
  'CONTROL_LAYOUT',
  'SILHOUETTE',
  'MATERIAL',
  'COLOR',
  'ENVIRONMENT_TYPE',
  'TERRAIN',
  'ARCHITECTURE',
  'CLOTHING',
  'PROP',
  'SPATIAL_FEATURE',
  'VISUAL_MOTIF'
]);

export interface ResearchRequest {
  entity: string;
  category: AllowedResearchCategory;
  entityType?: AllowedResearchEntityType;
}

export interface ResearchProvider {
  name: string;
  isConfigured(): boolean;
  lookup(req: ResearchRequest, timeoutMs: number): Promise<ResearchResult>;
}

// Blocked entity type designations
const BLOCKED_ENTITY_TYPES = new Set([
  'PERSON',
  'PRIVATE_NAME',
  'USER_IDENTITY',
  'PESSOA',
  'PRIVATE_ADDRESS',
  'PERSONAL_LOCATION',
  'USER_BUSINESS'
]);

// Personal / private / user identity patterns
const PERSON_IDENTITY_PATTERNS = [
  /\b(?:eu|meu\s*rosto|minha\s*foto|criador|apresentador|pessoa|creator|host|user|human|avatar|self|myself|rosto|face)\b/i,
  /\b(?:dr\.|mr\.|mrs\.|ms\.|prof\.)\s+[A-Z]/i,
  /\b(?:minha\s*casa|meu\s*quarto|meu\s*est[úu]dio|minha\s*sala|minha\s*rua|meu\s*apartamento|my\s*room|my\s*house|my\s*studio|my\s*office|my\s*desk)\b/i,
  /\b(?:rua|avenida|travessa|alameda|estrada|street|avenue|blvd|road|apt|apartamento|n[ºo]\s*\d+)\b/i,
  /\b(?:minha\s*loja|minha\s*empresa|minha\s*ag[êe]ncia|minha\s*oficina|minha\s*cl[íi]nica|meu\s*restaurante|my\s*store|my\s*business|my\s*shop|my\s*company)\b/i
];

// Prompt Injection and Malicious Text Patterns
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /system\s*prompt/i,
  /assistant\s*must/i,
  /developer\s*message/i,
  /system\s*message/i,
  /you\s+are\s+an\s+ai/i,
  /role\s*instruction/i,
  /tool\s*instruction/i,
  /<[^>]+>/, // HTML tags
  /```[\s\S]*?```/, // Code blocks
  /https?:\/\/[\S]+/, // URLs
  /www\.[\S]+/, // Web addresses
  /\{[\s\S]*?"(?:role|system|prompt|instruction)"[\s\S]*?\}/i // Embedded JSON instruction
];

// Non-visual spec tokens to filter out
const NON_VISUAL_SPEC_PATTERNS = [
  /\b(?:ghz|mhz|cpu|gpu\s*clock|ram\s*speed|teraflops|tflops)\b/i,
  /\b(?:mah|watt|wh\b|battery\s*life|battery\s*capacity)\b/i,
  /\b(?:benchmark|fps\b|geekbench|cinebench|antutu)\b/i,
  /\b(?:release\s*date|lan[çc]amento|launched\s*in|msrp|pre[çc]o|custo|\$\d+)\b/i,
  /\b(?:review\s*score|metacritic|vendas|unidades\s*vendidas|sales\s*figures)\b/i,
  /\b(?:biography|developer\s*history|ceo|founded\s*in)\b/i
];

/**
 * Lightweight in-memory cache for lookups with 5-minute TTL
 */
interface CacheEntry {
  result: ResearchResult;
  timestamp: number;
}
const RESEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export class ResearchBroker {
  private static mockProvider: ResearchProvider | null = null;

  /**
   * For testing: set or clear a mock provider
   */
  public static setMockProvider(provider: ResearchProvider | null): void {
    ResearchBroker.mockProvider = provider;
  }

  public static clearCache(): void {
    RESEARCH_CACHE.clear();
  }

  /**
   * Research requires BOTH:
   * COMPLEMENTARY_ENGINES_ENABLED=true
   * AND
   * RESEARCH_ENABLED=true
   */
  public static isResearchEnabled(): boolean {
    return process.env.COMPLEMENTARY_ENGINES_ENABLED === 'true' && process.env.RESEARCH_ENABLED === 'true';
  }

  public static getTimeoutMs(): number {
    const val = Number(process.env.RESEARCH_TIMEOUT_MS);
    return Number.isFinite(val) && val > 0 ? val : 4000;
  }

  /**
   * Validates whether an entity is allowed for grounded research.
   * Research is permitted ONLY for:
   * - PRODUCT
   * - GAME_OR_FICTIONAL_WORLD
   * - PUBLIC_PLACE_OR_LANDMARK
   * - VEHICLE_MODEL
   *
   * NEVER permitted for:
   * - PERSON, PRIVATE_NAME, USER_IDENTITY, PESSOA reference identity,
   *   PRIVATE_ADDRESS, PERSONAL_LOCATION, USER-RELATED PRIVATE BUSINESS.
   */
  public static validateEntityType(
    entity: string,
    explicitType?: string,
    plan?: ScenePlan,
    references?: SimpleReference[]
  ): { allowed: boolean; resolvedType?: AllowedResearchEntityType; reason?: string } {
    if (!entity || typeof entity !== 'string' || entity.trim().length === 0) {
      return { allowed: false, reason: 'EMPTY_ENTITY' };
    }

    const clean = entity.trim();

    // 1. If explicit type is supplied, check against blocked and allowed lists
    if (explicitType) {
      const upperType = explicitType.toUpperCase();
      if (BLOCKED_ENTITY_TYPES.has(upperType)) {
        return { allowed: false, reason: 'BLOCKED_ENTITY_TYPE_PERSON_OR_PRIVATE' };
      }
      if (!ALLOWED_RESEARCH_ENTITY_TYPES.has(upperType as AllowedResearchEntityType)) {
        return { allowed: false, reason: 'ENTITY_TYPE_NOT_ALLOWED' };
      }
    }

    // 2. Reject if entity matches any person, personal address, or private business patterns
    for (const pat of PERSON_IDENTITY_PATTERNS) {
      if (pat.test(clean)) {
        return { allowed: false, reason: 'BLOCKED_PERSON_OR_PRIVATE_PATTERN' };
      }
    }

    // 3. Reject if entity matches any reference designated as PESSOA
    const refsToCheck: SimpleReference[] = [
      ...(references || []),
      ...(plan?.identitySource ? [plan.identitySource] : []),
      ...(plan?.targetImage ? [plan.targetImage] : [])
    ];

    for (const ref of refsToCheck) {
      if (ref.role === 'PESSOA' && ref.name) {
        const refNameNorm = ref.name.trim().toLowerCase();
        const entityNorm = clean.toLowerCase();
        if (entityNorm === refNameNorm || entityNorm.includes(refNameNorm) || refNameNorm.includes(entityNorm)) {
          return { allowed: false, reason: 'PESSOA_REFERENCE_IDENTITY' };
        }
      }
    }

    // 4. Determine or verify allowed category
    const resolved = ResearchBroker.inferAllowedEntityType(clean, explicitType as AllowedResearchEntityType);
    if (!resolved) {
      return { allowed: false, reason: 'UNRECOGNIZED_OR_DISALLOWED_ENTITY_TYPE' };
    }

    return { allowed: true, resolvedType: resolved };
  }

  private static inferAllowedEntityType(
    entity: string,
    explicitType?: AllowedResearchEntityType
  ): AllowedResearchEntityType | null {
    if (explicitType && ALLOWED_RESEARCH_ENTITY_TYPES.has(explicitType)) {
      return explicitType;
    }

    const lower = entity.toLowerCase();

    // GAME_OR_FICTIONAL_WORLD
    if (
      /\b(?:crimson\s*desert|elden\s*ring|cyberpunk(?:\s*2077)?|gta\s*(?:6|vi|v)|black\s*myth(?:\s*wukong)?|zelda|starfield|skyrim|fallout|dark\s*souls|witcher|world\s*of\s*warcraft)\b/i.test(lower)
    ) {
      return 'GAME_OR_FICTIONAL_WORLD';
    }

    // PRODUCT
    if (
      /\b(?:rog\s*ally(?:\s*x)?|steam\s*deck(?:\s*oled)?|nintendo\s*switch(?:\s*2|\s*oled)?|legion\s*go|playstation\s*5|ps5|xbox\s*series\s*[sx]|rtx\s*50\d0|rtx\s*40\d0|iphone\s*\d+|galaxy\s*s\d+|quest\s*3|vision\s*pro|pixel\s*\d+|macbook(?:\s*pro)?|ipad(?:\s*pro)?)\b/i.test(lower)
    ) {
      return 'PRODUCT';
    }

    // VEHICLE_MODEL
    if (
      /\b(?:cybertruck|tesla\s*model\s*[3sxy]|porsche\s*911|ferrari\s*(?:f40|roma)|boeing\s*7\d\d|airbus\s*a3\d\d|mustang|corvette|bmw\s*m\d|audi\s*rs\d)\b/i.test(lower)
    ) {
      return 'VEHICLE_MODEL';
    }

    // PUBLIC_PLACE_OR_LANDMARK
    if (
      /\b(?:eiffel\s*tower|torre\s*eiffel|tokyo\s*tower|grand\s*canyon|colosseum|coliseu|est[áa]tua\s*da\s*liberdade|statue\s*of\s*liberty|mount\s*everest|times\s*square|stonehenge|louvre|cristo\s*redentor)\b/i.test(lower)
    ) {
      return 'PUBLIC_PLACE_OR_LANDMARK';
    }

    // Fallback heuristic: If it matches KNOWN_NAMED_ENTITIES from themeResolver or has specific hardware/world pattern
    if (isEligibleNamedEntity(entity)) {
      if (detectTechHardware(lower) || /\b(?:console|handheld|headset|hardware|gpu|phone|teclado|mouse)\b/i.test(lower)) {
        return 'PRODUCT';
      }
      return 'GAME_OR_FICTIONAL_WORLD';
    }

    return null;
  }

  /**
   * Deterministic local-first eligibility check.
   * Cheap and instantaneous without any LLM calls.
   */
  public static isEligible(
    entity: string,
    category: AllowedResearchCategory,
    plan?: ScenePlan,
    explicitType?: string,
    references?: SimpleReference[]
  ): boolean {
    if (!entity || typeof entity !== 'string' || entity.trim().length === 0) {
      return false;
    }

    const normEntity = entity.trim();

    // 1. Must be an allowed category
    if (!ALLOWED_RESEARCH_CATEGORIES.has(category)) {
      return false;
    }

    // 2. Reject trivial or generic entities
    if (!isEligibleNamedEntity(normEntity)) {
      return false;
    }

    // 3. Entity-Type Allowlist Validation:
    // Must be PRODUCT, GAME_OR_FICTIONAL_WORLD, PUBLIC_PLACE_OR_LANDMARK, VEHICLE_MODEL
    // Must NEVER be PERSON, PRIVATE_NAME, USER_IDENTITY, etc.
    const typeValidation = ResearchBroker.validateEntityType(normEntity, explicitType, plan, references);
    if (!typeValidation.allowed) {
      return false;
    }

    // 4. If plan provided, check if information is already locked by higher authority
    if (plan) {
      // Product reference locks geometry: research is ineligible
      if (
        (category === 'PRODUCT_GEOMETRY' || category === 'CONTROL_LAYOUT' || category === 'SILHOUETTE') &&
        (plan.productSource || plan.productOwner === 'PRODUCT_REF')
      ) {
        return false;
      }

      // Scenario reference or explicit room locks environment: research is ineligible
      if (
        (category === 'ENVIRONMENT_TYPE' || category === 'TERRAIN' || category === 'ARCHITECTURE') &&
        (plan.environmentSource || plan.environmentOwner === 'USER' || plan.environmentOwner === 'TARGET' || plan.environmentOwner === 'SCENARIO_REF')
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Strict privacy sanitizer: produces query containing ONLY normalized entity + allowed category.
   * Ensures no user title, idea, personal notes, or images are passed.
   */
  public static sanitizeQuery(
    entity: string,
    category: AllowedResearchCategory,
    entityType?: AllowedResearchEntityType
  ): ResearchRequest | null {
    if (!ALLOWED_RESEARCH_CATEGORIES.has(category)) {
      return null;
    }

    // Clean entity string of any stray punctuation, newlines, or code
    const cleanEntity = entity
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[<>{}#]/g, '')
      .trim();

    if (!cleanEntity || cleanEntity.length > 80) {
      return null;
    }

    const req: ResearchRequest = {
      entity: cleanEntity,
      category
    };
    if (entityType) {
      req.entityType = entityType;
    }
    return req;
  }

  /**
   * Security & sanitization filter: validates a single research fact.
   * Enforces:
   * - Fact character length limits (5-240)
   * - Allowed categories
   * - Injection patterns
   * - Non-visual specs
   * - ENTITY MATCH VALIDATION: Returned fact entity must match requested normalized entity!
   */
  public static sanitizeAndValidateFact(
    raw: unknown,
    requestedEntity: string,
    category: AllowedResearchCategory
  ): ResearchFact | null {
    if (!raw || typeof raw !== 'object') return null;

    const obj = raw as Record<string, unknown>;
    const factText = typeof obj.fact === 'string' ? obj.fact.trim() : '';

    if (!factText || factText.length < 5 || factText.length > 240) {
      return null;
    }

    if (!ALLOWED_RESEARCH_CATEGORIES.has(category)) {
      return null;
    }

    // ENTITY MATCH VALIDATION:
    // If the fact object specifies an entity, it MUST match the requested normalized entity!
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normRequested = normalize(requestedEntity);

    if (typeof obj.entity === 'string' && obj.entity.trim().length > 0) {
      const normFactEntity = normalize(obj.entity.trim());
      if (normFactEntity !== normRequested) {
        // Mismatched entity (e.g. requested 'ROG Ally X', returned 'Steam Deck OLED') -> REJECT
        return null;
      }
    }

    // Check for injection patterns
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(factText)) {
        return null;
      }
    }

    // Check for non-visual specs
    for (const pattern of NON_VISUAL_SPEC_PATTERNS) {
      if (pattern.test(factText)) {
        return null;
      }
    }

    const confidence = typeof obj.confidence === 'number' && obj.confidence >= 0 && obj.confidence <= 1
      ? obj.confidence
      : 0.85;

    const visualRelevance = typeof obj.visualRelevance === 'number' && obj.visualRelevance >= 0 && obj.visualRelevance <= 1
      ? obj.visualRelevance
      : 0.9;

    return {
      entity: requestedEntity,
      category,
      fact: factText,
      confidence,
      visualRelevance,
      provenance: 'WEB_RESEARCH'
    };
  }

  /**
   * Performs grounded research lookup with hard timeout and fallback.
   */
  public static async resolve(
    req: ResearchRequest,
    customTimeoutMs?: number,
    plan?: ScenePlan,
    references?: SimpleReference[]
  ): Promise<ResearchResult> {
    const startTime = Date.now();
    const timeoutMs = customTimeoutMs || ResearchBroker.getTimeoutMs();

    // 1. Check Kill Switch (Requires both COMPLEMENTARY_ENGINES_ENABLED and RESEARCH_ENABLED)
    if (!ResearchBroker.isResearchEnabled() && !ResearchBroker.mockProvider) {
      return {
        entity: req.entity,
        category: req.category,
        entityType: req.entityType,
        facts: [],
        provider: 'none',
        success: false,
        failureReason: 'RESEARCH_DISABLED',
        attempted: false,
        timedOut: false,
        latencyMs: 0
      };
    }

    // 2. Validate Entity Type Allowlist
    const typeValidation = ResearchBroker.validateEntityType(req.entity, req.entityType, plan, references);
    if (!typeValidation.allowed) {
      return {
        entity: req.entity,
        category: req.category,
        entityType: req.entityType,
        facts: [],
        provider: 'none',
        success: false,
        failureReason: 'ENTITY_TYPE_NOT_ALLOWED',
        attempted: false,
        timedOut: false,
        latencyMs: 0
      };
    }

    const resolvedEntityType = typeValidation.resolvedType || req.entityType;

    // 3. Sanitize query to ensure strict privacy
    const sanitizedReq = ResearchBroker.sanitizeQuery(req.entity, req.category, resolvedEntityType);
    if (!sanitizedReq) {
      return {
        entity: req.entity,
        category: req.category,
        entityType: resolvedEntityType,
        facts: [],
        provider: 'none',
        success: false,
        failureReason: 'INVALID_QUERY_OR_CATEGORY',
        attempted: false,
        timedOut: false,
        latencyMs: 0
      };
    }

    // 4. Cache lookup
    const cacheKey = `${sanitizedReq.entity.toLowerCase()}::${sanitizedReq.category}`;
    const cached = RESEARCH_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        ...cached.result,
        cached: true,
        attempted: true,
        timedOut: false,
        latencyMs: Date.now() - startTime
      };
    }

    // 5. Determine provider
    const provider = ResearchBroker.mockProvider || ResearchBroker.getDefaultProvider();
    if (!provider || !provider.isConfigured()) {
      return {
        entity: sanitizedReq.entity,
        category: sanitizedReq.category,
        entityType: sanitizedReq.entityType,
        facts: [],
        provider: provider?.name || 'none',
        success: false,
        failureReason: 'PROVIDER_NOT_CONFIGURED',
        attempted: false,
        timedOut: false,
        latencyMs: 0
      };
    }

    // 6. Execute with hard timeout
    try {
      const resultPromise = provider.lookup(sanitizedReq, timeoutMs);
      const timeoutPromise = new Promise<ResearchResult>((_, reject) =>
        setTimeout(() => reject(new Error('RESEARCH_TIMEOUT')), timeoutMs)
      );

      const rawResult = await Promise.race([resultPromise, timeoutPromise]);

      // ENTITY MATCH VALIDATION on top-level result
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (rawResult.entity && normalize(rawResult.entity) !== normalize(sanitizedReq.entity)) {
        return {
          entity: sanitizedReq.entity,
          category: sanitizedReq.category,
          entityType: sanitizedReq.entityType,
          facts: [],
          provider: provider.name,
          latencyMs: Date.now() - startTime,
          success: false,
          failureReason: 'ENTITY_MISMATCH',
          attempted: true,
          timedOut: false
        };
      }

      // 7. Security filter and schema validation
      const validatedFacts: ResearchFact[] = [];
      for (const fact of rawResult.facts || []) {
        const validated = ResearchBroker.sanitizeAndValidateFact(
          fact,
          sanitizedReq.entity,
          sanitizedReq.category
        );
        if (validated) {
          validatedFacts.push(validated);
        }
        if (validatedFacts.length >= 5) break; // Hard limit: max 5 facts
      }

      const finalResult: ResearchResult = {
        entity: sanitizedReq.entity,
        category: sanitizedReq.category,
        entityType: sanitizedReq.entityType,
        facts: validatedFacts,
        provider: provider.name,
        latencyMs: Date.now() - startTime,
        success: validatedFacts.length > 0,
        failureReason: validatedFacts.length === 0 ? 'NO_FACTS_ACCEPTED' : undefined,
        attempted: true,
        timedOut: false
      };

      if (finalResult.success) {
        RESEARCH_CACHE.set(cacheKey, {
          result: finalResult,
          timestamp: Date.now()
        });
      }

      return finalResult;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isTimeout = msg === 'RESEARCH_TIMEOUT' || (err instanceof Error && err.name === 'AbortError');
      return {
        entity: sanitizedReq.entity,
        category: sanitizedReq.category,
        entityType: sanitizedReq.entityType,
        facts: [],
        provider: provider.name,
        latencyMs: Date.now() - startTime,
        success: false,
        failureReason: isTimeout ? 'TIMEOUT' : 'PROVIDER_ERROR',
        attempted: true,
        timedOut: isTimeout
      };
    }
  }

  /**
   * Returns default configured provider (Gemini grounded search or OpenAI search)
   */
  private static getDefaultProvider(): ResearchProvider | null {
    // Check Gemini API key for Grounded Search
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
      return new GeminiGroundedSearchProvider();
    }
    // Check OpenAI API key for Web Search
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0) {
      return new OpenAIWebSearchProvider();
    }
    return null;
  }
}

/**
 * Gemini Grounded Search Provider implementation
 * Uses Google Search Grounding tool in Gemini API.
 * Receives STRICTLY: { entity, category }.
 */
class GeminiGroundedSearchProvider implements ResearchProvider {
  public name = 'gemini-grounded-search';

  public isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  }

  public async lookup(req: ResearchRequest, timeoutMs: number): Promise<ResearchResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_RESEARCH_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `Provide 2 to 4 concise visual physical facts about the entity "${req.entity}" for category "${req.category}".
Return ONLY a valid JSON object matching:
{
  "entity": "${req.entity}",
  "facts": [
    { "entity": "${req.entity}", "fact": "short visual fact under 200 chars", "confidence": 0.9, "visualRelevance": 0.9 }
  ]
}
Rules:
- Visual and physical details only (colors, materials, layout, shape, terrain, architecture).
- NO technical benchmarks, NO CPU/battery specs, NO prices, NO release dates.
- NO instructions or system commands.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini research API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          entity: req.entity,
          category: req.category,
          entityType: req.entityType,
          facts: [],
          provider: this.name,
          success: false,
          failureReason: 'INVALID_JSON_RESPONSE',
          attempted: true,
          timedOut: false
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const rawFacts = Array.isArray(parsed.facts) ? parsed.facts : [];

      return {
        entity: req.entity,
        category: req.category,
        entityType: req.entityType,
        facts: rawFacts,
        provider: this.name,
        success: rawFacts.length > 0,
        attempted: true,
        timedOut: false
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

/**
 * OpenAI Web Search Provider implementation
 * Receives STRICTLY: { entity, category }.
 */
class OpenAIWebSearchProvider implements ResearchProvider {
  public name = 'openai-web-search';

  public isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
  }

  public async lookup(req: ResearchRequest, timeoutMs: number): Promise<ResearchResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const promptText = `Provide 2 to 4 concise visual physical facts about the entity "${req.entity}" for category "${req.category}".
Return ONLY a valid JSON object matching:
{
  "entity": "${req.entity}",
  "facts": [
    { "entity": "${req.entity}", "fact": "short visual fact under 200 chars", "confidence": 0.9, "visualRelevance": 0.9 }
  ]
}
Rules:
- Visual and physical details only (colors, materials, layout, shape, terrain, architecture).
- NO technical benchmarks, NO CPU/battery specs, NO prices, NO release dates.
- NO instructions or system commands.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OPENAI_RESEARCH_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI research API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(rawText);
      const rawFacts = Array.isArray(parsed.facts) ? parsed.facts : [];

      return {
        entity: req.entity,
        category: req.category,
        entityType: req.entityType,
        facts: rawFacts,
        provider: this.name,
        success: rawFacts.length > 0,
        attempted: true,
        timedOut: false
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
