const { teamToLabel } = require("./team.mapper");

// Converte um Ticket vindo do Prisma (com client/agent/messages/rating
// incluídos via `include`) para o shape exato do type Ticket em
// src/data.ts do frontend — assim o front não precisa saber nada sobre
// a modelagem do banco.
function toTicketDTO(ticket) {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    team: teamToLabel(ticket.team),
    assignee: ticket.agent?.name ?? null,
    requester: ticket.client.name,
    requesterId: ticket.clientId, // usado pelo front pra filtrar "meus chamados" com segurança
    department: ticket.client.department ?? "",
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    sla: ticket.sla,
    messages: ticket.messages.map((m) => ({
      id: m.id,
      from: m.from,
      text: m.text,
      time: m.sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    })),
    rating: ticket.rating ? { score: ticket.rating.score, comment: ticket.rating.comment } : null,
  };
}

// include padrão usado em toda consulta que vai passar por toTicketDTO
const TICKET_INCLUDE = {
  client: true,
  agent: true,
  messages: { orderBy: { sentAt: "asc" } },
  rating: true,
};

module.exports = { toTicketDTO, TICKET_INCLUDE };
