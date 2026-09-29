import { NextResponse } from 'next/server';
import { getYouTubeProvider } from '@/lib/youtube/provider';

export async function GET() {
  try {
    const yt = getYouTubeProvider();
    const status = await yt.getStatus();
    const authUrl = yt.getAuthUrl({ requestAnalytics: true });
    return NextResponse.json({ ...status, authUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao verificar status do YouTube.';
    return NextResponse.json({ connected: false, error: msg }, { status: 200 });
  }
}
