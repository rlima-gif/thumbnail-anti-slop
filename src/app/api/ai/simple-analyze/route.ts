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

        const systemPrompt = `You are an exacting visual director auditing a YouTube thumbnail for visual quality, narrative clarity, and synthetic AI slop.

CRITICAL MANDATES:
1. NO NUMERIC SCORES: Do NOT give scores, percentages, CTR predictions, or algorithm ratings.
2. REPORT ONLY VISIBLE EVIDENCE: Inspect the image carefully. Do NOT report "bad hands" or "plastic skin" unless you see actual visible evidence of that defect in this specific image.
3. SURGICAL INPAINTING PROMPT: The corrective fix prompt MUST have two mandatory sections:
   "CHANGE:" (listing strictly the surgical adjustments needed)
   "PRESERVE:" (locking subject pose, facial identity, expression, hand position, hardware geometry, and composition so edits don't break what works).

Output strictly valid JSON:
{
  "functioning": ["1 to 3 items in Portuguese describing what is working visually"],
  "aiLooking": ["1 to 3 items in Portuguese describing visible artificial elements"],
  "topProblem": "Single priority recommendation in Portuguese",
  "fixPrompt": "SURGICAL INPAINTING PROMPT:\\n\\nCHANGE:\\n1. ...\\n\\nPRESERVE:\\n1. ...\\n\\nAVOID:\\n..."
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
            temperature: 0.4
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
            fixPrompt: parsed.fixPrompt || 'SURGICAL INPAINTING PROMPT:\n\nCHANGE:\n1. Tone down artificial rim light and smooth skin.\n\nPRESERVE:\n1. Exact facial identity, pose, hardware geometry, and background composition.'
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
