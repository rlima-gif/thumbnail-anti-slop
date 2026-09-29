import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { generateSimpleThumbnail } from '@/lib/simpleEngine/engine';
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
1. RESPECT THE USER'S IDEA: Do NOT turn every scene into a generic fantasy or glowing advertising ad. If the user mentions a couch, a normal room, or a desk, preserve that authentic domestic context. Normal/ordinary realism is often best.
2. TRANSLATE VAGUE ADJECTIVES: When user says "epic", "viral", or "high CTR", translate that into a larger primary subject, clear silhouette, and simplified background — NOT into neon, outer glow, or saturated clutter.
3. DEPTH OF FIELD IS CONTEXTUAL: Do NOT pick f/2.0 or shallow depth of field automatically. If the room/environment matters, preserve background readability.
4. NATURAL SKIN, NO PORE OBSESSION: Enforce natural skin texture, authentic eye shape, bone structure, natural asymmetry, and true age. Avoid plastic waxy smoothing and artificial beauty filters. Do NOT obsess over hyper-detailed pores.
5. HARDWARE & HANDS: If holding a device/console/phone, enforce natural grip with five distinct fingers and zero button or chassis fusion. Strict physical geometry.
6. NO UNMOTIVATED CLICHES: Zero unmotivated neon or glowing outlines. Zero generic shocked expression or open mouth screams. Zero random arrows, circles, floating particles, fire, or embers unless specifically requested.
7. TYPOGRAPHY: If user did NOT provide text, do NOT add overlay text.

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
}`;

        const userPrompt = `Video Title: ${body.videoTitle || 'Untitled'}
User Idea: ${body.ideaDescription || ''}
Thumbnail Text: ${body.thumbnailText || 'None (Do not add text)'}
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
          return NextResponse.json({
            isLocal: false,
            direction: parsed.direction,
            finalPrompt: parsed.finalPrompt,
            approachTitle: body.approachIndex === 1 ? 'Foco no Objeto / Hardware' : body.approachIndex === 2 ? 'Tensão Documental' : 'Equilíbrio Narrativo',
            approachIndex: body.approachIndex || 0
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
