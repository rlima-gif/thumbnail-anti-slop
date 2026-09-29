import { YouTubeProvider, YouTubeProviderStatus } from './types';
import { ChannelProfile, ChannelVideo, PerformanceSnapshot } from '@/types';

export class DisconnectedYouTubeProvider implements YouTubeProvider {
  async getStatus(): Promise<YouTubeProviderStatus> {
    return {
      connected: false,
      hasAnalyticsPermission: false,
      hasWritePermission: false,
      error: 'Nenhuma conta do YouTube vinculada. Conexão via OAuth disponível para comparar thumbnails com métricas reais de canal.'
    };
  }

  getAuthUrl(options: { requestAnalytics?: boolean; requestThumbnailWrite?: boolean }): string {
    const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];
    if (options.requestAnalytics) {
      scopes.push('https://www.googleapis.com/auth/yt-analytics.readonly');
    }
    if (options.requestThumbnailWrite) {
      scopes.push('https://www.googleapis.com/auth/youtube.force-ssl');
    }
    const params = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID || 'PENDING_CLIENT_ID',
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback',
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getChannelProfile(): Promise<ChannelProfile | null> {
    return null;
  }

  async getRecentVideos(): Promise<ChannelVideo[]> {
    return [];
  }

  async getVideoPerformance(): Promise<PerformanceSnapshot | null> {
    return null;
  }

  async associateVideoWithProject(): Promise<boolean> {
    return true;
  }
}

export function getYouTubeProvider(): YouTubeProvider {
  return new DisconnectedYouTubeProvider();
}
