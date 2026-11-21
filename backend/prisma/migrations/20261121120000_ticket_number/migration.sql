-- Número curto e sequencial para exibir os chamados (ex.: #00042).
-- Chamados já existentes são numerados pela ordem de criação; os novos
-- recebem o próximo valor da sequência.

CREATE SEQUENCE "Ticket_number_seq";

ALTER TABLE "Ticket" ADD COLUMN "number" INTEGER;

UPDATE "Ticket" AS t
SET "number" = s.n
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt", "id") AS n
  FROM "Ticket"
) AS s
WHERE t."id" = s."id";

SELECT setval('"Ticket_number_seq"', COALESCE((SELECT MAX("number") FROM "Ticket"), 0) + 1, false);

ALTER TABLE "Ticket"
  ALTER COLUMN "number" SET DEFAULT nextval('"Ticket_number_seq"'),
  ALTER COLUMN "number" SET NOT NULL;

ALTER SEQUENCE "Ticket_number_seq" OWNED BY "Ticket"."number";

CREATE UNIQUE INDEX "Ticket_number_key" ON "Ticket"("number");
