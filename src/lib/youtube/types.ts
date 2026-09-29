import { ChannelProfile, ChannelVideo, PerformanceSnapshot } from '@/types';

export type YouTubeOAuthScope =
  | 'https://www.googleapis.com/auth/youtube.readonly'
  | 'https://www.googleapis.com/auth/yt-analytics.readonly'
  | 'https://www.googleapis.com/auth/youtube.force-ssl';

export interface YouTubeProviderStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string;
  hasAnalyticsPermission: boolean;
  hasWritePermission: boolean;
  error?: string;
}

export interface YouTubeProvider {
  getStatus(): Promise<YouTubeProviderStatus>;
  getAuthUrl(options: { requestAnalytics?: boolean; requestThumbnailWrite?: boolean }): string;
  getChannelProfile(): Promise<ChannelProfile | null>;
  getRecentVideos(maxResults?: number): Promise<ChannelVideo[]>;
  getVideoPerformance(videoId: string): Promise<PerformanceSnapshot | null>;
  associateVideoWithProject(projectId: string, videoId: string): Promise<boolean>;
}
