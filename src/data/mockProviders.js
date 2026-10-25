/**
 * Conteúdo local fictício para demonstrar busca, filtros e perfis.
 * Valores, regiões, apresentações e avaliações não representam pessoas ou ofertas reais.
 */
const mockProviders = [
  {
    id: 'ana-souza-eletrica',
    name: 'Ana Souza',
    specialty: 'Eletricista residencial',
    categories: ['eletrica', 'reparos'],
    summary: 'Instalações e pequenos reparos elétricos em residências.',
    bio: 'Atuação em pequenas intervenções elétricas residenciais, com foco em instalações e revisões do dia a dia.',
    neighborhoods: ['Água Verde', 'Batel', 'Centro'],
    services: [
      { name: 'Instalar luminárias', priceFrom: 95 },
      { name: 'Instalar chuveiro elétrico', priceFrom: 120 },
    ],
  },
  {
    id: 'bruno-martins-hidraulica',
    name: 'Bruno Martins',
    specialty: 'Hidráulica residencial',
    categories: ['hidraulica', 'reparos'],
    summary: 'Reparos hidráulicos e troca de metais para casa.',
    bio: 'Atuação em reparos hidráulicos, troca de metais e ajustes em instalações de cozinhas e banheiros.',
    neighborhoods: ['Centro', 'Rebouças', 'Juvevê'],
    services: [
      { name: 'Instalar chuveiro', priceFrom: 110 },
      { name: 'Reparo de torneira', priceFrom: 85 },
    ],
  },
  {
    id: 'camila-rocha-limpeza',
    name: 'Camila Rocha',
    specialty: 'Limpeza residencial',
    categories: ['limpeza'],
    summary: 'Limpeza de casas e apartamentos em diferentes formatos.',
    bio: 'Atuação em rotinas de limpeza residencial, com atenção a cozinhas, banheiros e espaços de uso diário.',
    neighborhoods: ['Batel', 'Bigorrilho', 'Água Verde'],
    services: [
      { name: 'Limpar casa', priceFrom: 160 },
      { name: 'Limpeza de apartamento', priceFrom: 130 },
    ],
  },
  {
    id: 'diego-ferreira-montagem',
    name: 'Diego Ferreira',
    specialty: 'Montagem de móveis',
    categories: ['montagem-moveis', 'reparos'],
    summary: 'Montagem e desmontagem de móveis para diferentes cômodos.',
    bio: 'Montagem e desmontagem de móveis residenciais, incluindo organização de peças após mudanças.',
    neighborhoods: ['Portão', 'Água Verde', 'Novo Mundo'],
    services: [
      { name: 'Montar móveis', priceFrom: 100 },
      { name: 'Desmontagem de móvel', priceFrom: 80 },
    ],
  },
  {
    id: 'elisa-moura-pintura',
    name: 'Elisa Moura',
    specialty: 'Pintura residencial',
    categories: ['pintura', 'reparos'],
    summary: 'Pintura de ambientes internos e pequenos retoques.',
    bio: 'Pintura de ambientes internos, retoques e renovação de superfícies residenciais.',
    neighborhoods: ['Cabral', 'Juvevê', 'Boa Vista'],
    services: [
      { name: 'Pintar um cômodo', priceFrom: 280 },
      { name: 'Retoque de parede', priceFrom: 120 },
    ],
  },
  {
    id: 'felipe-andrade-jardinagem',
    name: 'Felipe Andrade',
    specialty: 'Jardinagem',
    categories: ['jardinagem'],
    summary: 'Cuidados básicos com jardins, vasos e áreas verdes.',
    bio: 'Cuidados com jardins, vasos e áreas verdes, incluindo manutenção de canteiros e podas leves.',
    neighborhoods: ['Santa Felicidade', 'Bigorrilho', 'Mercês'],
    services: [
      { name: 'Manutenção de jardim', priceFrom: 140 },
      { name: 'Poda de plantas', priceFrom: 90 },
    ],
  },
  {
    id: 'gabriela-nunes-reparos',
    name: 'Gabriela Nunes',
    specialty: 'Reparos domésticos',
    categories: ['reparos', 'montagem-moveis'],
    summary: 'Pequenos consertos e ajustes no dia a dia da casa.',
    bio: 'Pequenos consertos e ajustes domésticos, com foco em tarefas de manutenção do dia a dia.',
    neighborhoods: ['Cristo Rei', 'Jardim Botânico', 'Centro'],
    services: [
      { name: 'Fixar prateleira', priceFrom: 75 },
      { name: 'Ajustes domésticos', priceFrom: 90 },
    ],
  },
  {
    id: 'heitor-prado-eletrica',
    name: 'Heitor Prado',
    specialty: 'Instalações elétricas',
    categories: ['eletrica'],
    summary: 'Instalações elétricas residenciais e revisão de pontos de luz.',
    bio: 'Atuação em instalações elétricas de pequeno porte, substituição de luminárias e revisão de tomadas.',
    neighborhoods: ['Batel', 'Bigorrilho', 'Mercês'],
    services: [
      { name: 'Instalação elétrica simples', priceFrom: 130 },
      { name: 'Trocar interruptor', priceFrom: 70 },
    ],
  },
  {
    id: 'isabela-lima-limpeza',
    name: 'Isabela Lima',
    specialty: 'Limpeza de apartamentos',
    categories: ['limpeza'],
    summary: 'Limpeza residencial com atenção a diferentes espaços da casa.',
    bio: 'Atuação em limpeza de ambientes residenciais, organização leve e cuidados com superfícies de uso frequente.',
    neighborhoods: ['Portão', 'Água Verde', 'Rebouças'],
    services: [
      { name: 'Limpeza de apartamento', priceFrom: 145 },
      { name: 'Limpar casa', priceFrom: 175 },
    ],
  },
  {
    id: 'joao-costa-montagem',
    name: 'João Costa',
    specialty: 'Montador de móveis',
    categories: ['montagem-moveis'],
    summary: 'Montagem de móveis e organização de peças após a mudança.',
    bio: 'Montagem de móveis residenciais e organização de peças para facilitar a instalação no ambiente.',
    neighborhoods: ['Centro', 'Hauer', 'Boqueirão'],
    services: [
      { name: 'Montar móveis', priceFrom: 105 },
      { name: 'Montagem de guarda-roupa', priceFrom: 190 },
    ],
  },
  {
    id: 'karina-alves-pintura',
    name: 'Karina Alves',
    specialty: 'Pintura de interiores',
    categories: ['pintura'],
    summary: 'Pintura interna e renovação de ambientes residenciais.',
    bio: 'Atuação em pintura interna, preparação de superfícies e retoques em ambientes residenciais.',
    neighborhoods: ['Água Verde', 'Portão', 'Batel'],
    services: [
      { name: 'Pintura de parede', priceFrom: 240 },
      { name: 'Retoque de pintura', priceFrom: 110 },
    ],
  },
  {
    id: 'lucas-teixeira-outros',
    name: 'Lucas Teixeira',
    specialty: 'Serviços domésticos diversos',
    categories: ['outros', 'reparos'],
    summary: 'Apoio em tarefas domésticas e pequenos serviços variados.',
    bio: 'Atuação em tarefas residenciais variadas, com escopo combinado conforme a necessidade do serviço.',
    neighborhoods: ['Boa Vista', 'Bacacheri', 'Cabral'],
    services: [
      { name: 'Pequenos ajustes em casa', priceFrom: 85 },
      { name: 'Instalar acessórios', priceFrom: 75 },
    ],
  },
]

export default mockProviders
