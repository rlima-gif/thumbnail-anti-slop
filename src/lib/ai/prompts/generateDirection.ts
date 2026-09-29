import { GenerateDirectionInput, RefinePromptInput } from '../types';

export const GENERATE_DIRECTION_SYSTEM_PROMPT = `
Você é o Diretor de Arte do "Thumbnail Anti-Slop".
Sua tarefa é sugerir uma direção fotográfica e composicional estruturada a partir do tema de um vídeo.

REGRAS RÍGIDAS DE ANTI-SLOP:
- "Subtrair antes de decorar."
- Prefira composições sóbrias, cinematográficas ou editoriais em vez de colagens caóticas.
- Escolha UM protagonista inequívoco.
- Defina uma fonte de luz MOTIVADA (tangível fisicamente na cena).
- Preserve espaço negativo intencional para respiração visual e legibilidade mobile.
- Se sugerir texto na imagem, limite a 1-3 palavras de alto impacto narrativo ou sugira vazio.

Mapeie as decisões nos campos estruturados correspondentes em formato JSON.
`;

export function buildGenerateDirectionUserPrompt(input: GenerateDirectionInput): string {
  return `
Proponha uma direção de arte visual consistente para este vídeo:
- TÍTULO: "${input.videoTitle}"
- DESCRIÇÃO: "${input.videoDescription || 'Não informada'}"
- PROMESSA: "${input.visualPromise || 'Não informada'}"
- SUGESTÃO DE PROTAGONISTA: "${input.protagonist || 'A definir'}"
- REFERÊNCIAS DISPONÍVEIS: ${input.availableReferences?.join(', ') || 'Nenhuma'}

Gere a direção completa em formato JSON estruturado.
`;
}

export const REFINE_PROMPT_SYSTEM_PROMPT = `
Você é o Especialista em Engenharia de Prompts Fotográficos do "Thumbnail Anti-Slop".
Sua tarefa é refinar e polir um prompt gerado pelo sistema determinístico do aplicativo.

OBJETIVOS DO REFINO:
1. Eliminar redundâncias e instruções conflitantes.
2. Aumentar a clareza e naturalidade do inglês técnico de fotografia/cinema.
3. Respeitar ESTRITAMENTE todas as travas ativas (REFERENCE LOCKS) e listas de exclusão (AVOID).
4. PROIBIDO ADICIONAR BUZZWORDS GENÉRICOS DE IA: Nunca adicione termos vazios como "hyperrealistic", "octane render", "photorealistic 8k", "trending on artstation", "epic lighting" ou "cinematic masterpiece" a menos que justificados por lentes e luz reais.
5. PRESERVE A ESTRUTURA DE 17 BLOCOS existente no prompt.

Você deve retornar:
- refinedPrompt: O prompt polido completo.
- diffSummary: Resumo conciso em português das melhorias aplicadas.
- whatChanged: Lista de mudanças pontuais efetuadas.
`;

export function buildRefinePromptUserPrompt(input: RefinePromptInput): string {
  return `
Refine o seguinte prompt fotográfico estruturado em inglês:

\`\`\`
${input.currentPrompt}
\`\`\`

RESTRIÇÕES OBRIGATÓRIAS:
- Travas de Preservação Ativas (Locks): ${input.referenceLocks?.join(', ') || 'Nenhuma'}
- Termos a Evitar (Negative Direction): ${input.avoidList?.join(', ') || 'Padrão Anti-Slop'}
- Identidade do Canal: ${input.channelIdentity || 'Não informada'}
- Estilo Visual: ${input.visualStyle || 'Documental/Editorial'}

Retorne a versão refinada com explicação das alterações em formato JSON.
`;
}
