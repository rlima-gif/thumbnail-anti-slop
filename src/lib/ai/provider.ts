import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { DisabledAIProvider } from './providers/disabled';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const providerType = process.env.AI_PROVIDER?.trim().toLowerCase() || 'openai';

  if (!apiKey || apiKey.length < 10) {
    cachedProvider = new DisabledAIProvider();
    return cachedProvider;
  }

  if (providerType === 'openai') {
    cachedProvider = new OpenAIProvider(apiKey);
    return cachedProvider;
  }

  // Fallback to disabled if unknown provider specified
  cachedProvider = new DisabledAIProvider();
  return cachedProvider;
}
