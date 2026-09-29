import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { CompareThumbnailsInput } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CompareThumbnailsInput>;

    if (!body.imageA || !body.imageB) {
      return NextResponse.json(
        { error: 'Duas imagens (Thumbnail A e Thumbnail B) são necessárias para a comparação A/B.' },
        { status: 400 }
      );
    }

    if (!body.videoTitle) {
      return NextResponse.json(
        { error: 'Título do vídeo obrigatório para contextualizar a comparação.' },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          error:
            'COMPARAÇÃO POR IA NÃO CONFIGURADA: Defina a variável de ambiente OPENAI_API_KEY no servidor (.env.local) para habilitar visão comparativa.',
          configured: false
        },
        { status: 503 }
      );
    }

    const comparison = await provider.compareThumbnails({
      imageA: body.imageA,
      imageB: body.imageB,
      videoTitle: body.videoTitle,
      videoDescription: body.videoDescription,
      visualPromise: body.visualPromise
    });

    return NextResponse.json(comparison);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao comparar thumbnails com IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
