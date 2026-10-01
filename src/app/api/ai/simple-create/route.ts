import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { generateSimpleThumbnail, buildTypographyPlan, detectTechHardware } from '@/lib/simpleEngine/engine';
import { CreateThumbnailInput } from '@/types/simple';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body: CreateThumbnailInput = {
      ...rawBody,
      ideaDescription: rawBody.ideaDescription || rawBody.idea || '',
      videoTitle: rawBody.videoTitle || '',
      references: rawBody.references || []
    };
    const provider = getAIProvider();
    const status = await provider.getStatus();

    // If server AI is configured, enhance with LLM interpretation
    if (status.configured && provider.name === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';

        const systemPrompt = `You are a world-class visual director specializing in honest, authentic, high-impact YouTube thumbnails.
Your job is to convert a creator's plain conversational idea into a razor-sharp 5-point visual direction and an English image generation prompt.

CORE PRINCIPLES:
1. ENVIRONMENT AUTHORITY ORDER (CRITICAL):
   - 1st: Target image environment (in edits/identity transfer, preserve exactly unless explicitly asked to change)
   - 2nd: Explicit user description (if user explicitly writes a location like "no sofá", "na rua", "no estúdio")
   - 3rd: Scenario/environment reference (CENÁRIO references)
   - 4th: Environment strictly required by the concept
   - 5th: Otherwise: NO INVENTED ENVIRONMENT. Keep background minimal, neutral, abstract, cropped, contextual, or unspecified.
   Do NOT add bedrooms, living rooms, sofas, desks, windows, lamps, gaming rooms, streamer setups, or generic offices unless explicitly requested or supported by a reference.
   Do NOT turn "natural" into "domestic interior".
   Do NOT turn "realistic" into "room with window light".
   Do NOT turn "gaming" into "RGB gaming room".
   Do NOT turn "tech" into "desk setup".
2. TRANSLATE VAGUE ADJECTIVES: When user says "epic", "viral", or "high CTR", translate that into a larger primary subject, clear silhouette, and simplified background — NOT into neon, outer glow, or saturated clutter.
3. DEPTH OF FIELD IS CONTEXTUAL: Do NOT pick f/2.0 or shallow depth of field automatically. If a background environment was explicitly requested, preserve its readability; otherwise use natural falloff.
4. NATURAL SKIN, NO PORE OBSESSION: Enforce natural skin texture, authentic eye shape, bone structure, natural asymmetry, and true age. Avoid plastic waxy smoothing and artificial beauty filters. Do NOT obsess over hyper-detailed pores.
5. HARDWARE & HANDS: If holding a device/console/phone, enforce anatomically plausible hands, natural grip around the object, correct visible finger count according to pose and natural occlusion, no duplicated or fused fingers, no fingers intersecting the product, physically believable hand-to-object contact, and zero button or chassis fusion. Strict physical geometry.
6. NO UNMOTIVATED CLICHES: Zero unmotivated neon or glowing outlines. Zero generic shocked expression or open mouth screams. Zero random arrows, circles, floating particles, fire, or embers unless specifically requested.
7. TYPOGRAPHY: If text is provided, treat it as exact text (no translation, no extra words). Never invent fake gaming fonts. If generating without text or reserving space, reserve clean negative space for later typography.

Output strictly valid JSON with this exact schema:
{
  "direction": {
    "ideia": "Frase curta em português resumindo a premissa central",
    "foco": "O que domina a atenção e o que é secundário",
    "composicao": "Enquadramento, ângulo e separação visual",
    "expressao": "Emoção e expressão facial humana autêntica (sem caretas)",
    "visual": "Iluminação motivada, cores e texturas reais"
  },
  "finalPrompt": "English prompt for image generation with subject, lighting source, environment, textures and negative avoid tokens"
}
`;

        const userPrompt = `Video Title: ${body.videoTitle || 'Untitled'}
User Idea: ${body.ideaDescription || ''}
Thumbnail Text: ${body.thumbnailText || 'None'}
Text Treatment: ${body.textTreatment || 'AUTO'}
Reserved Space: ${body.reserveSpaceForText ? body.reservedSpacePosition : 'None'}
Specific Font: ${body.fontName || 'None'}
Approach Number: ${body.approachIndex || 0}
Target Model: ${body.targetModel || 'GERAL'}
References Count: ${(body.references || []).length}
Reference Roles: ${(body.references || []).map(r => `${r.name}: ${r.role}`).join(', ')}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          const isTech = detectTechHardware(`${body.videoTitle} ${body.ideaDescription}`);
          const typographyPlan = buildTypographyPlan(
            body.thumbnailText,
            isTech,
            body.fontName,
            body.reservedSpacePosition,
            body.stylePreset,
            body.textTreatment
          );
          return NextResponse.json({
            isLocal: false,
            direction: parsed.direction,
            finalPrompt: parsed.finalPrompt,
            approachTitle: body.approachIndex === 1 ? 'Foco no Objeto / Hardware' : body.approachIndex === 2 ? 'Tensão Documental' : 'Equilíbrio Narrativo',
            approachIndex: body.approachIndex || 0,
            typographyPlan
          });
        }
      } catch (err) {
        console.warn('AI call failed, falling back to local engine:', err);
      }
    }

    // Deterministic fallback via local engine
    const localResult = generateSimpleThumbnail(body);
    return NextResponse.json({
      ...localResult,
      isLocal: true
    });
  } catch (error) {
    console.error('Error in /api/ai/simple-create:', error);
    return NextResponse.json(
      { error: 'Falha ao processar solicitação de thumbnail.' },
      { status: 500 }
    );
  }
}
