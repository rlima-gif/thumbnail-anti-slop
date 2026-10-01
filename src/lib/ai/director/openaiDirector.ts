import type {
  VisualDirector,
  DirectorInput,
  DirectorResult,
  VisualFact,
  ProposedAttributeOwners,
  DirectorReferenceInput
} from '../types';
import fs from 'node:fs';

export class OpenAIDirector implements VisualDirector {
  readonly name = 'openai';
  private apiKey?: string;
  private model: string;
  private visionDetail: 'low' | 'high' | 'auto';

  constructor(apiKey?: string, model?: string, visionDetail?: 'low' | 'high' | 'auto') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY?.trim();
    this.model = model || process.env.OPENAI_MODEL?.trim() || process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o';
    this.visionDetail = (visionDetail || process.env.OPENAI_VISION_DETAIL?.trim() || 'high') as 'low' | 'high' | 'auto';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  private resolveImageUrl(ref: DirectorReferenceInput): string | null {
    if (!ref.url) return null;
    const url = ref.url.trim();

    // Already a Data URL
    if (url.startsWith('data:image/')) {
      return url;
    }

    // Public URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Server-local file path (for test fixtures or server-side images)
    try {
      if (typeof window === 'undefined' && fs.existsSync(url)) {
        const buffer = fs.readFileSync(url);
        const ext = url.split('.').pop()?.toLowerCase() || 'png';
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
        return `data:${mime};base64,${buffer.toString('base64')}`;
      }
    } catch {
      // Ignore filesystem errors and return null
    }

    return null;
  }

