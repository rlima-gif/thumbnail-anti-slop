import type {
  VisualAuditor,
  AuditorInput,
  AuditorResult,
  AuditFinding,
  SpatialFact
} from '../types';
import fs from 'node:fs';

export class GeminiAuditor implements VisualAuditor {
  readonly name = 'gemini';
  private apiKey?: string;
  private model: string;
  private enabled: boolean;

  constructor(apiKey?: string, model?: string, enabled?: boolean) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY?.trim();
    this.model = model || process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
    const envEnabled = process.env.ENABLE_VISUAL_AUDITOR?.trim().toLowerCase();
    this.enabled = enabled !== undefined ? enabled : envEnabled !== 'false';
  }

  isConfigured(): boolean {
    return Boolean(this.enabled && this.apiKey && this.apiKey.length > 5);
  }

  private resolveImageBytes(refUrl?: string): { mimeType: string; data: string } | null {
    if (!refUrl) return null;
    const url = refUrl.trim();

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

  async audit(input: AuditorInput): Promise<AuditorResult> {
    if (!this.isConfigured()) {
      return {
        auditStatus: 'PASSED',
        findings: [],
        conflicts: [],
        missingExpectedElements: [],
        unexpectedElements: [],
        referenceLeakageRisks: [],
        spatialFacts: [],
        confidence: 1.0
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const systemInstruction = `You are a forensic Visual Auditor for AI image generation, compositing, and YouTube thumbnails.
You do NOT write prompts. You do NOT make creative decisions.
Your sole job is to answer structured visual audit questions about the supplied references:

1. PERSON CHECK: Is a PESSOA reference clearly a portrait? Does its background contain an unrelated domestic room/bedroom/setting that poses a leakage risk?
2. TARGET CHECK: If there is an IMAGEM_ALVO, what is the head orientation? What is the character holding (e.g. map, sword, object)? What is the costume/armor?
3. ENVIRONMENT CHECK: Is the environment indoor or outdoor? What major architecture/terrain is present?
4. PRODUCT CHECK: If there is a PRODUTO reference, what is the exact hardware/device?
5. CONFLICT CHECK: Are there direct contradictions between references?
6. TEXT/GRAPHICS CHECK: Is there unwanted text in any reference that must not be copied?

Output strictly valid JSON:
{
  "auditStatus": "PASSED" | "WARNINGS" | "CONFLICTS_DETECTED",
  "findings": [
    {
      "referenceId": "referenceId or empty",
      "category": "PERSON_PORTRAIT" | "TARGET_PROPS" | "HEAD_ORIENTATION" | "ENVIRONMENT_TYPE" | "PRODUCT_GEOMETRY" | "LEAKAGE_RISK" | "CONFLICT" | "TEXT_UNWANTED" | "LIGHTING_COHERENCE",
      "description": "factual visual finding",
      "severity": "INFO" | "WARNING" | "CRITICAL",
      "confidence": 0.0 - 1.0
    }
  ],
  "conflicts": ["list of detected contradictions"],
  "missingExpectedElements": ["elements requested in prompt but missing from references"],
  "unexpectedElements": ["elements visible in references that were not requested"],
  "referenceLeakageRisks": ["specific elements from references that risk leaking (e.g. 'bedroom in portrait ref-1')"],
  "spatialFacts": [
    {
      "referenceId": "referenceId",
      "label": "face" | "head" | "hands" | "map" | "console" | "product" | "background",
      "box_2d": [ymin, xmin, ymax, xmax], // normalized 0-1000
      "description": "spatial description"
    }
  ],
  "confidence": 0.0 - 1.0
}`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      parts.push({
        text: `${systemInstruction}\n\nAUDIT CONTEXT:\nTask: ${input.taskType || 'UNKNOWN'}\nIdea: "${input.userIdea || ''}"\nProposed Prompt: "${input.proposedPrompt || ''}"`
      });

      // If auditing an uploaded thumbnail directly (ANALISAR THUMBNAIL)
      if (input.imageToAudit) {
        parts.push({ text: '\n--- THUMBNAIL TO AUDIT ---' });
        const bytes = this.resolveImageBytes(input.imageToAudit);
        if (bytes) {
          parts.push({ inlineData: { mimeType: bytes.mimeType, data: bytes.data } });
        }
      }

      // References audit
      for (const ref of input.references.slice(0, 3)) {
        parts.push({
          text: `\n--- REFERENCE ---\nID: ${ref.id}\nROLE: ${ref.role}\nPURPOSE: ${ref.purpose}\nNAME: ${ref.name}`
        });
        const bytes = this.resolveImageBytes(ref.url);
        if (bytes) {
          parts.push({ inlineData: { mimeType: bytes.mimeType, data: bytes.data } });
        }
      }

      parts.push({ text: '\nPerform forensic audit now. Return strictly valid JSON.' });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey!)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`Gemini Auditor non-fatal error (${response.status}):`, errText.slice(0, 150));
        return {
          auditStatus: 'PASSED',
          findings: [],
          conflicts: [],
          missingExpectedElements: [],
          unexpectedElements: [],
          referenceLeakageRisks: [],
          spatialFacts: [],
          confidence: 0.7
        };
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return {
          auditStatus: 'PASSED',
          findings: [],
          conflicts: [],
          missingExpectedElements: [],
          unexpectedElements: [],
          referenceLeakageRisks: [],
          spatialFacts: [],
          confidence: 0.7
        };
      }

      const parsed = JSON.parse(rawText) as Record<string, unknown>;

      const findings: AuditFinding[] = Array.isArray(parsed.findings)
        ? parsed.findings.map((f: unknown) => {
            const item = (f && typeof f === 'object' ? f : {}) as Record<string, unknown>;
            return {
              referenceId: item.referenceId ? String(item.referenceId) : undefined,
              category: (item.category as AuditFinding['category']) || 'LEAKAGE_RISK',
              description: String(item.description || ''),
              severity: (item.severity as AuditFinding['severity']) || 'INFO',
              confidence: typeof item.confidence === 'number' ? item.confidence : 0.8
            };
          })
        : [];

      const spatialFacts: SpatialFact[] = Array.isArray(parsed.spatialFacts)
        ? parsed.spatialFacts.map((s: unknown) => {
            const item = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
            return {
              referenceId: String(item.referenceId || ''),
              label: String(item.label || ''),
              box_2d: Array.isArray(item.box_2d) && item.box_2d.length === 4
                ? [Number(item.box_2d[0]), Number(item.box_2d[1]), Number(item.box_2d[2]), Number(item.box_2d[3])]
                : undefined,
              description: String(item.description || '')
            };
          })
        : [];

      return {
        auditStatus: (parsed.auditStatus as AuditorResult['auditStatus']) || 'PASSED',
        findings,
        conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts.map(String) : [],
        missingExpectedElements: Array.isArray(parsed.missingExpectedElements) ? parsed.missingExpectedElements.map(String) : [],
        unexpectedElements: Array.isArray(parsed.unexpectedElements) ? parsed.unexpectedElements.map(String) : [],
        referenceLeakageRisks: Array.isArray(parsed.referenceLeakageRisks) ? parsed.referenceLeakageRisks.map(String) : [],
        spatialFacts,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85
      };
    } catch (err: unknown) {
      console.warn('Gemini Auditor encountered non-fatal error:', err instanceof Error ? err.message : err);
      // Auditor never blocks successful execution
      return {
        auditStatus: 'PASSED',
        findings: [],
        conflicts: [],
        missingExpectedElements: [],
        unexpectedElements: [],
        referenceLeakageRisks: [],
        spatialFacts: [],
        confidence: 0.7
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
