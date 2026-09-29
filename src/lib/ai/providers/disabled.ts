import {
  AIProvider,
  AIProviderStatus,
  SuggestedDirectionOutput,
  RefinePromptOutput
} from '../types';
import { ThumbnailAIAnalysis, ThumbnailAIComparison } from '@/types';

export class DisabledAIProvider implements AIProvider {
  readonly name = 'disabled';

  async getStatus(): Promise<AIProviderStatus> {
    return {
      configured: false,
      provider: 'Nenhum provedor configurado',
      model: 'none',
      supportsVision: false
    };
  }

  async analyzeThumbnail(): Promise<ThumbnailAIAnalysis> {
    throw new Error(
      'ANÁLISE POR IA NÃO CONFIGURADA: Defina a variável de ambiente OPENAI_API_KEY no arquivo .env.local para habilitar a visão multimodal. Todas as ferramentas locais e diagnósticos manuais continuam funcionando normalmente.'
    );
  }

  async compareThumbnails(): Promise<ThumbnailAIComparison> {
    throw new Error(
      'COMPARAÇÃO POR IA NÃO CONFIGURADA: Defina OPENAI_API_KEY no servidor para comparar thumbnails multimodais A/B.'
    );
  }

  async generateDirection(): Promise<SuggestedDirectionOutput> {
    throw new Error(
      'SUGESTÃO DE DIREÇÃO POR IA NÃO CONFIGURADA: Defina OPENAI_API_KEY no servidor para receber sugestões automáticas de direção.'
    );
  }

  async refinePrompt(): Promise<RefinePromptOutput> {
    throw new Error(
      'REFINO DE PROMPT POR IA NÃO CONFIGURADO: Defina OPENAI_API_KEY no servidor para refinar prompts com modelo de linguagem.'
    );
  }
}
