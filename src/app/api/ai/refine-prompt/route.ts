import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { RefinePromptInput } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<RefinePromptInput>;

    if (!body.currentPrompt || typeof body.currentPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt atual obrigatório para refino com IA.' },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          error:
            'REFINO POR IA NÃO CONFIGURADO: Defina a variável OPENAI_API_KEY no servidor (.env.local) para polir prompts com IA. O prompt determinístico de 17 blocos continua disponível para cópia imediata.',
          configured: false
        },
        { status: 503 }
      );
    }

    const refined = await provider.refinePrompt({
      currentPrompt: body.currentPrompt,
      avoidList: body.avoidList,
      referenceLocks: body.referenceLocks,
      channelIdentity: body.channelIdentity,
      visualStyle: body.visualStyle
    });

    return NextResponse.json(refined);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao refinar prompt.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
