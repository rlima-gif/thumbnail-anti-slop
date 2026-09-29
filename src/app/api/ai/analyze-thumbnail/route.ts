import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { AnalyzeThumbnailInput } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AnalyzeThumbnailInput>;

    if (!body.imageBase64OrUrl || typeof body.imageBase64OrUrl !== 'string') {
      return NextResponse.json(
        { error: 'Imagem da thumbnail obrigatória para análise visual multimodal.' },
        { status: 400 }
      );
    }

    if (!body.videoTitle || typeof body.videoTitle !== 'string') {
      return NextResponse.json(
        { error: 'Título do vídeo obrigatório para avaliar relação de complementaridade.' },
        { status: 400 }
      );
    }

    const provider = getAIProvider();
    const status = await provider.getStatus();

    if (!status.configured) {
      return NextResponse.json(
        {
          error:
            'ANÁLISE POR IA NÃO CONFIGURADA: Defina a variável de ambiente OPENAI_API_KEY no servidor (.env.local). Todas as ferramentas locais e testes de estresse continuam disponíveis sem custo.',
          configured: false
        },
        { status: 503 }
      );
    }

    const analysis = await provider.analyzeThumbnail({
      imageBase64OrUrl: body.imageBase64OrUrl,
      videoTitle: body.videoTitle,
      videoDescription: body.videoDescription,
      visualPromise: body.visualPromise,
      viewerQuestion: body.viewerQuestion,
      thumbnailText: body.thumbnailText,
      activeModes: body.activeModes,
      avoidList: body.avoidList,
      channelIdentity: body.channelIdentity
    });

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha interna ao analisar thumbnail com IA.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
