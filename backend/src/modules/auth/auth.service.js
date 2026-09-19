const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");

const JWT_SECRET = process.env.JWT_SECRET;

// Mesma lógica de autenticação para os dois perfis, mas com uma checagem
// extra de "role": um cliente não consegue logar pela tela de atendente
// e vice-versa, mesmo que descubram o endpoint errado.
async function authenticate(email, password, expectedRole) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado.");

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) throw new Error("Senha inválida.");

  if (user.role !== expectedRole) {
    throw new Error("Este usuário não tem permissão para este tipo de acesso.");
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// Cadastro. `role` é decidido pelo controller (nunca pelo corpo da
// requisição), para que a rota pública só consiga criar clientes e a
// rota de atendente exija estar logado como agente — ver auth.routes.js.
async function register(name, email, password, role, department) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Já existe uma conta com este e-mail.");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, department: department ?? null },
  });

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { authenticate, register };
