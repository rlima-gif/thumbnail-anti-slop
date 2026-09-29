import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { generateSimpleThumbnail } from '@/lib/simpleEngine/engine';
import { CreateThumbnailInput } from '@/types/simple';

export async function POST(req: NextRequest) {
  try {
    const body: CreateThumbnailInput = await req.json();
    const provider = getAIProvider();
    const status = await provider.getStatus();

    // If server AI is configured, enhance with LLM interpretation
    if (status.configured && provider.name === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';

        const systemPrompt = `You are a world-class art director and cinematographer specializing in authentic, high-impact YouTube thumbnails.
Your job is to convert a creator's plain conversational idea into a razor-sharp 5-point visual direction and an English image generation prompt.
STRICT ANTI-SLOP RULES:
- Zero unmotivated neon or glowing outlines.
- Zero generic shocked expression, open mouth screams, or cartoonish reaction faces.
- Zero random arrows, circles, particles, embers, floating emojis or icons.
- If tech/hardware is mentioned, enforce strict physical chassis geometry, accurate controls and matte materials.
- If person is mentioned, enforce real skin pores, authentic eye shape, bone structure, and facial asymmetry.

Output strictly valid JSON with this exact schema:
{
  "direction": {
    "ideia": "Frase curta em português resumindo a premissa central",
    "foco": "O que domina a atenção e o que é secundário",
    "composicao": "Enquadramento, ângulo de câmera e profundidade de campo",
    "expressao": "Emoção e expressão facial humana autêntica (sem caretas)",
    "visual": "Iluminação motivada, cores e texturas reais"
  },
  "finalPrompt": "English prompt for image generation with subject, lighting, lens, textures and negative avoid tokens"
}`;

        const userPrompt = `Video Title: ${body.videoTitle || 'Untitled'}
User Idea: ${body.ideaDescription || ''}
Thumbnail Text: ${body.thumbnailText || 'None'}
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
