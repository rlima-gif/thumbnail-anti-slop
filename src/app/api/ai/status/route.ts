import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';

export async function GET() {
  try {
    const provider = getAIProvider();
    const status = await provider.getStatus();
    return NextResponse.json(status);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido ao verificar status de IA.';
    return NextResponse.json(
      {
        configured: false,
        provider: 'error',
        model: 'none',
        supportsVision: false,
        error: msg
      },
      { status: 200 }
    );
  }
}
