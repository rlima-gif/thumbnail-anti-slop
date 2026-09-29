import { AntiSlopItem } from '@/types';

export const ANTI_SLOP_CATALOG: AntiSlopItem[] = [
  {
    id: 'expressao-choque-generica',
    name: 'EXPRESSÃO DE CHOQUE GENÉRICA',
    category: 'Expressão & Rosto',
    explanation: 'Boca excessivamente aberta em "O", olhos arregalados sem foco e mãos na cabeça sem conexão emocional com a situação real do vídeo.',
    whyItHappens: 'Tentativa preguiçosa de copiar thumbnails de entretenimento infantil ou de 2018 para forçar urgência artificial.',
    whyItHarms: 'Passa sensação imediata de conteúdo descartável e desonesto. O público maduro desenvolveu cegueira e aversão a essa pose.',
    whenItMayBeIntentional: 'Vídeos de humor satírico onde o exagero é explicitamente a piada ou em conteúdo 100% infantil.',
    promptAvoidKeywords: ['generic shock expression', 'open mouth scream', 'exaggerated wide eyes', 'fake YouTuber reaction pose', 'unmotivated hysterical grimace']
  },
  {
    id: 'contorno-branco-automatico',
    name: 'CONTORNO BRANCO AUTOMÁTICO',
    category: 'Efeitos & Iluminação',
    explanation: 'Traço espesso branco ou neon colado rigidamente ao redor do recorte da pessoa, ignorando luz ambiental e profundidade.',
    whyItHappens: 'Falta de contraste e separação natural entre sujeito e fundo na foto original.',
    whyItHarms: 'Destrói a imersão visual, faz o criador parecer um adesivo barato colado em cima de um papel de parede.',
    whenItMayBeIntentional: 'Estilo colagem editorial/zine ou canal de tutoriais de design que explora estética adesivo/papel.',
    promptAvoidKeywords: ['white stroke sticker outline', 'hard white cutout border', 'vector sticker silhouette line', 'pasted sticker effect']
  },
  {
    id: 'rim-light-impossivel',
    name: 'RIM LIGHT IMPOSSÍVEL',
    category: 'Efeitos & Iluminação',
    explanation: 'Luz de recorte ultra brilhante e afiada nas bordas do sujeito sem nenhuma fonte luminosa equivalente no cenário.',
    whyItHappens: 'Fórmulas prontas de Photoshop/Canva e geradores de IA que usam "dramatic lighting" como atalho de render.',
    whyItHarms: 'Desconecta o sujeito do ambiente físico. A mente do espectador detecta a falsidade em menos de 100ms.',
    whenItMayBeIntentional: 'Key art promocional estilizada de e-sports de alta fantasia com iluminação puramente conceitual.',
    promptAvoidKeywords: ['unmotivated extreme rim light', 'impossible edge glow', 'laser-sharp silhouette backlight without light source', 'harsh fake halo']
  },
  {
    id: 'glow-em-todo-objeto',
    name: 'GLOW EM TODO OBJETO',
    category: 'Efeitos & Iluminação',
    explanation: 'Brilho difuso exagerado (outer glow) em torno de letras, produtos, rostos e ícones simultaneamente.',
    whyItHappens: 'Crença ingênua de que se algo está brilhando, chamará mais atenção.',
    whyItHarms: 'Se tudo brilha, nada brilha. Causa poluição visual, lava o contraste natural e parece trabalho amador dos anos 2000.',
    whenItMayBeIntentional: 'Cenas noturnas com neblina real ou objetos emissivos reais (sabres de luz, tochas, telas no escuro).',
    promptAvoidKeywords: ['excessive outer glow', 'diffuse blur glow on every object', 'radioactive edge bloom', 'glowing borders']
  },
  {
    id: 'seta-vermelha-sem-funcao',
    name: 'SETA VERMELHA SEM FUNÇÃO',
    category: 'Composição & Elementos',
    explanation: 'Seta curva ou reta apontando para algo óbvio que o espectador já olharia de qualquer forma.',
    whyItHappens: 'Insegurança de que o enquadramento e a composição não conseguem guiar o olhar organicamente.',
    whyItHarms: 'Polui a composição, insulta a inteligência do espectador e confere ar de clickbait desesperado.',
    whenItMayBeIntentional: 'Quando aponta para um detalhe microscópico genuíno de investigação técnica que não seria visível sem destaque.',
    promptAvoidKeywords: ['red arrow pointing to subject', 'floating clickbait arrows', 'graphic directional arrows']
  },
  {
    id: 'circulo-vermelho-sem-funcao',
    name: 'CÍRCULO VERMELHO SEM FUNÇÃO',
    category: 'Composição & Elementos',
    explanation: 'Círculo vermelho desenhado ao redor de um elemento central para simular "segredo" ou "detalhe chocante".',
    whyItHappens: 'Clichê herdado de vídeos sensacionalistas de mistério e pegadinhas.',
    whyItHarms: 'Quebra a autenticidade fotográfica ou editorial do canal e comunica baixo valor de produção.',
    whenItMayBeIntentional: 'Documentários investigativos de segurança ou análise tática de quadros esportivos.',
    promptAvoidKeywords: ['red circle overlay', 'hand-drawn red highlight circle', 'clickbait marker rings']
  },
  {
    id: 'particulas-gratuitas',
    name: 'PARTÍCULAS GRATUITAS',
    category: 'Efeitos & Iluminação',
    explanation: 'Poeira dourada, fagulhas flutuantes, faíscas e partículas espalhadas sem relação com a cena.',
    whyItHappens: 'Medo do espaço negativo (horror vacui). Achar que áreas limpas são "vazias demais".',
    whyItHarms: 'Cria ruído na escala pequena do celular. No feed mobile, partículas viram borrões e artefatos de compressão.',
    whenItMayBeIntentional: 'Cenas reais em forjaria, tempestade de neve, explosão justificada ou magia diegética.',
    promptAvoidKeywords: ['floating dust motes', 'gratuitous magic sparks', 'random fire particles', 'sparkle overlays', 'floating embers']
  },
  {
    id: 'explosao-sem-motivacao',
    name: 'EXPLOSÃO SEM MOTIVAÇÃO',
    category: 'Efeitos & Iluminação',
    explanation: 'Bolas de fogo e estilhaços ao fundo de um vídeo de finanças, tecnologia ou gameplay casual.',
    whyItHappens: 'Tentativa desesperada de injetar "ação" em um assunto calmo ou reflexivo.',
    whyItHarms: 'Quebra a promessa temática do vídeo. Atrai cliques sem retenção e causa frustração.',
    whenItMayBeIntentional: 'Vídeos sobre testes balísticos, desastres reais narrados ou demolições.',
    promptAvoidKeywords: ['unmotivated background explosion', 'random fireball blast', 'dramatic action movie blast']
  },
  {
    id: 'fundo-cidade-generica',
    name: 'FUNDO DE CIDADE GENÉRICA',
    category: 'Composição & Elementos',
    explanation: 'Foto aérea genérica com blur de Manhattan, skyline com arranha-céus desfocados em tons de azul escuro.',
    whyItHappens: 'Falta de cenografia própria ou preguiça de criar um cenário que contextualize a história.',
    whyItHarms: 'Torna o canal indistinguível de outros 100.000 canais corporativos sem personalidade.',
    whenItMayBeIntentional: 'Vídeos específicos sobre urbanismo, economia imobiliária ou história de Nova York.',
    promptAvoidKeywords: ['generic corporate city skyline background', 'stock blur skyscrapers', 'anonymous stock photography backdrop']
  },
  {
    id: 'neon-roxo-azul-automatico',
    name: 'NEON ROXO + AZUL AUTOMÁTICO',
    category: 'Efeitos & Iluminação',
    explanation: 'Gradiente ou iluminação dividida em ciano e magenta/roxo espalhada em todo o quadro sem motivo.',
    whyItHappens: 'Estereótipo de "estética gamer / cyberpunk / synthwave" adotado indiscriminadamente.',
    whyItHarms: 'Aparência datada e genérica. Dificulta leitura de tons de pele naturais e padroniza o visual.',
    whenItMayBeIntentional: 'Conteúdo temático do gênero retrowave ou cobertura de jogo sci-fi específico.',
    promptAvoidKeywords: ['cliche purple and teal neon lighting', 'generic synthwave bi-color lighting', 'cyberpunk RGB split', 'purple cyan wash']
  },
  {
    id: 'pele-plastica',
    name: 'PELE PLÁSTICA',
    category: 'Render & IA',
    explanation: 'Pele plástica sem textura natural, sem linhas de expressão, com textura de silicone ou cera polida de gerador de IA.',
    whyItHappens: 'Modelos de imagem com denoise agressivo ou filtros de suavização excessivos no Photoshop.',
    whyItHarms: 'Gatilho de "Uncanny Valley". O espectador rejeita a imagem por perceber que não é um ser humano real.',
    whenItMayBeIntentional: 'Arte conceitual de robôs, androides ou manequins.',
    promptAvoidKeywords: ['plastic smooth skin', 'airbrushed wax face', 'poreless synthetic skin', 'doll skin', 'beauty filter smoothing']
  },
  {
    id: 'barba-pintada',
    name: 'BARBA PINTADA',
    category: 'Render & IA',
    explanation: 'Barba com textura de pincelada sólida, sem fios individuais e com transição borrada na bochecha.',
    whyItHappens: 'Problema comum de interpolação e upscale de IA em modelos generalistas.',
    whyItHarms: 'Dá aspecto falso e artificial ao rosto do criador.',
    whenItMayBeIntentional: 'Ilustração estilizada 2D assumida.',
    promptAvoidKeywords: ['painted beard texture', 'blocky painted facial hair', 'fake digital beard']
  },
  {
    id: 'cabelo-pintado',
    name: 'CABELO PINTADO',
    category: 'Render & IA',
    explanation: 'Cabelo que parece uma massa sólida de argila com mechas desenhadas por computação gráfica antiga.',
    whyItHappens: 'Compressão geométrica em renders 3D rápidos ou falta de controle de fios no prompt.',
    whyItHarms: 'Elimina o senso de realidade fotográfica do retrato.',
    whenItMayBeIntentional: 'Estilo anime ou render Pixar assumido.',
    promptAvoidKeywords: ['solid hair mesh', 'plastic wig texture', 'painted hair strands', 'clay hair']
  },
  {
    id: 'olhos-hiperdefinidos',
    name: 'OLHOS HIPERDEFINIDOS',
    category: 'Render & IA',
    explanation: 'Íris com reflexos impossíveis, cristalinas demais, com contraste surreal que parecem olhos de vidro.',
    whyItHappens: 'IA tentando "enfatizar o olhar" adicionando reflexos e anéis hipernítidos.',
    whyItHarms: 'Olhar maníaco ou assustador que desconecta a empatia humana.',
    whenItMayBeIntentional: 'Criação de criaturas mágicas ou lentes de contato cosméticas em review.',
    promptAvoidKeywords: ['hyper-detailed glassy eyes', 'doll eyes', 'unnatural glowing pupils', 'oversharpened irises']
  },
  {
    id: 'hdr-excessivo',
    name: 'HDR EXCESSIVO',
    category: 'Efeitos & Iluminação',
    explanation: 'Sombras totalmente abertas e realces reprimidos, criando uma imagem cinzenta, enlameada e hipercontrastada.',
    whyItHappens: 'Filtros "clarity" ou "shadow boost" levados a 100% no Lightroom.',
    whyItHarms: 'Elimina a atmosfera e o mistério da cena. Falta preto real e falta branco real.',
    whenItMayBeIntentional: 'Quase nunca — é um erro técnico de gradação.',
    promptAvoidKeywords: ['harsh HDR halo', 'crunchy shadows boost', 'hyper-processed clarity slider', 'muddy flat tone mapping']
  },
  {
    id: 'sharpening-excessivo',
    name: 'SHARPENING EXCESSIVO',
    category: 'Render & IA',
    explanation: 'Bordas serrilhadas, ruído branco em volta de contrastes finos e halos ao redor de contornos.',
    whyItHappens: 'Tentativa desesperada de fazer a imagem parecer "nítida no celular".',
    whyItHarms: 'Gera dor visual e desconforto ao olhar. O feed comprime e cria artefatos horríveis.',
    whenItMayBeIntentional: 'Nenhum contexto profissional sério.',
    promptAvoidKeywords: ['oversharpened crunchy edges', 'harsh edge haloing', 'pixelated edge noise']
  },
  {
    id: 'saturacao-global',
    name: 'SATURAÇÃO GLOBAL',
    category: 'Efeitos & Iluminação',
    explanation: 'Todas as cores no talo (vermelho puro, verde puro, azul puro) brigando por atenção.',
    whyItHappens: 'Achar que "cores vivas" é sinônimo de saturação máxima em 100%.',
    whyItHarms: 'Causa cansaço visual imediato e destrói harmonia tonal.',
    whenItMayBeIntentional: 'Canais de brinquedos para bebês de 1 a 3 anos.',
    promptAvoidKeywords: ['garish oversaturation', 'clown colors', 'blown out color channels', 'radioactive rainbow']
  },
  {
    id: 'bokeh-artificial',
    name: 'BOKEH ARTIFICIAL',
    category: 'Render & IA',
    explanation: 'Círculos de luz desfocados gigantes colocados na frente do assunto sem física óptica.',
    whyItHappens: 'Packs de texturas "lens flare / bokeh overlay" aplicados em modo Screen.',
    whyItHarms: 'Sensação de amadorismo e falta de profundidade real.',
    whenItMayBeIntentional: 'Fotografia noturna urbana autêntica onde a lente gerou as aberrações naturalmente.',
    promptAvoidKeywords: ['fake circular bokeh overlay', 'pasted camera lens blur stickers']
  },
  {
    id: 'cinematic-sem-decisoes',
    name: '"CINEMATIC" SEM DECISÕES CINEMATOGRÁFICAS',
    category: 'Render & IA',
    explanation: 'Usar palavras-chave como "cinematic lighting" sem especificar fonte de luz, câmera, lente ou enquadramento.',
    whyItHappens: 'Falta de vocabulário de direção de arte ao dialogar com a ferramenta.',
    whyItHarms: 'Delega a composição para o gosto mediano da IA, gerando o visual mais genérico possível.',
    whenItMayBeIntentional: 'Nenhum — deve ser substituído por decisões reais de luz e lente.',
    promptAvoidKeywords: ['vague cinematic buzzwords', 'stock movie look', 'unspecified cinematic grading']
  },
  {
    id: 'objetos-flutuando',
    name: 'OBJETOS FLUTUANDO',
    category: 'Composição & Elementos',
    explanation: 'Moedas, dinheiro, ícones, caixas de perguntas e setas levitando ao redor do apresentador sem gravidade.',
    whyItHappens: 'Tentativa de ilustrar cada frase dita no vídeo com um pequeno desenho flutuante.',
    whyItHarms: 'Fragmenta o olhar do espectador. O cérebro não sabe para onde olhar em 0,5 segundo.',
    whenItMayBeIntentional: 'Tema de magia, telecinese ou jogos de gravidade zero.',
    promptAvoidKeywords: ['floating random items', 'levitating icons', 'scattered floating emojis', 'zero gravity clutter']
  },
  {
    id: 'icones-aleatorios',
    name: 'ÍCONES ALEATÓRIOS',
    category: 'Composição & Elementos',
    explanation: 'Emojis 3D com cara de surpresa, cifrão, sino de inscrição e fogo colados nos cantos.',
    whyItHappens: 'Cópia de templates fáceis de Canva para "preencher espaço".',
    whyItHarms: 'Comunica conteúdo infantil ou de baixa autoridade intelectual.',
    whenItMayBeIntentional: 'Canais que cobrem cultura pop de memes rápidos de TikTok.',
    promptAvoidKeywords: ['random 3D emojis', 'stock notification bell', 'gratuitous social icons']
  },
  {
    id: 'logos-flutuantes',
    name: 'LOGOS FLUTUANTES',
    category: 'Composição & Elementos',
    explanation: 'Logotipo de marcas famosas colados em 3D brilhante sem estarem em um produto físico.',
    whyItHappens: 'Uso de marcas para atrair busca sem integrá-las à narrativa.',
    whyItHarms: 'Visual poluído e pouco sofisticado.',
    whenItMayBeIntentional: 'Quando o vídeo é um review do produto real que estampa a logo na carcaça.',
    promptAvoidKeywords: ['floating branded corporate logos', 'stick-on 3D software logos']
  },
  {
    id: 'ui-falsa',
    name: 'UI FALSA',
    category: 'Composição & Elementos',
    explanation: 'Gráficos falsos de bolsa subindo, barras de progresso 99%, notificações de iPhone gigantes.',
    whyItHappens: 'Tentativa barata de comunicar urgência ou resultado financeiro.',
    whyItHarms: 'Cria desconfiança no público qualificado e atrai rejeição de comunidade.',
    whenItMayBeIntentional: 'Tutoriais de design de interface ou reviews de sistemas operacionais reais.',
    promptAvoidKeywords: ['fake UI elements', 'simulated fake iPhone alert modal', 'fake stock market green line']
  },
  {
    id: 'texto-3d-metalico-generico',
    name: 'TEXTO 3D METÁLICO GENÉRICO',
    category: 'Tipografia',
    explanation: 'Tipografia com bisel, extrusão 3D, gradiente metálico dourado ou cromado e sombra dura.',
    whyItHappens: 'Estética de plugins dos anos 90 reaproveitada por geradores de texto online.',
    whyItHarms: 'Dificulta a leitura rápida em telas pequenas e parece amador.',
    whenItMayBeIntentional: 'Review de filmes de ação vintage dos anos 80.',
    promptAvoidKeywords: ['generic 3D extruded metal text', 'bevel embossed gold letters', 'cheap chrome typography']
  },
  {
    id: 'fonte-gamer-generica',
    name: 'FONTE GAMER GENÉRICA',
    category: 'Tipografia',
    explanation: 'Fontes angulares, cortadas, com cantos de 45 graus e visual de ficção científica genérica.',
    whyItHappens: 'Associação rasa de jogos eletrônicos com fontes angulares.',
    whyItHarms: 'Baixa legibilidade em celulares e falta de personalidade autêntica.',
    whenItMayBeIntentional: 'Torneios de arena com identidade própria estabelecida.',
    promptAvoidKeywords: ['cliche gamer font', 'slanted angular sci-fi lettering', 'stencil esports font']
  },
  {
    id: 'fogo-raio-neon-particulas',
    name: 'FOGO + RAIO + NEON + PARTÍCULAS',
    category: 'Efeitos & Iluminação',
    explanation: 'O "combo da morte": empilhamento de quatro efeitos de energia no mesmo quadro.',
    whyItHappens: 'Incapacidade do criador de escolher uma ideia visual primária.',
    whyItHarms: 'Ruído absoluto. Não há hierarquia; o espectador desvia os olhos em direção a algo mais legível.',
    whenItMayBeIntentional: 'Nunca. Sempre subtraia três deles.',
    promptAvoidKeywords: ['stacked chaos effects', 'fire lightning neon and particles together', 'visual noise explosion']
  },
  {
    id: 'fontes-demais',
    name: 'FONTES DEMAIS',
    category: 'Tipografia',
    explanation: 'Três ou mais famílias tipográficas diferentes com cores e pesos distintos na mesma miniatura.',
    whyItHappens: 'Tentar dar ênfase a cada palavra com um estilo tipográfico diferente.',
    whyItHarms: 'Transforma uma frase simples em um quebra-cabeça visual ilegível.',
    whenItMayBeIntentional: 'Pôster tipográfico experimental explícito.',
    promptAvoidKeywords: ['incoherent multi-font typography', 'competing typefaces', 'clashing font styles']
  },
  {
    id: 'fundo-detalhado-demais',
    name: 'FUNDO TÃO DETALHADO QUANTO O PROTAGONISTA',
    category: 'Composição & Elementos',
    explanation: 'O fundo tem a mesma nitidez, contraste, saturação e complexidade que o sujeito principal.',
    whyItHappens: 'Falta de controle de profundidade de campo, desfoque focal ou iluminação seletiva.',
    whyItHarms: 'Camuflagem visual: o protagonista se perde na bagunça do cenário.',
    whenItMayBeIntentional: 'Ilustrações estilo "Onde está Wally?" onde procurar é a intenção explícita.',
    promptAvoidKeywords: ['background competing with protagonist', 'uniformly sharp deep focus clutter', 'noisy detailed backdrop']
  },
  {
    id: 'face-swap-iluminacao-errada',
    name: 'FACE SWAP COM ILUMINAÇÃO ERRADA',
    category: 'Render & IA',
    explanation: 'Rosto do criador recortado de uma foto com luz suave de estúdio e colado num corpo com sol poente duro.',
    whyItHappens: 'Montagem rápida sem recolorização de tons e sem cálculo de direção da luz.',
    whyItHarms: 'Gera repulsa imediata por parecer uma aberração gráfica mal colada.',
    whenItMayBeIntentional: 'Memes intencionalmente toscos em canais de react.',
    promptAvoidKeywords: ['mismatched face swap lighting', 'disconnected head on body', 'inconsistent shadow direction on face']
  }
];
