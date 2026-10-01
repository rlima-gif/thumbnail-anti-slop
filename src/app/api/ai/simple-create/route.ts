import { NextRequest, NextResponse } from 'next/server';
import {
  generateSimpleThumbnail,
  buildScenePlan,
  buildPromptFromScenePlan,
  auditPromptProvenance
} from '@/lib/simpleEngine/engine';
import {
  getVisualDirector,
  getVisualAuditor,
  mapReferencesToDirectorInput,
  reconcileDirectorWithLocalRules
} from '@/lib/ai/orchestrator';
import type { CreateThumbnailInput } from '@/types/simple';
import type { DirectorResult, AuditorResult } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const rawBody = await req.json();
    const body: CreateThumbnailInput = {
      ...rawBody,
      ideaDescription: rawBody.ideaDescription || rawBody.idea || '',
      videoTitle: rawBody.videoTitle || '',
      references: rawBody.references || []
    };

    // 1. LOCAL INITIAL CLASSIFICATION & BASELINE SCENE PLAN
    const localScenePlan = buildScenePlan(body, body.approachIndex || 0);

    // 2. MULTIMODAL AI DIRECTOR (if configured and references warrant multimodal analysis)
    const { director, providerName: dirProvider } = getVisualDirector();
    let directorResult: DirectorResult | null = null;
    let directorLatencyMs: number | undefined;

    const hasImages = (body.references || []).length > 0;
    const shouldInvokeDirector = Boolean(director && director.isConfigured() && hasImages);

    if (shouldInvokeDirector && director) {
      const dirStart = Date.now();
      try {
        const directorRefs = mapReferencesToDirectorInput(body.references);
        directorResult = await director.analyze({
          userIdea: body.ideaDescription,
          videoTitle: body.videoTitle,
          thumbnailText: body.thumbnailText,
          taskType: localScenePlan.taskType,
          references: directorRefs,
          approachIndex: body.approachIndex
        });
        directorLatencyMs = Date.now() - dirStart;
      } catch (err: unknown) {
        console.warn('AI Director call failed or timed out, gracefully falling back to local engine:', err instanceof Error ? err.message : err);
        directorResult = null;
      }
    }

    // 3. LOCAL AUTHORITY / PROVENANCE GUARD (Merge Policy — Section 11)
    // Deterministic reconciliation: User intent > Reference roles > Target master > Local rules > AI facts
    const reconciledPlan = reconcileDirectorWithLocalRules(directorResult, localScenePlan, body);

    // 4. PROMPT BUILDER
    const builderResult = buildPromptFromScenePlan(reconciledPlan, body, body.approachIndex || 0);

    // 5. LOCAL FINAL VALIDATOR & PROVENANCE AUDIT
    const audit = auditPromptProvenance(builderResult.finalPrompt, reconciledPlan, body.references);
    let finalCleanedPrompt = audit.cleanedPrompt;

    // 6. OPTIONAL SECOND VISUAL AUDITOR (Gemini) — Section 19-25
    const { auditor, providerName: audProvider } = getVisualAuditor(dirProvider);
    let auditorResult: AuditorResult | null = null;
    let auditorLatencyMs: number | undefined;

    const shouldInvokeAuditor = Boolean(
      auditor &&
      auditor.isConfigured() &&
      hasImages &&
      (reconciledPlan.taskType === 'IDENTITY_TRANSFER' ||
       reconciledPlan.taskType === 'REPLACE_OBJECT' ||
       reconciledPlan.taskType === 'CHANGE_ENVIRONMENT' ||
       (body.references && body.references.length >= 2))
    );

    if (shouldInvokeAuditor && auditor) {
      const audStart = Date.now();
      try {
        const directorRefs = mapReferencesToDirectorInput(body.references);
        auditorResult = await auditor.audit({
          taskType: reconciledPlan.taskType,
          userIdea: body.ideaDescription,
          videoTitle: body.videoTitle,
          references: directorRefs,
          scenePlan: reconciledPlan,
          proposedPrompt: finalCleanedPrompt
        });
        auditorLatencyMs = Date.now() - audStart;

        // Auditor cannot rewrite prompt, but checks leakage risks (Section 20, 23)
        if (auditorResult.referenceLeakageRisks && auditorResult.referenceLeakageRisks.length > 0) {
          for (const risk of auditorResult.referenceLeakageRisks) {
            const riskLower = risk.toLowerCase();
            if (riskLower.includes('bedroom') || riskLower.includes('room') || riskLower.includes('sofa') || riskLower.includes('desk lamp')) {
              // Ensure no domestic tokens leaked into the prompt
              finalCleanedPrompt = finalCleanedPrompt.replace(/(a\s+)?(domestic\s+)?(bedroom|living\s+room|sofa|work\s+desk|desk\s+lamp)/gi, 'neutral clean backdrop');
            }
          }
        }
      } catch (err) {
        console.warn('Second Visual Auditor non-fatal error:', err);
        auditorResult = null;
      }
    }

    // Combine any removed details or warnings
    const allPurged = [
      ...(audit.purged || []),
      ...(reconciledPlan.unsupportedDetailsRemoved || [])
    ];

    const responsePayload = {
      isLocal: directorResult === null,
      direction: builderResult.directionPt,
      finalPrompt: finalCleanedPrompt,
      approachTitle: builderResult.approachTitle,
      approachIndex: body.approachIndex || 0,
      typographyPlan: builderResult.typographyPlan,
      scenePlan: {
        ...reconciledPlan,
        unsupportedDetailsRemoved: allPurged
      },
      // Development debug data (Section 31)
      ...(process.env.NODE_ENV !== 'production'
        ? {
            debugInfo: {
              directorUsed: Boolean(directorResult),
              directorProvider: directorResult ? dirProvider : 'none',
              directorLatencyMs,
              directorConfidence: directorResult?.confidence,
              auditorUsed: Boolean(auditorResult),
              auditorProvider: auditorResult ? audProvider : 'none',
              auditorLatencyMs,
              taskType: reconciledPlan.taskType,
              targetImageId: reconciledPlan.targetImage?.id,
              identitySourceId: reconciledPlan.identitySource?.id,
              removedUnsupportedDetails: allPurged,
              totalTimeMs: Date.now() - startTime
            }
          }
        : {})
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error in /api/ai/simple-create:', error);
    // Ultimate deterministic safety net
    try {
      const localResult = generateSimpleThumbnail(await req.json());
      return NextResponse.json({
        ...localResult,
        isLocal: true
      });
    } catch {
      return NextResponse.json(
        { error: 'Falha ao processar solicitação de thumbnail.' },
        { status: 500 }
      );
    }
  }
}
