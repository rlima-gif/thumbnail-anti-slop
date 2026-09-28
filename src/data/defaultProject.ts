import { ProjectData } from '@/types';

export const DEFAULT_PROJECT: ProjectData = {
  id: 'proj-anti-slop-default',
  name: 'O Carro Secreto da Apple (Documentário)',
  videoTitle: 'Por que a Apple desistiu do projeto mais caro da sua história',
  videoDescription: 'Uma autópsia de 10 anos de desenvolvimento e 10 bilhões de dólares queimados no Projeto Titan.',
  niche: 'Tecnologia & Investigação Documental',
  audience: 'Profissionais de tecnologia, designers de produto e entusiastas de negócios que valorizam profundidade.',

  // 01 - Clique
  perceptionGoal: 'Um protótipo de veículo automotivo coberto sob uma lona escura em uma garagem fechada com o logo sutil.',
  protagonistType: 'Objeto',
  viewerQuestion: 'O que existia de verdade por baixo daquela lona?',
  titleExplains: 'O cancelamento e o custo astronômico do projeto.',

  // 03 - Direção
  visualPromise: 'A escala física do fracasso que o público nunca pôde ver.',
  protagonist: 'Silhueta angular de chassi conceitual coberto por tecido industrial fosco semi-translúcido.',
  protagonistPresence: 65,
  secondarySubject: 'Engenheiro de costas no canto oposto desligando o disjuntor da bancada.',
  storyMoment: 'O momento exato em que a ordem de encerramento chegou e o laboratório foi lacrado.',
  composition: 'Regra dos terços com horizonte rebaixado, chassi ocupando terço central-esquerdo e espaço negativo à direita.',
  camera: 'Hasselblad H6D, lente 80mm prime, no nível dos olhos a 1,20m do chão.',
  expression: 'Postura corporal de cansaço e resignação do engenheiro ao fundo (sem caretas).',
  lighting: 'Luz pontual suave motivada de uma única lâmpada fluorescente industrial pendente sobre a mesa.',
  palette: 'Cinza chumbo industrial, preto profundo (#0b0c0e) e um único reflexo metálico âmbar quente.',
  background: 'Paredes de concreto aparente com bancadas de osciloscópios vintage desativados.',
  depth: 'Plano médio nítido no vinco da lona; fundo caindo em desfoque óptico gradual f/2.8.',
  thumbnailText: '10 BILHÕES',
  channelIdentity: 'Direção cinematográfica documental e sóbria; sem stickers nem setas vermelhas.',
  visualStyle: 'Fotografia documental investigativa de alta fidelidade analógica.',

  activeModes: ['TECH'],

  references: [
    {
      id: 'ref-1',
      name: 'David Fincher — Mindhunter / The Social Network',
      category: 'Luz',
      purpose: 'Controle de penumbra e tons dessaturados',
      extractedDecision: 'Manter áreas de sombra ricas e profundas, permitindo que apenas os contornos do chassi recebam reflexo suave.'
    },
    {
      id: 'ref-2',
      name: 'Wired Magazine — Capa Editorial Industrial',
      category: 'Composição',
      purpose: 'Respeito ao hardware e aos materiais reais',
      extractedDecision: 'Não inventar painéis de luz neon; usar alumínio usinado real e poeira ambiente autêntica.'
    }
  ],

  avoidList: [
    'EXPRESSÃO DE CHOQUE GENÉRICA',
    'CONTORNO BRANCO AUTOMÁTICO',
    'RIM LIGHT IMPOSSÍVEL',
    'NEON ROXO + AZUL AUTOMÁTICO',
    'SETA VERMELHA SEM FUNÇÃO',
    'PARTÍCULAS GRATUITAS',
    'PELE PLÁSTICA'
  ],

  uploadedImageUri: null,
  diagnosticState: {
    manyFocalPoints: false,
    excessiveText: false,
    duplicatedTitle: false,
    artificialGlow: false,
    excessiveSaturation: false,
    weakSeparation: false,
    genericReaction: false,
    backgroundTooDetailed: false,
    noSilentQuestion: false,
    disconnectedElements: false,
    unmotivatedLight: false,
    floatingLogos: false
  },
  oneSecondPerceptionNote: 'Percebi imediatamente a lona sobre o carro e a palavra 10 BILHÕES.',

  checklistState: {
    'chk-1': true,
    'chk-2': true,
    'chk-3': true,
    'chk-4': true,
    'chk-5': true,
    'chk-6': true,
    'chk-7': true,
    'chk-8': true,
    'chk-9': true,
    'chk-10': true,
    'chk-11': true,
    'chk-12': true,
    'chk-13': true,
    'chk-14': true,
    'chk-15': true,
    'chk-16': true,
    'chk-17': true,
    'chk-18': true,
    'chk-19': true,
    'chk-20': true,
    'chk-21': true
  },

  createdAt: '2026-09-28T12:00:00.000Z',
  updatedAt: '2026-09-28T12:00:00.000Z'
};
