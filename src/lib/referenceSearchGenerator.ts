export interface ReferenceSearchParam {
  niche: string;
  subject: string;
  thumbnailType: string;
  visualLanguage: string;
  atmosphere: string;
  protagonist: string;
}

export interface GeneratedSearchQuery {
  category: string;
  query: string;
  whySearchThis: string;
}

export function generateReferenceSearchQueries(params: ReferenceSearchParam): GeneratedSearchQuery[] {
  const clean = (val: string, fallback: string) => (val && val.trim().length > 0 ? val.trim() : fallback);

  const subject = clean(params.subject || params.protagonist, 'concept artifact');
  const niche = clean(params.niche, 'documentary feature');
  const atmosphere = clean(params.atmosphere, 'dramatic tension');
  const lang = clean(params.visualLanguage, 'cinematic editorial');

  return [
    {
      category: 'Editorial Photography (Revistas de Prestígio)',
      query: `editorial portrait photography ${subject} ${niche} ${atmosphere} Wired magazine style`,
      whySearchThis: 'Foge do ciclo vicioso de thumbnails do YouTube; traz enquadramentos conceituais e luz de alto padrão da mídia impressa.'
    },
    {
      category: 'Cinema & Still Frames (Cinematografia)',
      query: `cinematography still frame 35mm ${subject} ${lang} ${atmosphere} Roger Deakins lighting`,
      whySearchThis: 'Permite estudar separação figura/fundo, luz motivada e profundidade de campo óptica de diretores renomados.'
    },
    {
      category: 'Advertising Photography (Publicidade de Alto Nível)',
      query: `minimalist commercial product photography ${subject} tactile materials studio`,
      whySearchThis: 'Ensina como dar peso e dignidade a objetos e hardware sem precisar apelar para raios neon ou setas.'
    },
    {
      category: 'Poster Design & Key Art (Cartazes de Filmes)',
      query: `minimal movie poster design key art negative space visual metaphor`,
      whySearchThis: 'Mostra o poder do espaço negativo e como uma única ideia central sustenta toda a curiosidade.'
    },
    {
      category: 'Documentary Photography (Fotojornalismo Autêntico)',
      query: `candid photojournalism documentary style portrait natural expression 50mm`,
      whySearchThis: 'A melhor vacina contra a "careta genérica de choque": ensina expressões humanas contextuais genuínas.'
    },
    {
      category: 'Fine Art & Lighting Reference (Pintura Clássica e Luz)',
      query: `chiaroscuro lighting portrait Rembrandt single light source dark background`,
      whySearchThis: 'Domínio de luz e sombra: contraste pontual que atrai os olhos sem poluir a imagem.'
    }
  ];
}
