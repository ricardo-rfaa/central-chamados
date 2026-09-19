// O enum Team do Prisma não aceita espaço nem acento, então usamos nomes
// "seguros" no banco (Suporte_N1, Seguranca) e convertemos aqui para o
// rótulo exato que o frontend espera (src/data.ts), e vice-versa.
const TEAM_DB_TO_LABEL = {
  Infraestrutura: "Infraestrutura",
  Suporte_N1: "Suporte N1",
  Suporte_N2: "Suporte N2",
  Seguranca: "Segurança",
  Redes: "Redes",
};

const TEAM_LABEL_TO_DB = Object.fromEntries(
  Object.entries(TEAM_DB_TO_LABEL).map(([db, label]) => [label, db])
);

function teamToLabel(dbValue) {
  return TEAM_DB_TO_LABEL[dbValue] ?? dbValue;
}

function teamToDb(label) {
  const dbValue = TEAM_LABEL_TO_DB[label];
  if (!dbValue) throw new Error(`Equipe inválida: ${label}`);
  return dbValue;
}

module.exports = { teamToLabel, teamToDb };
