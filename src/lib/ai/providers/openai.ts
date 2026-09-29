import {
  AIProvider,
  AIProviderStatus,
  AnalyzeThumbnailInput,
  CompareThumbnailsInput,
  GenerateDirectionInput,
  RefinePromptInput,
  SuggestedDirectionOutput,
  RefinePromptOutput
} from '../types';
import {
  ThumbnailAIAnalysis,
  ThumbnailAIComparison,
  AnalysisRegion,
  UncertaintyLevel,
  ProjectData
} from '@/types';
import {
  ANALYZE_THUMBNAIL_SYSTEM_PROMPT,
  buildAnalyzeThumbnailUserPrompt
} from '../prompts/analyzeThumbnail';
import {
  COMPARE_THUMBNAILS_SYSTEM_PROMPT,
  buildCompareThumbnailsUserPrompt
} from '../prompts/compareThumbnails';
import {
  GENERATE_DIRECTION_SYSTEM_PROMPT,
  buildGenerateDirectionUserPrompt,
  REFINE_PROMPT_SYSTEM_PROMPT,
  buildRefinePromptUserPrompt
} from '../prompts/generateDirection';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private apiKey: string;
  private visionModel: string;
  private textModel: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.visionModel = process.env.OPENAI_VISION_MODEL || 'gpt-4o';
    this.textModel = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';
  }

  async getStatus(): Promise<AIProviderStatus> {
    return {
      configured: Boolean(this.apiKey && this.apiKey.length > 5),
      provider: 'OpenAI',
      model: this.visionModel,
      supportsVision: true
    };
  }

  private async callChatCompletion(messages: unknown[], model: string, jsonMode = true): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        if (response.status === 401) {
          throw new Error('Chave de API OpenAI inválida ou não autorizada. Verifique OPENAI_API_KEY.');
        } else if (response.status === 429) {
          throw new Error('Limite de taxa (Rate Limit) da OpenAI atingido. Aguarde alguns instantes antes de tentar novamente.');
        } else if (response.status >= 500) {
          throw new Error(`Serviço OpenAI indisponível no momento (${response.status}). Tente mais tarde.`);
        }
        throw new Error(`Erro na API OpenAI (${response.status}): ${errorBody.slice(0, 150)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('A API OpenAI retornou uma resposta vazia.');
      }
      return content;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Tempo limite de análise excedido (timeout de 45s). A imagem pode ser muito pesada.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async analyzeThumbnail(input: AnalyzeThumbnailInput): Promise<ThumbnailAIAnalysis> {
    const userText = buildAnalyzeThumbnailUserPrompt(input);

    const messages = [
      { role: 'system', content: ANALYZE_THUMBNAIL_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          {
            type: 'image_url',
            image_url: {
              url: input.imageBase64OrUrl,
              detail: 'high'
            }
          }
        ]
      }
    ];

    const rawJson = await this.callChatCompletion(messages, this.visionModel, true);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      throw new Error('Falha ao decodificar resposta JSON estruturada da análise visual.');
    }

    const parseUncertainty = (val: unknown, fallback: UncertaintyLevel = 'LIKELY'): UncertaintyLevel => {
      if (val === 'CONFIDENT' || val === 'LIKELY' || val === 'UNCERTAIN') {
        return val;
      }
      return fallback;
    };

    // Validate and sanitize regions
    const rawRegions = Array.isArray(parsed.regions) ? parsed.regions : [];
    const regions: AnalysisRegion[] = rawRegions.map((rawItem: unknown, idx: number) => {
      const r = (rawItem && typeof rawItem === 'object' ? rawItem : {}) as Record<string, unknown>;
      const rawPatch = (r.patchProposal && typeof r.patchProposal === 'object' ? r.patchProposal : null) as Record<string, unknown> | null;
      
      return {
        id: typeof r.id === 'string' ? r.id : `region-${idx + 1}`,
        type: typeof r.type === 'string' ? (r.type as AnalysisRegion['type']) : 'observation',
        label: typeof r.label === 'string' ? r.label : 'Região Analisada',
        x: Math.max(0, Math.min(1, Number(r.x) || 0)),
        y: Math.max(0, Math.min(1, Number(r.y) || 0)),
        width: Math.max(0.01, Math.min(1, Number(r.width) || 0.2)),
        height: Math.max(0.01, Math.min(1, Number(r.height) || 0.2)),
        visibleEvidence: typeof r.visibleEvidence === 'string' ? r.visibleEvidence : '',
        interpretation: typeof r.interpretation === 'string' ? r.interpretation : '',
        uncertainty: parseUncertainty(r.uncertainty, 'LIKELY'),
        suggestedAntiSlopTerm: typeof r.suggestedAntiSlopTerm === 'string' ? r.suggestedAntiSlopTerm : undefined,
        patchProposal: rawPatch
          ? {
              field: typeof rawPatch.field === 'string' ? (rawPatch.field as keyof ProjectData) : undefined,
              currentValue: rawPatch.currentValue !== undefined ? String(rawPatch.currentValue) : undefined,
              proposedValue: rawPatch.proposedValue !== undefined ? String(rawPatch.proposedValue) : undefined,
              actionLabel: typeof rawPatch.actionLabel === 'string' ? rawPatch.actionLabel : 'Aplicar Correção'
            }
          : undefined
      };
    });

    const rawPrimary = (parsed.primaryFocalPoint && typeof parsed.primaryFocalPoint === 'object'
      ? parsed.primaryFocalPoint
      : {}) as Record<string, unknown>;
    const rawSecondary = Array.isArray(parsed.secondaryFocalPoints) ? parsed.secondaryFocalPoints : [];

    const analysis: ThumbnailAIAnalysis = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      summary: String(parsed.summary || 'Análise visual concluída.'),
      primaryFocalPoint: {
        evidence: String(rawPrimary.evidence || 'Evidência física não declarada'),
        interpretation: String(rawPrimary.interpretation || ''),
        uncertainty: parseUncertainty(rawPrimary.uncertainty, 'CONFIDENT')
      },
      secondaryFocalPoints: rawSecondary.map((rawF: unknown) => {
        const f = (rawF && typeof rawF === 'object' ? rawF : {}) as Record<string, unknown>;
        return {
          description: String(f.description || ''),
          uncertainty: parseUncertainty(f.uncertainty, 'LIKELY')
        };
      }),
      visualHierarchy: String(parsed.visualHierarchy || 'Hierarquia não detalhada'),
      mobileReadability: String(parsed.mobileReadability || 'Legibilidade mobile aceitável'),
      subjectBackgroundSeparation: String(parsed.subjectBackgroundSeparation || 'Separação média'),
      facialNaturalness: parsed.facialNaturalness ? String(parsed.facialNaturalness) : undefined,
      lightingCoherence: String(parsed.lightingCoherence || 'Iluminação observada'),
      perspectiveCoherence: String(parsed.perspectiveCoherence || 'Perspectiva coerente'),
      hardwareFidelity: parsed.hardwareFidelity ? String(parsed.hardwareFidelity) : undefined,
      textLegibility: String(parsed.textLegibility || 'Sem texto concorrente'),
      titleThumbnailRelationship: String(parsed.titleThumbnailRelationship || 'Relação com título avaliada'),
      aiArtifactSignals: Array.isArray(parsed.aiArtifactSignals) ? parsed.aiArtifactSignals.map(String) : [],
      slopSignals: Array.isArray(parsed.slopSignals) ? parsed.slopSignals.map(String) : [],
      unnecessaryElements: Array.isArray(parsed.unnecessaryElements) ? parsed.unnecessaryElements.map(String) : [],
      successfulElements: Array.isArray(parsed.successfulElements) ? parsed.successfulElements.map(String) : [],
      highestImpactChange: String(parsed.highestImpactChange || 'Manter a direção e testar a 10% no mobile.'),
      uncertainty: Array.isArray(parsed.uncertainty) ? parsed.uncertainty.map(String) : [],
      regions
    };

    return analysis;
  }

  async compareThumbnails(input: CompareThumbnailsInput): Promise<ThumbnailAIComparison> {
    const userText = buildCompareThumbnailsUserPrompt(input);

    const messages = [
      { role: 'system', content: COMPARE_THUMBNAILS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          {
            type: 'image_url',
            image_url: { url: input.imageA, detail: 'high' }
          },
          {
            type: 'image_url',
            image_url: { url: input.imageB, detail: 'high' }
          }
        ]
      }
    ];

    const rawJson = await this.callChatCompletion(messages, this.visionModel, true);
    const parsed = JSON.parse(rawJson);

    return {
      id: `comp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      aEnfatiza: String(parsed.aEnfatiza || 'Thumbnail A foca em...'),
      bEnfatiza: String(parsed.bEnfatiza || 'Thumbnail B foca em...'),
      diferencasHierarquia: String(parsed.diferencasHierarquia || ''),
      diferencasLegibilidade: String(parsed.diferencasLegibilidade || ''),
      diferencasCuriosidade: String(parsed.diferencasCuriosidade || ''),
      diferencasArtificialidade: String(parsed.diferencasArtificialidade || ''),
      riscosA: Array.isArray(parsed.riscosA) ? parsed.riscosA.map(String) : [],
      riscosB: Array.isArray(parsed.riscosB) ? parsed.riscosB.map(String) : [],
      oQueEsteTesteEstaRealmenteTestando: String(parsed.oQueEsteTesteEstaRealmenteTestando || 'Comparativo conceitual de foco.')
    };
  }

  async generateDirection(input: GenerateDirectionInput): Promise<SuggestedDirectionOutput> {
    const userText = buildGenerateDirectionUserPrompt(input);
    const messages = [
      { role: 'system', content: GENERATE_DIRECTION_SYSTEM_PROMPT },
      { role: 'user', content: userText }
    ];

    const rawJson = await this.callChatCompletion(messages, this.textModel, true);
    const parsed = JSON.parse(rawJson);

    return {
      visualPromise: String(parsed.visualPromise || ''),
      viewerQuestion: String(parsed.viewerQuestion || ''),
      protagonist: String(parsed.protagonist || ''),
      protagonistType: parsed.protagonistType || 'Pessoa',
      protagonistPresence: Number(parsed.protagonistPresence) || 60,
      secondarySubject: String(parsed.secondarySubject || ''),
      storyMoment: String(parsed.storyMoment || ''),
      composition: String(parsed.composition || ''),
      camera: String(parsed.camera || ''),
      expression: String(parsed.expression || ''),
      lighting: String(parsed.lighting || ''),
      palette: String(parsed.palette || ''),
      background: String(parsed.background || ''),
      depth: String(parsed.depth || ''),
      thumbnailText: String(parsed.thumbnailText || ''),
      channelIdentity: String(parsed.channelIdentity || ''),
      visualStyle: String(parsed.visualStyle || '')
    };
  }

  async refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
    const userText = buildRefinePromptUserPrompt(input);
    const messages = [
      { role: 'system', content: REFINE_PROMPT_SYSTEM_PROMPT },
      { role: 'user', content: userText }
    ];

    const rawJson = await this.callChatCompletion(messages, this.textModel, true);
    const parsed = JSON.parse(rawJson);

    return {
      refinedPrompt: String(parsed.refinedPrompt || input.currentPrompt),
      diffSummary: String(parsed.diffSummary || 'Prompt refinado para maior naturalidade e clareza óptica.'),
      whatChanged: Array.isArray(parsed.whatChanged) ? parsed.whatChanged.map(String) : []
    };
  }
}
