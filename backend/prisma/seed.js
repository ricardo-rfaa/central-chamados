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
    id: "85c57d7c-8a0a-407e-b015-cadac8d9420d",
    title: "Impressora não conecta à rede",
    description: "A impressora do setor financeiro não é reconhecida na rede Wi-Fi.",
    category: "hardware", priority: "alta", team: "Suporte_N1", sla: "4h",
    status: "novo", client: "maria",
  },
  {
    id: "44b2c689-f9f5-41a1-9aef-0882515ec60d",
    title: "Erro ao abrir sistema financeiro",
    description: "Sistema trava ao gerar relatório mensal.",
    category: "software", priority: "urgente", team: "Suporte_N2", sla: "1h",
    status: "em_atendimento", client: "maria", agent: "carlos",
  },
  {
    id: "fea56aa1-0917-4467-afc4-87fed0e2bfda",
    title: "Sem internet no 2º andar",
    description: "Desde a manhã nenhum computador do 2º andar acessa a internet. A rede interna funciona.",
    category: "rede", priority: "urgente", team: "Redes", sla: "1h",
    status: "em_atendimento", client: "joao", agent: "ana", createdAt: hoursAgo(3),
  },
  {
    id: "3585b144-e4b7-4108-92e2-0e42f9bc6862",
    title: "Redefinir senha do e-mail corporativo",
    description: "Minha senha expirou durante as férias e não consigo entrar no e-mail.",
    category: "acesso", priority: "media", team: "Seguranca", sla: "8h",
    status: "resolvido", client: "maria", agent: "carlos", createdAt: hoursAgo(26),
  },
  {
    id: "bdc7598f-f7f6-42a0-8734-697aea78777b",
    title: "Monitor piscando",
    description: "O monitor da estação 14 pisca a cada poucos segundos e às vezes apaga.",
    category: "hardware", priority: "alta", team: "Suporte_N1", sla: "4h",
    status: "fechado", client: "joao", agent: "carlos", createdAt: hoursAgo(72), closedAt: hoursAgo(66),
  },
  {
    id: "5bebaa01-4106-4eeb-b6f3-5822c742e5c8",
    title: "Instalar pacote Office no notebook novo",
    description: "Recebi um notebook novo e preciso do Word e do Excel instalados.",
    category: "software", priority: "baixa", team: "Suporte_N2", sla: "24h",
    status: "fechado", client: "maria", agent: "ana", createdAt: hoursAgo(120), closedAt: hoursAgo(98),
  },
  {
    id: "4384a812-28c2-4437-8b9b-99c28e9363d0",
    title: "Dúvida sobre backup de arquivos",
    description: "Gostaria de saber se os arquivos da área de trabalho entram no backup automático.",
    category: "outro", priority: "baixa", team: "Suporte_N2", sla: "24h",
    status: "cancelado", client: "joao", agent: "ana", createdAt: hoursAgo(50),
  },
  {
    id: "54b81406-5fe0-4a7e-82c9-feb505b7be91",
    title: "Liberar acesso à pasta compartilhada do RH",
    description: "Fui transferido para o RH e preciso acessar a pasta \\\\servidor\\rh.",
    category: "acesso", priority: "media", team: "Seguranca", sla: "8h",
    status: "novo", client: "joao", createdAt: hoursAgo(1),
  },
  {
    id: "7ff9b8ab-c454-4db5-8731-4ded262ddcf3",
    title: "VPN cai a cada 10 minutos",
    description: "Trabalhando de casa, a VPN desconecta sozinha e preciso entrar de novo.",
    category: "rede", priority: "urgente", team: "Redes", sla: "1h",
    status: "novo", client: "maria", createdAt: hoursAgo(0.5),
  },
];

// "usuario" = cliente do chamado; "tecnico" = atendente do chamado.
const MESSAGES = [
  { id: "333a1c1e-ef0d-47ca-9674-acabc6e9ab1d", ticketId: "44b2c689-f9f5-41a1-9aef-0882515ec60d", from: "usuario", text: "O relatório mensal trava o sistema sempre que tento gerar." },
  { id: "4ddd2b30-4716-458b-bb61-4274b14b9e69", ticketId: "44b2c689-f9f5-41a1-9aef-0882515ec60d", from: "tecnico", text: "Recebido, estou verificando os logs do servidor agora." },

  { id: "59ab18ec-b980-4f38-9ae8-807387bd2ec8", ticketId: "fea56aa1-0917-4467-afc4-87fed0e2bfda", from: "usuario", text: "Somos umas 15 pessoas paradas aqui no 2º andar." },
  { id: "ae9edace-1c59-4d1a-8d9d-8d35e6fb3439", ticketId: "fea56aa1-0917-4467-afc4-87fed0e2bfda", from: "tecnico", text: "O switch do andar reiniciou com configuração antiga. Estou restaurando, previsão de 20 minutos." },

  { id: "37609f7b-2d97-46e6-9e53-7d0449c7b086", ticketId: "3585b144-e4b7-4108-92e2-0e42f9bc6862", from: "usuario", text: "Preciso acessar ainda hoje para responder um fornecedor." },
  { id: "0c8db348-79f5-4744-bde5-3baec80dc71b", ticketId: "3585b144-e4b7-4108-92e2-0e42f9bc6862", from: "tecnico", text: "Senha redefinida. A temporária foi enviada por SMS; troque no primeiro acesso." },

  { id: "7a0628fd-069e-481b-bc0a-1fa070c1b69f", ticketId: "bdc7598f-f7f6-42a0-8734-697aea78777b", from: "tecnico", text: "Era o cabo HDMI com mau contato. Substituí por um novo." },
  { id: "7b2c6a5e-a6df-4416-ac10-86d64c8b136f", ticketId: "bdc7598f-f7f6-42a0-8734-697aea78777b", from: "usuario", text: "Perfeito, parou de piscar. Obrigado!" },

  { id: "56670fda-264b-4003-bf51-42a31d33f63c", ticketId: "5bebaa01-4106-4eeb-b6f3-5822c742e5c8", from: "tecnico", text: "Office instalado e ativado com a sua conta corporativa." },

  { id: "62b85169-e078-4078-ac79-65cee2ab3841", ticketId: "4384a812-28c2-4437-8b9b-99c28e9363d0", from: "tecnico", text: "Os arquivos da área de trabalho não entram no backup. Salve no OneDrive. Cancelando por ser apenas dúvida." },
];

const RATINGS = [
  { id: "c3d8cf9d-9668-4bf1-a9ca-baf389d66114", ticketId: "bdc7598f-f7f6-42a0-8734-697aea78777b", score: 5, comment: "Resolvido rápido e com boa explicação." },
  { id: "8ee027b9-3bb1-4800-a7f9-9ab4dc5ac26e", ticketId: "5bebaa01-4106-4eeb-b6f3-5822c742e5c8", score: 3, comment: "Resolveu, mas demorou quase um dia." },
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
