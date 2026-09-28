import { AnatomyConcept } from '@/types';

export const READING_ORDER = [
  {
    step: '1. ASSUNTO',
    role: 'O Protagonista Imediato',
    timing: '0 — 250ms',
    description: 'Quem ou o que comanda a cena. O cérebro precisa registrar o formato do protagonista antes de qualquer outra análise.',
    rule: 'Se o espectador precisar de 1 segundo para entender o que é o sujeito, a taxa de clique cai mais de 40%.'
  },
  {
    step: '2. CONFLITO / CURIOSIDADE',
    role: 'A Anomalia ou Pergunta',
    timing: '250ms — 600ms',
    description: 'O que há de errado, extraordinário, inacabado ou misterioso. É o motivo pelo qual o vídeo existe.',
    rule: 'A anomalia deve estar em contato visual ou espacial direto com o protagonista.'
  },
  {
    step: '3. CONTEXTO',
    role: 'O Ambiente Subordinado',
    timing: '600ms — 1000ms',
    description: 'Onde e quando a situação acontece. Dá escala e credibilidade, mas nunca pode roubar o protagonismo.',
    rule: 'Subordine o contexto com profundidade de campo, menos saturação ou iluminação mais suave.'
  }
];

export const ANATOMY_CONCEPTS: AnatomyConcept[] = [
  {
    id: 'ponto-focal-primario',
    title: 'Ponto Focal Primário',
    summary: 'A âncora principal de retenção ocular.',
    description: 'O elemento com maior contraste de valor, nitidez máxima e geralmente onde os olhos do espectador pousam primeiro. Deve ocupar o terço de ouro ou a posição de comando.',
    thumbnailImpact: 'Elimina a dúvida inicial do espectador no feed veloz.',
    commonError: 'Dois protagonistas brigando pelo mesmo contraste de luminosidade no mesmo nível.',
    layerKey: 'focalPrimary'
  },
  {
    id: 'ponto-focal-secundario',
    title: 'Ponto Focal Secundário',
    summary: 'O elemento de resposta ou consequência.',
    description: 'O objeto narrativo, a reação de um coadjuvante, a tela de resultado ou o detalhe que completa a pergunta visual do protagonista.',
    thumbnailImpact: 'Cria o circuito fechado de curiosidade que converte o olhar em clique.',
    commonError: 'Três ou mais focos secundários espalhados nos 4 cantos da miniatura.',
    layerKey: 'focalSecondary'
  },
  {
    id: 'espaco-negativo',
    title: 'Espaço Negativo Intencional',
    summary: 'O ar que permite ao protagonista respirar e ter peso.',
    description: 'Área com textura uniforme, escuridão controlada ou gradiente sutil. Proporciona descanso visual e amplifica a força do sujeito.',
    thumbnailImpact: 'Faz a thumbnail parecer um pôster de cinema sofisticado em vez de panfleto promocional.',
    commonError: 'Preencher cada centímetro com setas, stickers, textos e explosões por medo de parecer vazio.',
    layerKey: 'negativeSpace'
  },
  {
    id: 'direcao-olhar',
    title: 'Vetor / Direção do Olhar',
    summary: 'Para onde os olhos do protagonista apontam.',
    description: 'Humanos seguem instintivamente o olhar de outros humanos. Se o protagonista olha para a direita, o espectador olhará imediatamente para a direita.',
    thumbnailImpact: 'Conduz o fluxo visual direto para o objeto narrativo ou para o título do vídeo.',
    commonError: 'Protagonista olhando para fora da thumbnail, jogando a atenção do espectador para o vídeo vizinho do concorrente.',
    layerKey: 'eyeVector'
  },
  {
    id: 'contraste-valores',
    title: 'Mapa de Contraste de Valores',
    summary: 'Luzes concentradas no que importa, sombras no resto.',
    description: 'Diferenciação clara entre zonas claras e escuras. O cérebro decodifica luminosidade antes das cores cromáticas.',
    thumbnailImpact: 'Garante que a imagem seja decodificada instantaneamente mesmo em modo escuro ou tela com brilho baixo.',
    commonError: 'Imagem lavada ou HDR excessivo onde tudo tem 50% de cinza médio.',
    layerKey: 'contrast'
  },
  {
    id: 'silhueta-legibilidade',
    title: 'Silhueta e Reconhecimento',
    summary: 'O contorno que resiste à miniaturização.',
    description: 'A forma externa recortada contra o fundo. Uma boa silhueta possui membros descolados do tronco e objetos identificáveis pelo formato.',
    thumbnailImpact: 'Funciona em telas de qualquer tamanho sem perder a identidade.',
    commonError: 'Pose compacta onde braços e objetos se fundem num bloco amorfo.',
    layerKey: 'silhouette'
  },
  {
    id: 'linhas-de-forca',
    title: 'Linhas de Força & Perspectiva',
    summary: 'Guias geométricas invisíveis da cena.',
    description: 'Bordas de arquitetura, braços estendidos, ângulo da câmera e iluminação que convergem em direção ao evento dramático.',
    thumbnailImpact: 'Acelera a velocidade de leitura para menos de 0,5 segundo.',
    commonError: 'Linhas que cruzam a imagem aleatoriamente sem convergir para o centro de interesse.',
    layerKey: 'leadingLines'
  }
];
