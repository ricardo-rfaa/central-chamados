const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");

// Roda com: npm run seed
// Popula o banco local com usuários e chamados de exemplo,
// pra não depender de cadastrar nada na hora da apresentação.
async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const client = await prisma.user.upsert({
    where: { email: "cliente@demo.com" },
    update: {},
    create: {
      name: "Maria Cliente",
      email: "cliente@demo.com",
      passwordHash,
      role: "client",
      department: "Financeiro",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "atendente@demo.com" },
    update: {},
    create: {
      name: "Carlos Atendente",
      email: "atendente@demo.com",
      passwordHash,
      role: "agent",
    },
  });

  const t1 = await prisma.ticket.upsert({
    where: { id: "seed-ticket-1" },
    update: {},
    create: {
      id: "seed-ticket-1",
      title: "Impressora não conecta à rede",
      description: "A impressora do setor financeiro não é reconhecida na rede Wi-Fi.",
      category: "hardware",
      priority: "alta",
      status: "novo",
      team: "Suporte_N1",
      sla: "4h",
      clientId: client.id,
    },
  });

  const t2 = await prisma.ticket.upsert({
    where: { id: "seed-ticket-2" },
    update: {},
    create: {
      id: "seed-ticket-2",
      title: "Erro ao abrir sistema financeiro",
      description: "Sistema trava ao gerar relatório mensal.",
      category: "software",
      priority: "urgente",
      status: "em_atendimento",
      team: "Suporte_N2",
      sla: "1h",
      clientId: client.id,
      agentId: agent.id,
    },
  });

  await prisma.message.createMany({
    data: [
      { ticketId: t2.id, authorId: client.id, from: "usuario", text: "O relatório mensal trava o sistema sempre que tento gerar." },
      { ticketId: t2.id, authorId: agent.id, from: "tecnico", text: "Recebido, estou verificando os logs do servidor agora." },
    ],
  });

  console.log("Seed concluído: cliente@demo.com / atendente@demo.com — senha: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
