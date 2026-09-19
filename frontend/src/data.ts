export type Priority = 'baixa' | 'media' | 'alta' | 'urgente'
export type Category = 'hardware' | 'software' | 'rede' | 'acesso' | 'outro'
export type Status = 'novo' | 'em_atendimento' | 'resolvido' | 'fechado'
export type Team = 'Infraestrutura' | 'Suporte N1' | 'Suporte N2' | 'Segurança' | 'Redes'

export interface Message {
  id: string
  from: 'tecnico' | 'usuario'
  text: string
  time: string
}

export interface Rating {
  score: 1 | 2 | 3 | 4 | 5
  comment: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: Category
  priority: Priority
  status: Status
  team: Team
  assignee: string | null
  requester: string
  requesterId: string
  department: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  rating: Rating | null
  sla: string
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const STATUS_LABELS: Record<Status, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  hardware: 'Hardware',
  software: 'Software',
  rede: 'Rede',
  acesso: 'Acesso',
  outro: 'Outro',
}

export const mockTickets: Ticket[] = [
  {
    id: 'CHM-1042',
    title: 'Monitor não liga após troca de cabo',
    description: 'O monitor da estação de trabalho 14 parou de funcionar após trocarmos o cabo HDMI. Testamos outros cabos e o monitor não responde em nenhuma entrada.',
    category: 'hardware',
    priority: 'alta',
    status: 'em_atendimento',
    team: 'Suporte N1',
    assignee: 'Lucas Ferreira',
    requester: 'Ana Beatriz Costa',
    requesterId: 'seed-client-1',
    department: 'Contabilidade',
    createdAt: '2026-08-18T08:14:00',
    updatedAt: '2026-08-18T09:42:00',
    sla: '4h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'Oi, o monitor da minha mesa não liga de jeito nenhum. Já troquei o cabo mas nada.', time: '09:20' },
      { id: 'm2', from: 'tecnico', text: 'Olá Ana, vou até sua mesa em cerca de 30 minutos. Enquanto isso, pode verificar se o LED de energia do monitor pisca?', time: '09:42' },
    ],
    rating: null,
  },
  {
    id: 'CHM-1041',
    title: 'Excel fecha inesperadamente ao abrir planilha',
    description: 'O Microsoft Excel 365 fecha sozinho toda vez que tento abrir a planilha de controle financeiro Q3. Outros arquivos abrem normalmente.',
    category: 'software',
    priority: 'alta',
    status: 'em_atendimento',
    team: 'Suporte N2',
    assignee: 'Rodrigo Mendes',
    requester: 'Paulo Henrique Lima',
    requesterId: 'seed-client-1',
    department: 'Financeiro',
    createdAt: '2026-08-18T07:30:00',
    updatedAt: '2026-08-18T10:05:00',
    sla: '4h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'Meu Excel fica fechando sempre que abro o arquivo do financeiro.', time: '07:30' },
      { id: 'm2', from: 'tecnico', text: 'Paulo, consegui replicar o erro. Parece corrupção no arquivo. Enviei uma versão recuperada por e-mail — pode confirmar se os dados estão corretos?', time: '09:55' },
    ],
    rating: null,
  },
  {
    id: 'CHM-1040',
    title: 'VPN corporativa sem conexão — equipe remota',
    description: 'Toda a equipe de vendas externas está sem acesso à VPN desde as 06h. Impede acesso ao CRM e sistemas internos.',
    category: 'rede',
    priority: 'urgente',
    status: 'em_atendimento',
    team: 'Redes',
    assignee: 'Juliana Alves',
    requester: 'Marcos Vieira',
    requesterId: 'seed-client-1',
    department: 'Vendas',
    createdAt: '2026-08-18T06:10:00',
    updatedAt: '2026-08-18T06:35:00',
    sla: '1h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'URGENTE: ninguém da equipe externa consegue conectar na VPN. Cliente aguardando.', time: '06:10' },
      { id: 'm2', from: 'tecnico', text: 'Certo Marcos, estou verificando o servidor de VPN agora. Identificamos um problema de certificado. Estimativa de resolução: 45 min.', time: '06:35' },
    ],
    rating: null,
  },
  {
    id: 'CHM-1039',
    title: 'Solicitação de acesso ao sistema RH',
    description: 'Funcionário novo precisa de acesso ao sistema de RH e ponto eletrônico. Admissão foi em 15/08.',
    category: 'acesso',
    priority: 'media',
    status: 'novo',
    team: 'Suporte N1',
    assignee: null,
    requester: 'Camila Rocha',
    requesterId: 'seed-client-1',
    department: 'Recursos Humanos',
    createdAt: '2026-08-18T08:50:00',
    updatedAt: '2026-08-18T08:50:00',
    sla: '8h',
    messages: [],
    rating: null,
  },
  {
    id: 'CHM-1038',
    title: 'Impressora HP do RH imprimindo com listras',
    description: 'A impressora HP LaserJet do setor de RH está imprimindo todas as páginas com listras horizontais pretas. Já substituímos o cartucho.',
    category: 'hardware',
    priority: 'media',
    status: 'em_atendimento',
    team: 'Suporte N1',
    assignee: 'Tiago Santos',
    requester: 'Fernanda Oliveira',
    requesterId: 'seed-client-1',
    department: 'Recursos Humanos',
    createdAt: '2026-08-17T14:20:00',
    updatedAt: '2026-08-18T08:00:00',
    sla: '8h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'A impressora do RH está saindo com listras em tudo. Trocamos o cartucho e não resolveu.', time: '14:20' },
      { id: 'm2', from: 'tecnico', text: 'Fernanda, pode ser o drum (cilindro). Vou verificar amanhã cedo.', time: '14:50' },
    ],
    rating: null,
  },
  {
    id: 'CHM-1037',
    title: 'Notebook lento após atualização do Windows',
    description: 'Após a atualização automática do Windows 11 22H2 aplicada na noite de ontem, o notebook está com desempenho muito reduzido.',
    category: 'software',
    priority: 'baixa',
    status: 'resolvido',
    team: 'Suporte N1',
    assignee: 'Lucas Ferreira',
    requester: 'Bruno Carvalho',
    requesterId: 'seed-client-1',
    department: 'Marketing',
    createdAt: '2026-08-17T09:00:00',
    updatedAt: '2026-08-17T16:30:00',
    sla: '24h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'Meu notebook ficou muito lento depois da atualização do Windows.', time: '09:00' },
      { id: 'm2', from: 'tecnico', text: 'Bruno, vou acessar remotamente. Pode deixar o notebook ligado?', time: '10:15' },
      { id: 'm3', from: 'usuario', text: 'Sim, pode acessar!', time: '10:18' },
      { id: 'm4', from: 'tecnico', text: 'Problema resolvido. Era um driver gráfico incompatível. Já fiz o rollback e reinstalei a versão correta. Pode testar.', time: '11:40' },
      { id: 'm5', from: 'usuario', text: 'Perfeito, voltou ao normal! Obrigado!', time: '11:55' },
    ],
    rating: { score: 5, comment: 'Atendimento rápido e eficiente, resolveu tudo!' },
  },
  {
    id: 'CHM-1036',
    title: 'Teclado com teclas travando',
    description: 'Algumas teclas do teclado mecânico estão presas: a letra "E", "R" e barra de espaço.',
    category: 'hardware',
    priority: 'baixa',
    status: 'fechado',
    team: 'Suporte N1',
    assignee: 'Tiago Santos',
    requester: 'Daniela Figueiredo',
    requesterId: 'seed-client-1',
    department: 'Jurídico',
    createdAt: '2026-08-16T11:00:00',
    updatedAt: '2026-08-17T09:00:00',
    sla: '24h',
    messages: [
      { id: 'm1', from: 'usuario', text: 'Algumas teclas do meu teclado estão travadas.', time: '11:00' },
      { id: 'm2', from: 'tecnico', text: 'Daniela, troquei o teclado por um novo. O antigo será enviado para manutenção.', time: '15:30' },
    ],
    rating: { score: 4, comment: 'Resolvido rapidamente, mas demorou um pouco para ser atendido.' },
  },
  {
    id: 'CHM-1035',
    title: 'Sem acesso ao e-mail corporativo',
    description: 'Não consigo acessar meu e-mail pelo Outlook nem pela web. Conta parece bloqueada.',
    category: 'acesso',
    priority: 'alta',
    status: 'novo',
    team: 'Segurança',
    assignee: null,
    requester: 'Roberto Nascimento',
    requesterId: 'seed-client-1',
    department: 'Diretoria',
    createdAt: '2026-08-18T09:55:00',
    updatedAt: '2026-08-18T09:55:00',
    sla: '2h',
    messages: [],
    rating: null,
  },
]
