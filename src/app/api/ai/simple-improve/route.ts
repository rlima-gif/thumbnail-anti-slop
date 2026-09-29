import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { improvePrompt } from '@/lib/simpleEngine/engine';
import { ImprovePromptInput } from '@/types/simple';

export async function POST(req: NextRequest) {
  try {
    const body: ImprovePromptInput = await req.json();
    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (status.configured && provider.name === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const model = process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini';

        const systemPrompt = `You are an elite photographic prompt doctor and anti-slop purifier for image models (Midjourney, FLUX, DALL-E).
Your job is to take an AI slop prompt loaded with cliches (e.g. purple-blue neon, shocked scream face, glow on everything, particles, fire, random red arrows) and rewrite it into a masterclass of visual direction.
Rules:
1. Preserve the user's authentic subject and core story.
2. Remove unmotivated neon, floating particles, screaming expressions, fake bokeh, plastic skin.
3. Replace with motivated physical light (lamps, window bounce), natural expressions (curiosity, focused smirk, calm intensity), real textures and 35mm optical depth of field.
4. Output strictly JSON with:
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
