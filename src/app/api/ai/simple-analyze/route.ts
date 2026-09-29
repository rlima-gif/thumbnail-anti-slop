import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { analyzeThumbnailLocally } from '@/lib/simpleEngine/engine';

export async function POST(req: NextRequest) {
  try {
    const { image, videoTitle } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem da thumbnail é obrigatória.' },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (status.configured && provider.name === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const visionModel = process.env.OPENAI_VISION_MODEL || 'gpt-4o';

        const systemPrompt = `You are an exacting art director auditing a YouTube thumbnail for visual quality, narrative clarity, and synthetic AI slop.
CRITICAL MANDATE:
- Do NOT give numeric scores, percentages, CTR predictions, or algorithm ratings.
- Identify strictly:
  1. What is actually working (max 3 items in Portuguese).
  2. What makes it look like generic/cheap AI slop (max 3 items in Portuguese: e.g. plastic skin, unmotivated rim light, fake glowing outlines, crowded focal points).
  3. The single most impactful problem to fix (1 sentence recommendation in Portuguese).
  4. A corrective inpainting/patch prompt in English that preserves what works but fixes the artificial artifacts.

Output strictly valid JSON:
{
  "functioning": ["item 1", "item 2", "item 3"],
  "aiLooking": ["item 1", "item 2", "item 3"],
  "topProblem": "Single prioritized recommendation in Portuguese",
  "fixPrompt": "English corrective prompt"
}`;

        const messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Audit this YouTube thumbnail.${videoTitle ? ` Video Title: "${videoTitle}".` : ''}`
              },
              {
                type: 'image_url',
                image_url: { url: image, detail: 'high' }
              }
            ]
          }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: visionModel,
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.5
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          return NextResponse.json({
            isLocal: false,
            functioning: parsed.functioning || [],
            aiLooking: parsed.aiLooking || [],
            topProblem: parsed.topProblem || 'Simplificar o contraste e remover iluminação artificial.',
            fixPrompt: parsed.fixPrompt || 'Preserve composition, replace plastic smoothing with real skin texture and motivated lighting.'
          });
        }
      } catch (err) {
        console.warn('Multimodal vision call failed, using local audit:', err);
      }
    }

    // Local heuristic fallback
    const localResult = analyzeThumbnailLocally(videoTitle);
    return NextResponse.json({
      ...localResult,
      isLocal: true
    });
  } catch (error) {
    console.error('Error in /api/ai/simple-analyze:', error);
    return NextResponse.json(
      { error: 'Falha ao analisar a thumbnail.' },
      { status: 500 }
    );
  }
}
