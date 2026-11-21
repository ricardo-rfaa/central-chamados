const prisma = require("../../lib/prisma");

// Os dias do gráfico seguem o horário de Brasília, não o UTC do servidor:
// um chamado aberto às 22h de segunda conta como segunda.
const TIME_ZONE = "America/Sao_Paulo";
const DAYS = 7;
const CATEGORIES = ["hardware", "software", "rede", "acesso", "outro"];

// "2026-11-20" no fuso de Brasília.
function dayKey(date) {
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

function lastDays(now) {
  const keys = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)));
  }
  return keys;
}

async function getIndicators() {
  const now = new Date();
  // Margem de 1 dia além da janela para não perder chamados por causa do fuso.
  const since = new Date(now.getTime() - (DAYS + 1) * 24 * 60 * 60 * 1000);

  const [recentOpened, recentClosed, agents, inProgress, byCategory, ratings] = await Promise.all([
    prisma.ticket.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.ticket.findMany({ where: { closedAt: { gte: since } }, select: { closedAt: true } }),
    prisma.user.findMany({ where: { role: "agent" }, select: { id: true, name: true } }),
    prisma.ticket.groupBy({ by: ["agentId"], where: { status: "em_atendimento" }, _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.rating.findMany({ select: { score: true } }),
  ]);

  // Abertos x fechados por dia (fechado = confirmado pelo cliente).
  const days = lastDays(now).map((date) => ({ date, opened: 0, closed: 0 }));
  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const t of recentOpened) {
    const d = byDay.get(dayKey(t.createdAt));
    if (d) d.opened++;
  }
  for (const t of recentClosed) {
    const d = byDay.get(dayKey(t.closedAt));
    if (d) d.closed++;
  }

  // Carga atual: todos os atendentes aparecem, inclusive quem está com 0.
  const inProgressByAgent = new Map(inProgress.map((g) => [g.agentId, g._count._all]));
  const workload = agents
    .map((a) => ({ agentId: a.id, name: a.name, inProgress: inProgressByAgent.get(a.id) ?? 0 }))
    .sort((a, b) => b.inProgress - a.inProgress || a.name.localeCompare(b.name, "pt-BR"));

  // Todas as categorias aparecem, na mesma ordem do formulário.
  const countByCategory = new Map(byCategory.map((g) => [g.category, g._count._all]));
  const categories = CATEGORIES.map((category) => ({ category, count: countByCategory.get(category) ?? 0 }));

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  for (const r of ratings) {
    distribution[r.score] = (distribution[r.score] ?? 0) + 1;
    total += r.score;
  }

  return {
    generatedAt: now.toISOString(),
    lastDays: days,
    workload,
    byCategory: categories,
    satisfaction: {
      average: ratings.length ? Math.round((total / ratings.length) * 10) / 10 : null,
      count: ratings.length,
      distribution,
    },
  };
}

module.exports = { getIndicators };
