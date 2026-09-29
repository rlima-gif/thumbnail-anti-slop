import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { GenerateDirectionInput } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<GenerateDirectionInput>;

    if (!body.videoTitle || typeof body.videoTitle !== 'string') {
      return NextResponse.json(
        { error: 'Título do vídeo obrigatório para sugerir direção visual.' },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          error:
            'SUGESTÃO POR IA NÃO CONFIGURADA: Defina a variável OPENAI_API_KEY no servidor (.env.local) para habilitar sugestões automatizadas de direção.',
          configured: false
        },
        { status: 503 }
      );
    }

    const direction = await provider.generateDirection({
      videoTitle: body.videoTitle,
      videoDescription: body.videoDescription,
      visualPromise: body.visualPromise,
      protagonist: body.protagonist,
      availableReferences: body.availableReferences
    });

    return NextResponse.json(direction);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao gerar sugestão de direção.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
