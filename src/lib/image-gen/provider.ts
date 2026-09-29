import { ImageGenProvider, ImageGenStatus, GeneratedImageOutput } from './types';

export class DisabledImageGenProvider implements ImageGenProvider {
  readonly name = 'disabled';

  async getStatus(): Promise<ImageGenStatus> {
    return {
      configured: false,
      provider: 'Nenhum provedor de imagem configurado',
      model: 'none'
    };
  }

  async generateThumbnail(): Promise<GeneratedImageOutput> {
    throw new Error(
      'GERAÇÃO DE IMAGEM NÃO CONFIGURADA: Conecte uma chave de geração (ex: FLUX, Midjourney API ou Imagen) para renderizar imagens diretamente. Copie o prompt estruturado gerado e cole no seu gerador favorito.'
    );
  }

  async editThumbnail(): Promise<GeneratedImageOutput> {
    throw new Error(
      'EDIÇÃO DE IMAGEM NÃO CONFIGURADA: Nenhuma API de inpainting/patch conectada.'
    );
  }

  async generateVariant(): Promise<GeneratedImageOutput> {
    throw new Error(
      'VARIANTE NÃO CONFIGURADA: Nenhuma API de geração conectada.'
    );
  }
}

export function getImageGenProvider(): ImageGenProvider {
  return new DisabledImageGenProvider();
}
