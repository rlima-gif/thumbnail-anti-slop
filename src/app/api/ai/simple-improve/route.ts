import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { improvePrompt } from '@/lib/simpleEngine/engine';
import { ImprovePromptInput } from '@/types/simple';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body: ImprovePromptInput = {
      ...rawBody,
      rawPrompt: rawBody.rawPrompt || rawBody.prompt || ''
    };
    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (status.configured && provider.name === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';

        const systemPrompt = `You are an elite photographic prompt doctor and anti-slop purifier for image models (Midjourney, FLUX, DALL-E).
Your job is to take an AI slop prompt loaded with cliches and rewrite it into a masterclass of visual direction.

RULES:
1. UNDERSTAND INTENT FIRST: Preserve the user's authentic subject and core story. Do NOT replace the user's idea with a standard formula.
2. SUBTRACT SLOP: Remove unmotivated purple-blue gaming neon, floating particles, screaming expressions, fake bokeh, plastic skin, and random arrows/circles.
3. PHYSICAL LIGHTING: Replace fake glow with motivated physical light (lamps, window bounce, practical light).
4. HUMAN EXPRESSION: Replace shocked screaming face with authentic human focus, calm curiosity, or subtle satisfaction.
5. NO FORCED APERTURE: Do NOT automatically inject f/2.0 or extreme bokeh. Keep background readable if environmental context matters.
6. NO PORE OBSESSION: Use "natural skin texture" and "natural facial asymmetry", avoid "visible skin pores" or hyper-detailed pores.
7. HARDWARE FIDELITY: Enforce authentic chassis geometry and natural hand grip when holding devices.

Output strictly JSON with:
{
  "changes": ["List of 3 to 5 short bullet points in Portuguese explaining what was removed and why"],
  "improvedPrompt": "The refined English photographic prompt"
}`;

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
              { role: 'user', content: `Original Prompt:\n${body.rawPrompt}` }
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
            changes: parsed.changes || [],
            improvedPrompt: parsed.improvedPrompt || body.rawPrompt
          });
        }
      } catch (err) {
        console.warn('AI improve call failed, using local engine:', err);
      }
    }

    // Local engine fallback
    const localResult = improvePrompt(body);
    return NextResponse.json({
      ...localResult,
      isLocal: true
    });
  } catch (error) {
    console.error('Error in /api/ai/simple-improve:', error);
    return NextResponse.json(
      { error: 'Falha ao processar melhoria de prompt.' },
      { status: 500 }
    );
  }
}
