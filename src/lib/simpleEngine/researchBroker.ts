import type {
  AllowedResearchCategory,
  ResearchFact,
  ResearchResult,
  ScenePlan
} from '../../types/simple.ts';
import { isEligibleNamedEntity } from './themeResolver.ts';

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
}

export interface ResearchProvider {
  name: string;
  isConfigured(): boolean;
  lookup(req: ResearchRequest, timeoutMs: number): Promise<ResearchResult>;
}

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

  public static isResearchEnabled(): boolean {
    return process.env.RESEARCH_ENABLED === 'true';
  }

  public static getTimeoutMs(): number {
    const val = Number(process.env.RESEARCH_TIMEOUT_MS);
    return Number.isFinite(val) && val > 0 ? val : 4000;
  }

  /**
   * Deterministic local-first eligibility check.
   * Cheap and instantaneous without any LLM calls.
   */
  public static isEligible(
    entity: string,
    category: AllowedResearchCategory,
    plan?: ScenePlan
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

    // 3. If plan provided, check if information is already locked by higher authority
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
    category: AllowedResearchCategory
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

    return {
      entity: cleanEntity,
      category
    };
  }

  /**
   * Security & sanitization filter: validates a single research fact.
   * Returns sanitized ResearchFact or null if rejected.
   */
  public static sanitizeAndValidateFact(
    raw: unknown,
    entity: string,
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
      entity,
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
    customTimeoutMs?: number
  ): Promise<ResearchResult> {
    const startTime = Date.now();
    const timeoutMs = customTimeoutMs || ResearchBroker.getTimeoutMs();

    // 1. Check Kill Switch
    if (!ResearchBroker.isResearchEnabled() && !ResearchBroker.mockProvider) {
      return {
        entity: req.entity,
        category: req.category,
        facts: [],
        provider: 'none',
        success: false,
        failureReason: 'RESEARCH_DISABLED'
      };
    }

    // 2. Sanitize query to ensure strict privacy
    const sanitizedReq = ResearchBroker.sanitizeQuery(req.entity, req.category);
    if (!sanitizedReq) {
      return {
        entity: req.entity,
        category: req.category,
        facts: [],
        provider: 'none',
        success: false,
        failureReason: 'INVALID_QUERY_OR_CATEGORY'
      };
    }

    // 3. Cache lookup
    const cacheKey = `${sanitizedReq.entity.toLowerCase()}::${sanitizedReq.category}`;
    const cached = RESEARCH_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return {
        ...cached.result,
        cached: true,
        latencyMs: Date.now() - startTime
      };
    }

    // 4. Determine provider
    const provider = ResearchBroker.mockProvider || ResearchBroker.getDefaultProvider();
    if (!provider || !provider.isConfigured()) {
      return {
        entity: sanitizedReq.entity,
        category: sanitizedReq.category,
        facts: [],
        provider: provider?.name || 'none',
        success: false,
        failureReason: 'PROVIDER_NOT_CONFIGURED'
      };
    }

    // 5. Execute with hard timeout
    try {
      const resultPromise = provider.lookup(sanitizedReq, timeoutMs);
      const timeoutPromise = new Promise<ResearchResult>((_, reject) =>
        setTimeout(() => reject(new Error('RESEARCH_TIMEOUT')), timeoutMs)
      );

      const rawResult = await Promise.race([resultPromise, timeoutPromise]);

      // 6. Security filter and schema validation
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
        facts: validatedFacts,
        provider: provider.name,
        latencyMs: Date.now() - startTime,
        success: validatedFacts.length > 0,
        failureReason: validatedFacts.length === 0 ? 'NO_FACTS_ACCEPTED' : undefined
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
      return {
        entity: sanitizedReq.entity,
        category: sanitizedReq.category,
        facts: [],
        provider: provider.name,
        latencyMs: Date.now() - startTime,
        success: false,
        failureReason: msg === 'RESEARCH_TIMEOUT' ? 'TIMEOUT' : 'PROVIDER_ERROR'
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
  "facts": [
    { "fact": "short visual fact under 200 chars", "confidence": 0.9, "visualRelevance": 0.9 }
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
          facts: [],
          provider: this.name,
          success: false,
          failureReason: 'INVALID_JSON_RESPONSE'
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const rawFacts = Array.isArray(parsed.facts) ? parsed.facts : [];

      return {
        entity: req.entity,
        category: req.category,
        facts: rawFacts,
        provider: this.name,
        success: rawFacts.length > 0
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

/**
 * OpenAI Web Search Provider implementation
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
  "facts": [
    { "fact": "short visual fact under 200 chars", "confidence": 0.9, "visualRelevance": 0.9 }
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
        facts: rawFacts,
        provider: this.name,
        success: rawFacts.length > 0
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
