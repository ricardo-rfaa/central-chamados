const { PrismaClient } = require("@prisma/client");

// Uma única instância evita esgotar conexões em hot-reload durante o dev.
const prisma = new PrismaClient();

module.exports = prisma;
