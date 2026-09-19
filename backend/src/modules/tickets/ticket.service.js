const prisma = require("../../lib/prisma");
const { teamToDb } = require("./team.mapper");
const { toTicketDTO, TICKET_INCLUDE } = require("./ticket.mapper");

// Mesma regra que já existia no frontend mockado (NewTicketForm em
// App.tsx): a categoria decide prioridade, equipe e SLA por padrão.
function autoPriority(category) {
  if (category === "rede") return "urgente";
  if (category === "acesso") return "media";
  if (category === "hardware") return "alta";
  return "baixa";
}

function autoTeamLabel(category) {
  if (category === "rede") return "Redes";
  if (category === "acesso") return "Segurança";
  if (category === "hardware") return "Suporte N1";
  return "Suporte N2";
}

const SLA_BY_PRIORITY = { urgente: "1h", alta: "4h", media: "8h", baixa: "24h" };

// Cliente só enxerga os próprios chamados (por clientId, nunca por nome —
// evita que dois clientes com nomes parecidos vejam chamados um do outro).
// Agente enxerga todos, para poder triar e assumir qualquer um.
async function listTickets(user) {
  const where = user.role === "client" ? { clientId: user.sub } : {};
  const tickets = await prisma.ticket.findMany({
    where,
    include: TICKET_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return tickets.map(toTicketDTO);
}

async function getTicketById(user, ticketId) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: TICKET_INCLUDE,
  });
  if (!ticket) throw new Error("Chamado não encontrado.");
  if (user.role === "client" && ticket.clientId !== user.sub) {
    throw new Error("Você não tem acesso a este chamado.");
  }
  return toTicketDTO(ticket);
}

async function createTicket(user, input) {
  if (user.role !== "client") {
    throw new Error("Apenas clientes podem abrir chamados.");
  }
  const priority = autoPriority(input.category);
  const ticket = await prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      priority,
      status: "novo", // RF07: todo chamado nasce em "Novo", antes de qualquer atendente assumir
      team: teamToDb(autoTeamLabel(input.category)),
      sla: SLA_BY_PRIORITY[priority],
      clientId: user.sub,
    },
    include: TICKET_INCLUDE,
  });
  return toTicketDTO(ticket);
}

// Regras de quem pode enviar mensagem em qual ticket: cliente só no
// próprio chamado; agente em qualquer um (para poder responder antes de
// "assumir" oficialmente o chamado).
async function addMessage(user, ticketId, text) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Chamado não encontrado.");
  if (user.role === "client" && ticket.clientId !== user.sub) {
    throw new Error("Você não tem acesso a este chamado.");
  }

  await prisma.message.create({
    data: {
      text,
      from: user.role === "client" ? "usuario" : "tecnico",
      ticketId,
      authorId: user.sub,
    },
  });

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
    include: TICKET_INCLUDE,
  });
  return toTicketDTO(updated);
}

// RF07: só o atendente move o chamado pelo fluxo técnico (Novo → Em
// atendimento → Resolvido). O passo final, Resolvido → Fechado, não passa
// por aqui — é uma ação separada do cliente (ver confirmClosure), porque
// o RF10 exige confirmação do usuário para fechar, não do atendente.
const AGENT_ALLOWED_TRANSITIONS = {
  novo: "em_atendimento",
  em_atendimento: "resolvido",
};

async function updateStatus(user, ticketId, status) {
  if (user.role !== "agent") throw new Error("Apenas atendentes podem alterar o status.");
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Chamado não encontrado.");

  if (AGENT_ALLOWED_TRANSITIONS[ticket.status] !== status) {
    throw new Error(`Não é possível mudar de "${ticket.status}" para "${status}".`);
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status,
      agentId: status === "em_atendimento" ? user.sub : undefined,
    },
    include: TICKET_INCLUDE,
  });
  return toTicketDTO(updated);
}

// RF10: o fechamento é uma ação do cliente, feita depois que o técnico
// marca o chamado como "Resolvido" — não é automática nem depende de
// avaliação. É a confirmação de que o problema realmente foi resolvido.
async function confirmClosure(user, ticketId) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Chamado não encontrado.");
  if (user.role !== "client" || ticket.clientId !== user.sub) {
    throw new Error("Você não tem acesso a este chamado.");
  }
  if (ticket.status !== "resolvido") {
    throw new Error("Só é possível confirmar o fechamento de um chamado resolvido.");
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "fechado", closedAt: new Date() },
    include: TICKET_INCLUDE,
  });
  return toTicketDTO(updated);
}

// RF11: avaliação é solicitada depois do fechamento, e é independente
// dele — não muda mais o status do chamado (isso já aconteceu no
// confirmClosure). Pode ser enviada uma única vez.
async function rateTicket(user, ticketId, score, comment) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error("Chamado não encontrado.");
  if (user.role !== "client" || ticket.clientId !== user.sub) {
    throw new Error("Você não tem acesso a este chamado.");
  }
  if (ticket.status !== "fechado") {
    throw new Error("Só é possível avaliar um chamado fechado.");
  }

  await prisma.rating.upsert({
    where: { ticketId },
    create: { ticketId, score, comment },
    update: { score, comment },
  });

  const updated = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: TICKET_INCLUDE,
  });
  return toTicketDTO(updated);
}

module.exports = { listTickets, getTicketById, createTicket, addMessage, updateStatus, confirmClosure, rateTicket };
