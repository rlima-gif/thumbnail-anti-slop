import type {
  VisualDirector,
  DirectorInput,
  DirectorResult,
  VisualFact,
  ProposedAttributeOwners,
  DirectorReferenceInput
} from '../types';
import fs from 'node:fs';

export class GeminiDirector implements VisualDirector {
  readonly name = 'gemini';
  private apiKey?: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY?.trim();
    this.model = model || process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  private resolveImageBytes(ref: DirectorReferenceInput): { mimeType: string; data: string } | null {
    if (!ref.url) return null;
    const url = ref.url.trim();

    if (url.startsWith('data:image/')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }

    try {
      if (typeof window === 'undefined' && fs.existsSync(url)) {
        const buffer = fs.readFileSync(url);
        const ext = url.split('.').pop()?.toLowerCase() || 'png';
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
        return { mimeType: mime, data: buffer.toString('base64') };
      }
    } catch {
      // Ignore filesystem errors
    }

    return null;
  }

  async analyze(input: DirectorInput): Promise<DirectorResult> {
    if (!this.isConfigured()) {
      throw new Error('GEMINI DIRECTOR NOT CONFIGURED: GEMINI_API_KEY is missing.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    try {
      const systemInstruction = `You are an elite Multimodal Visual Director for YouTube thumbnails and high-impact visual design.
Your task is to analyze the user request and supplied visual references to output a STRONGLY STRUCTURED SCENE UNDERSTANDING.

CRITICAL ARCHITECTURAL MANDATES:
1. GROUNDED IN VISUAL FACTS: Inspect every image carefully. Report what is ACTUALLY visible.
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

Output strictly valid JSON:
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
      "fact": "factual description",
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
  "preserve": ["attributes to preserve"],
  "change": ["attributes to modify"],
  "adapt": ["physical adaptations"],
  "avoid": ["cliches or leakage to avoid"],
  "ambiguities": ["unclear user instructions"],
  "suggestedClarification": ["clarifications"],
  "directorWarnings": ["warnings"]
}`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      parts.push({
        text: `${systemInstruction}\n\nUSER REQUEST CONTEXT:\nVideo Title: "${input.videoTitle || 'Untitled'}"\nUser Idea: "${input.userIdea}"\n${input.thumbnailText ? `Thumbnail Text: "${input.thumbnailText}"` : ''}\n${input.taskType ? `Initial Classification: ${input.taskType}` : ''}`
      });

      const relevantRefs = input.references.slice(0, 4);
      for (const ref of relevantRefs) {
        const refHeader = `\n--- REFERENCE START ---\nID: ${ref.id}\nROLE: ${ref.role}\nPURPOSE: ${ref.purpose}\nNAME: ${ref.name}\n${ref.scenarioMode ? `SCENARIO MODE: ${ref.scenarioMode}\n` : ''}${ref.isTarget ? 'TARGET MASTER: TRUE (Structural anchor)\n' : ''}`;
        parts.push({ text: refHeader });

        const bytes = this.resolveImageBytes(ref);
        if (bytes) {
          parts.push({
            inlineData: {
              mimeType: bytes.mimeType,
              data: bytes.data
            }
          });
        }
      }

      parts.push({
        text: '\nAnalyze these inputs now. Return strictly the structured JSON scene understanding.'
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey!)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Gemini Director API error (${response.status}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini Director returned an empty response.');
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        throw new Error('Failed to parse Gemini Director JSON response.');
      }

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
        rawInterpretation: rawText
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Gemini Director timeout (35s). Reference images may be too large.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
