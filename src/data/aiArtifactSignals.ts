import { AiArtifactSignal } from '@/types';

export const AI_ARTIFACT_SIGNALS: AiArtifactSignal[] = [
  {
    id: 'simetria-excessiva',
    title: 'Simetria Excessiva & Rigidez',
    signal: 'Rostos e poses com alinhamento milimétrico perfeito, sem a assimetria natural de humanos reais e objetos físicos.',
    whyItHappens: 'Modelos de difusão tendem a convergir para médias matemáticas centralizadas quando o prompt não exige postura natural.',
    howToDirectAgainst: 'Especifique "natural slight head tilt", "candid off-axis angle", "asymmetric organic posture" e "3/4 view".'
  },
  {
    id: 'pele-plastica-cera',
    title: 'Pele Plástica / Efeito Cera',
    signal: 'Ausência total de textura natural de pele, marcas de expressão e assimetria orgânica, conferindo textura de manequim lubrificado.',
    whyItHappens: 'Processos de upscaling agressivo e denoise sem retenção de textura natural.',
    howToDirectAgainst: 'Exija "natural skin texture", "preserve natural facial texture", "natural facial asymmetry" e proíba "plastic smoothing, waxy skin, airbrushed".'
  },
  {
    id: 'microdetalhe-aleatorio',
    title: 'Microdetalhe Aleatório Sem Sentido',
    signal: 'Roupas com dobras que viram costuras inexplicáveis, botões sem orifícios e pequenos ornamentos sem propósito funcional.',
    whyItHappens: 'A IA confunde "complexidade visual" com "alta qualidade", alucinando detalhes desnecessários.',
    howToDirectAgainst: 'Direcione: "clean functional garments", "simple solid fabrics", "subtractive minimalist details".'
  },
  {
    id: 'textura-inconsistente',
    title: 'Textura Inconsistente no Mesmo Objeto',
    signal: 'Uma jaqueta que começa como couro na gola, mas transiciona para borracha na manga sem costura divisória.',
    whyItHappens: 'Atenção atencional limitada nos blocos de ruído durante as etapas intermediárias de geração.',
    howToDirectAgainst: 'Especifique materiais concretos: "matte heavy cotton canvas jacket", "consistent tactile materials throughout".'
  },
  {
    id: 'reflexos-impossiveis',
    title: 'Reflexos e Olhos Espelhados Impossíveis',
    signal: 'Óculos ou olhos refletindo janelas de um quarto enquanto a pessoa está claramente sob o sol num deserto.',
    whyItHappens: 'Falta de raytracing físico e mapa de ambiente global unificado nos modelos de difusão 2D.',
    howToDirectAgainst: 'Declare a fonte de luz: "motivated single key light from camera-left", "physically coherent reflections".'
  },
  {
    id: 'maos-malformadas',
    title: 'Mãos e Dedos Deformados',
    signal: 'Seis dedos, nós articulados duplicados, polegares em lados opostos ou dedos que se fundem em um bloco.',
    whyItHappens: 'Variabilidade geométrica extrema das mãos humanas nos datasets de treinamento de imagens 2D.',
    howToDirectAgainst: 'Defina pose concreta: "hands gripping camera body firmly", "hands outside frame" ou "clearly separated relaxed fingers".'
  },
  {
    id: 'objetos-fundidos',
    title: 'Objetos Fundidos e Mutantes',
    signal: 'Uma caneca que vira parte da mesa, um headset cujas hastes entram para dentro do crânio da pessoa.',
    whyItHappens: 'Incompreensão de fronteiras físicas e colisão volumétrica entre objetos em planos contíguos.',
    howToDirectAgainst: 'Defina separação espacial: "distinct physical separation between subject and held object".'
  },
  {
    id: 'bordas-derretidas',
    title: 'Bordas Derretidas ou Esfumadas',
    signal: 'Fronteiras entre tecidos e pele com transições moles, parecendo pintura a óleo inacabada.',
    whyItHappens: 'Baixo contraste local ou interpolação de resoluções diferentes no modelo gerador.',
    howToDirectAgainst: 'Especifique "crisp optical edges", "defined tactile silhouette", "shot on prime lens".'
  },
  {
    id: 'fundo-semanticamente-incoerente',
    title: 'Fundo Semanticamente Incoerente',
    signal: 'Um escritório onde as portas não levam a lugar nenhum, estantes com livros que derretem e janelas impossíveis.',
    whyItHappens: 'A IA preenche o fundo gerando formas vagas que lembram cenários sem entender a arquitetura do espaço.',
    howToDirectAgainst: 'Defina um ambiente específico e subordinado: "neutral muted studio wall", "balanced optical perspective with clean background separation".'
  },
  {
    id: 'profundidade-campo-excessiva',
    title: 'Profundidade de Campo Simulada Excessiva',
    signal: 'Borrão de fundo que corta o contorno das orelhas da pessoa enquanto a ponta do nariz e o cabelo estão nítidos.',
    whyItHappens: 'Efeito "portrait mode" de software simulado em vez de física óptica de lente real.',
    howToDirectAgainst: 'Descreva a ótica de lente real: "shot on 85mm portrait lens with gradual natural optical falloff".'
  },
  {
    id: 'microdetalhe-uniformemente-nitido',
    title: 'Microdetalhe Uniformemente Nítido (Hipernitidez)',
    signal: 'Cada detalhe de pele, cada folha da árvore ao fundo e cada fibra da camisa possuem exatamente a mesma acuidade visual.',
    whyItHappens: 'Prompts viciados com "8k, masterpiece, hyperdetailed, octane render" forçando o gerador ao limite de contraste.',
    howToDirectAgainst: 'Priorize hierarquia: "hierarchical focus on subject eyes, subtle background attenuation, natural lens softness".'
  },
  {
    id: 'luz-dramatica-sem-fonte',
    title: 'Luz Dramática Sem Fonte (Luz Mágica)',
    signal: 'Highlights intensos iluminando o queixo de baixo para cima sem nenhum refletor ou fonte emissiva na cena.',
    whyItHappens: 'Treinamento sobreposto de ilustrações dramáticas e concept art de fantasia.',
    howToDirectAgainst: 'Exija luz motivada: "motivated directional lighting from softbox camera-right, no ambient magical light".'
  },
  {
    id: 'tudo-parece-plastico',
    title: 'Tudo com Aparência de Plástico / Resina',
    signal: 'Metal parece plástico brilhante, madeira parece vinil polido, roupa parece borracha sintética.',
    whyItHappens: 'Especularidade genérica aplicada homogeneamente pelo renderizador latente.',
    howToDirectAgainst: 'Descreva propriedades físicas: "matte brushed aluminium with micro-scratches", "raw woven linen", "organic matte textures".'
  },
  {
    id: 'expressoes-congeladas',
    title: 'Expressões Faciais Congeladas e Desalmadas',
    signal: 'Sorriso com dentes perfeitos demais mas olhos completamente mortos, sem contração do músculo orbicular (Duchenne).',
    whyItHappens: 'Imitação superficial de bancos de imagens comerciais e posters de publicidade barata.',
    howToDirectAgainst: 'Especifique emoção sutil: "subtle contemplative furrowed brow", "genuine intrigue", "calm confident smirk".'
  },
  {
    id: 'perspectiva-inconsistente',
    title: 'Perspectiva Inconsistente',
    signal: 'Mesa vista de cima (plongée) enquanto o monitor sobre ela é visto de frente (nível dos olhos).',
    whyItHappens: 'Composição de camadas latentes com pontos de fuga divergentes.',
    howToDirectAgainst: 'Fixe a câmera: "consistent eye-level perspective, single vanishing point, 50mm normal field of view".'
  },
  {
    id: 'texto-errado-logos-deformadas',
    title: 'Texto Ilegível e Logos Mutantes',
    signal: 'Grafias com runas alienígenas no lugar de palavras e logos de marcas famosas distorcidas com pedaços faltando.',
    whyItHappens: 'Incapacidade intrínseca de redes neurais 2D de sintetizar grafemas tipográficos precisos sem camadas vetoriais.',
    howToDirectAgainst: 'Remova texto da geração de IA: "no text in the image, clean negative space reserved for typography overlay in post-production".'
  }
];
