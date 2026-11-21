const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

// Roda com: npm run seed
// Popula o banco com usuários, chamados, mensagens e avaliações de exemplo,
// pra não depender de cadastrar nada na hora da apresentação.
//
// Pode ser executado várias vezes: tudo usa IDs/e-mails fixos + upsert, e
// registros que já existem não são alterados (update: {}).

const DEMO_PASSWORD = "123456";

const USERS = [
  { key: "maria", name: "Maria Cliente", email: "cliente@demo.com", role: "client", department: "Financeiro" },
  { key: "joao", name: "João Cliente", email: "joao.cliente@demo.com", role: "client", department: "Recursos Humanos" },
  { key: "carlos", name: "Carlos Atendente", email: "atendente@demo.com", role: "agent" },
  { key: "ana", name: "Ana Atendente", email: "ana.atendente@demo.com", role: "agent", department: "Redes" },
];

// Datas relativas ao momento do seed, para a lista parecer recente.
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

// Prioridade, equipe e SLA seguem a mesma regra por categoria usada na
// criação de chamados (ticket.service.js), exceto os 2 chamados originais.
const TICKETS = [
  {
    id: "seed-ticket-1",
    title: "Impressora não conecta à rede",
    description: "A impressora do setor financeiro não é reconhecida na rede Wi-Fi.",
    category: "hardware", priority: "alta", team: "Suporte_N1", sla: "4h",
    status: "novo", client: "maria",
  },
  {
    id: "seed-ticket-2",
    title: "Erro ao abrir sistema financeiro",
    description: "Sistema trava ao gerar relatório mensal.",
    category: "software", priority: "urgente", team: "Suporte_N2", sla: "1h",
    status: "em_atendimento", client: "maria", agent: "carlos",
  },
  {
    id: "seed-ticket-3",
    title: "Sem internet no 2º andar",
    description: "Desde a manhã nenhum computador do 2º andar acessa a internet. A rede interna funciona.",
    category: "rede", priority: "urgente", team: "Redes", sla: "1h",
    status: "em_atendimento", client: "joao", agent: "ana", createdAt: hoursAgo(3),
  },
  {
    id: "seed-ticket-4",
    title: "Redefinir senha do e-mail corporativo",
    description: "Minha senha expirou durante as férias e não consigo entrar no e-mail.",
    category: "acesso", priority: "media", team: "Seguranca", sla: "8h",
    status: "resolvido", client: "maria", agent: "carlos", createdAt: hoursAgo(26),
  },
  {
    id: "seed-ticket-5",
    title: "Monitor piscando",
    description: "O monitor da estação 14 pisca a cada poucos segundos e às vezes apaga.",
    category: "hardware", priority: "alta", team: "Suporte_N1", sla: "4h",
    status: "fechado", client: "joao", agent: "carlos", createdAt: hoursAgo(72), closedAt: hoursAgo(66),
  },
  {
    id: "seed-ticket-6",
    title: "Instalar pacote Office no notebook novo",
    description: "Recebi um notebook novo e preciso do Word e do Excel instalados.",
    category: "software", priority: "baixa", team: "Suporte_N2", sla: "24h",
    status: "fechado", client: "maria", agent: "ana", createdAt: hoursAgo(120), closedAt: hoursAgo(98),
  },
  {
    id: "seed-ticket-7",
    title: "Dúvida sobre backup de arquivos",
    description: "Gostaria de saber se os arquivos da área de trabalho entram no backup automático.",
    category: "outro", priority: "baixa", team: "Suporte_N2", sla: "24h",
    status: "cancelado", client: "joao", agent: "ana", createdAt: hoursAgo(50),
  },
  {
    id: "seed-ticket-8",
    title: "Liberar acesso à pasta compartilhada do RH",
    description: "Fui transferido para o RH e preciso acessar a pasta \\\\servidor\\rh.",
    category: "acesso", priority: "media", team: "Seguranca", sla: "8h",
    status: "novo", client: "joao", createdAt: hoursAgo(1),
  },
  {
    id: "seed-ticket-9",
    title: "VPN cai a cada 10 minutos",
    description: "Trabalhando de casa, a VPN desconecta sozinha e preciso entrar de novo.",
    category: "rede", priority: "urgente", team: "Redes", sla: "1h",
    status: "novo", client: "maria", createdAt: hoursAgo(0.5),
  },
];

// "usuario" = cliente do chamado; "tecnico" = atendente do chamado.
const MESSAGES = [
  { id: "seed-message-1", ticketId: "seed-ticket-2", from: "usuario", text: "O relatório mensal trava o sistema sempre que tento gerar." },
  { id: "seed-message-2", ticketId: "seed-ticket-2", from: "tecnico", text: "Recebido, estou verificando os logs do servidor agora." },

  { id: "seed-message-3", ticketId: "seed-ticket-3", from: "usuario", text: "Somos umas 15 pessoas paradas aqui no 2º andar." },
  { id: "seed-message-4", ticketId: "seed-ticket-3", from: "tecnico", text: "O switch do andar reiniciou com configuração antiga. Estou restaurando, previsão de 20 minutos." },

  { id: "seed-message-5", ticketId: "seed-ticket-4", from: "usuario", text: "Preciso acessar ainda hoje para responder um fornecedor." },
  { id: "seed-message-6", ticketId: "seed-ticket-4", from: "tecnico", text: "Senha redefinida. A temporária foi enviada por SMS; troque no primeiro acesso." },

  { id: "seed-message-7", ticketId: "seed-ticket-5", from: "tecnico", text: "Era o cabo HDMI com mau contato. Substituí por um novo." },
  { id: "seed-message-8", ticketId: "seed-ticket-5", from: "usuario", text: "Perfeito, parou de piscar. Obrigado!" },

  { id: "seed-message-9", ticketId: "seed-ticket-6", from: "tecnico", text: "Office instalado e ativado com a sua conta corporativa." },

  { id: "seed-message-10", ticketId: "seed-ticket-7", from: "tecnico", text: "Os arquivos da área de trabalho não entram no backup. Salve no OneDrive. Cancelando por ser apenas dúvida." },
];

const RATINGS = [
  { id: "seed-rating-1", ticketId: "seed-ticket-5", score: 5, comment: "Resolvido rápido e com boa explicação." },
  { id: "seed-rating-2", ticketId: "seed-ticket-6", score: 3, comment: "Resolveu, mas demorou quase um dia." },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = {};
  for (const { key, ...data } of USERS) {
    users[key] = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, passwordHash },
    });
  }

  const tickets = {};
  for (const { client, agent, ...data } of TICKETS) {
    tickets[data.id] = await prisma.ticket.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...data,
        clientId: users[client].id,
        agentId: agent ? users[agent].id : null,
      },
    });
  }

  for (const { from, ...data } of MESSAGES) {
    const ticket = tickets[data.ticketId];
    await prisma.message.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...data,
        from,
        authorId: from === "usuario" ? ticket.clientId : ticket.agentId,
      },
    });
  }

  for (const rating of RATINGS) {
    await prisma.rating.upsert({
      where: { ticketId: rating.ticketId },
      update: {},
      create: rating,
    });
  }

  console.log(`Seed concluído (senha de todas as contas: ${DEMO_PASSWORD}):`);
  for (const user of USERS) {
    console.log(`  ${user.role === "agent" ? "atendente" : "cliente  "}  ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