  async analyze(input: DirectorInput): Promise<DirectorResult> {
    if (!this.isConfigured()) {
      throw new Error('OPENAI DIRECTOR NOT CONFIGURED: OPENAI_API_KEY is missing.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    try {
      const systemPrompt = `You are an elite Multimodal Visual Director for YouTube thumbnails and high-impact visual design.
Your task is to analyze the user request and supplied visual references to output a STRONGLY STRUCTURED SCENE UNDERSTANDING.

CRITICAL ARCHITECTURAL MANDATES:
1. GROUNDED IN VISUAL FACTS: Inspect every image carefully. Report what is ACTUALLY visible (head orientation, hand grasp, armor/clothing, lighting direction, environment, props). Never turn uncertain guesses into absolute facts; use appropriate confidence.
2. AUTHORITY & PROVENANCE:
   - IMAGEM_ALVO (Target Image): Master structural authority for poses, 3D skull angle, costume/armor, camera framing, lighting, and held props.
   - PESSOA (Person Source): Identity source only (facial proportions, bone structure, eye shape, nose, mouth, authentic age, natural asymmetry).
   - CENÁRIO (Scenario): Environment source only.
   - PRODUTO (Product): Hardware geometry source only.
3. IDENTITY RECONSTRUCTION (NEVER FACE PASTE):
   - Never instruct "paste face", "overlay face", or "cut and paste".
   - Instruct anatomical reconstruction: reconstruct the target character's facial anatomy so it embodies the source person's authentic identity while preserving target 3D skull orientation, head tilt, expression, and camera perspective.
4. INDEPENDENT ATTRIBUTE OWNERSHIP:
   - Hair and beard ownership are strictly independent of facial identity.
   - Target props (like a character holding a map) remain with the TARGET unless explicitly modified.
5. NO INVENTED DOMESTIC CLUTTER:
   - Do NOT invent bedrooms, living rooms, sofas, desks, lamps, or streamer setups unless explicitly present in the target/scenario or requested by the user.

Output strictly valid JSON matching this schema:
{
  "taskType": "IDENTITY_TRANSFER" | "REPLACE_OBJECT" | "CHANGE_ENVIRONMENT" | "CHANGE_APPEARANCE" | "STYLE_TRANSFER" | "COMPOSITION_TRANSFER" | "CREATE_NEW_SCENE",
  "confidence": 0.0 - 1.0,
  "targetImageId": "referenceId or empty",
  "identitySourceId": "referenceId or empty",
  "productSourceId": "referenceId or empty",
  "environmentSourceId": "referenceId or empty",
  "styleSourceId": "referenceId or empty",
  "compositionSourceId": "referenceId or empty",
  "visualFacts": [
    {
      "referenceId": "referenceId",
      "category": "HEAD_ORIENTATION" | "EXPRESSION" | "BODY_POSE" | "HAND_ACTION" | "CLOTHING_ARMOR" | "PROPS" | "PRODUCT_HARDWARE" | "ENVIRONMENT" | "LIGHTING" | "COMPOSITION" | "STYLE",
      "fact": "concise factual description of visible element",
      "confidence": 0.0 - 1.0
    }
  ],
  "attributeOwners": {
    "faceOwner": "PERSON_REFERENCE" | "TARGET_IMAGE" | "USER_REQUEST" | "NONE",
    "hairOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST" | "NONE",
    "beardOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST" | "NONE",
    "headAngleOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "INFERRED",
    "expressionOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST",
    "bodyOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST",
    "poseOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST",
    "clothingOwner": "TARGET_IMAGE" | "PERSON_REFERENCE" | "USER_REQUEST",
    "armorOwner": "TARGET_IMAGE" | "USER_REQUEST" | "NONE",
    "propsOwner": "TARGET_IMAGE" | "USER_REQUEST" | "NONE",
    "handsOwner": "TARGET_IMAGE" | "NECESSARY_ADAPTATION" | "NONE",
    "productOwner": "PRODUCT_REFERENCE" | "USER_REQUEST" | "NONE",
    "environmentOwner": "SCENARIO_REFERENCE" | "TARGET_IMAGE" | "USER_REQUEST" | "NONE",
    "backgroundOwner": "SCENARIO_REFERENCE" | "TARGET_IMAGE" | "USER_REQUEST" | "NONE",
    "lightingOwner": "TARGET_IMAGE" | "SCENARIO_REFERENCE" | "JUSTIFIED_INFERENCE",
    "cameraOwner": "TARGET_IMAGE" | "JUSTIFIED_INFERENCE",
    "compositionOwner": "TARGET_IMAGE" | "COMPOSITION_REFERENCE" | "JUSTIFIED_INFERENCE",
    "styleOwner": "STYLE_REFERENCE" | "NONE"
  },
  "preserve": ["specific visual attributes to preserve from references"],
  "change": ["specific visual attributes to modify"],
  "adapt": ["anatomical or physical adaptations necessary"],
  "avoid": ["visual cliches, leakage, or unwanted elements to avoid"],
  "ambiguities": ["any unclear user instructions"],
  "suggestedClarification": ["clarifying suggestions if any"],
  "directorWarnings": ["potential reference conflicts or visual warnings"]
}`;

      // Build multimodal content with stable IDs and role purposes
      const contentParts: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [];

      contentParts.push({
        type: 'text',
        text: `USER REQUEST CONTEXT:
Video Title: "${input.videoTitle || 'Untitled'}"
User Idea / Instructions: "${input.userIdea}"
${input.thumbnailText ? `Thumbnail Text: "${input.thumbnailText}"` : ''}
${input.taskType ? `Initial Engine Classification: ${input.taskType}` : ''}
Total References: ${input.references.length}

Inspect the following visual references. Every image is tagged with its role, stable ID, and purpose.`
      });

      // Filter relevant references (Section 33: Cost Control)
      // Send at most 4 most relevant references to avoid unnecessary token explosion
      const relevantRefs = input.references.slice(0, 4);

      for (const ref of relevantRefs) {
        const resolvedUrl = this.resolveImageUrl(ref);
        const refHeader = `--- REFERENCE START ---
ID: ${ref.id}
ROLE: ${ref.role}
PURPOSE: ${ref.purpose}
NAME: ${ref.name}
${ref.scenarioMode ? `SCENARIO MODE: ${ref.scenarioMode}` : ''}
${ref.isTarget ? 'TARGET MASTER: TRUE (Structural anchor)' : ''}`;

        contentParts.push({
          type: 'text',
          text: refHeader
        });

        if (resolvedUrl) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: resolvedUrl,
              detail: this.visionDetail
            }
          });
        }
      }

      contentParts.push({
        type: 'text',
        text: 'Analyze these inputs now. Return strictly the structured JSON scene understanding.'
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentParts }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenAI Director API error (${response.status}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('OpenAI Director returned an empty response.');
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawContent) as Record<string, unknown>;
      } catch {
        throw new Error('Failed to parse OpenAI Director JSON response.');
      }

      // Sanitize and validate DirectorResult
      const visualFacts: VisualFact[] = Array.isArray(parsed.visualFacts)
        ? parsed.visualFacts.map((vf: unknown) => {
            const v = (vf && typeof vf === 'object' ? vf : {}) as Record<string, unknown>;
            return {
              referenceId: String(v.referenceId || ''),
              category: (v.category as VisualFact['category']) || 'COMPOSITION',
              fact: String(v.fact || ''),
              confidence: typeof v.confidence === 'number' ? v.confidence : 0.8
            };
          })
        : [];

      const rawOwners = (parsed.attributeOwners && typeof parsed.attributeOwners === 'object'
        ? parsed.attributeOwners
        : {}) as Record<string, unknown>;

      const attributeOwners: ProposedAttributeOwners = {};
      const ownerKeys: Array<keyof ProposedAttributeOwners> = [
        'faceOwner',
        'hairOwner',
        'beardOwner',
        'headAngleOwner',
        'expressionOwner',
        'bodyOwner',
        'poseOwner',
        'clothingOwner',
        'armorOwner',
        'propsOwner',
        'handsOwner',
        'productOwner',
        'environmentOwner',
        'backgroundOwner',
        'lightingOwner',
        'cameraOwner',
        'compositionOwner',
        'styleOwner'
      ];

      for (const k of ownerKeys) {
        if (typeof rawOwners[k] === 'string') {
          attributeOwners[k] = rawOwners[k] as ProposedAttributeOwners[typeof k];
        }
      }

      return {
        taskType: (parsed.taskType as DirectorResult['taskType']) || input.taskType || 'CREATE_NEW_SCENE',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        targetImageId: parsed.targetImageId ? String(parsed.targetImageId) : undefined,
        identitySourceId: parsed.identitySourceId ? String(parsed.identitySourceId) : undefined,
        productSourceId: parsed.productSourceId ? String(parsed.productSourceId) : undefined,
        environmentSourceId: parsed.environmentSourceId ? String(parsed.environmentSourceId) : undefined,
        styleSourceId: parsed.styleSourceId ? String(parsed.styleSourceId) : undefined,
        compositionSourceId: parsed.compositionSourceId ? String(parsed.compositionSourceId) : undefined,
        visualFacts,
        attributeOwners,
        preserve: Array.isArray(parsed.preserve) ? parsed.preserve.map(String) : [],
        change: Array.isArray(parsed.change) ? parsed.change.map(String) : [],
        adapt: Array.isArray(parsed.adapt) ? parsed.adapt.map(String) : [],
        avoid: Array.isArray(parsed.avoid) ? parsed.avoid.map(String) : [],
        ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities.map(String) : [],
        suggestedClarification: Array.isArray(parsed.suggestedClarification) ? parsed.suggestedClarification.map(String) : [],
        directorWarnings: Array.isArray(parsed.directorWarnings) ? parsed.directorWarnings.map(String) : [],
        rawInterpretation: rawContent
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('OpenAI Director timeout (35s). Reference images may be too large.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
