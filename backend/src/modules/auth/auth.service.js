const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../lib/prisma");
const { JWT_SECRET } = require("../../lib/env");
const { unauthorized, forbidden, conflict } = require("../../lib/AppError");

// Mensagem única para e-mail inexistente e senha errada: assim a tela de
// login não revela quais e-mails têm conta no sistema.
const INVALID_CREDENTIALS = "E-mail ou senha inválidos.";

// Hash fixo usado quando o e-mail não existe, para que o bcrypt.compare
// rode do mesmo jeito e o tempo de resposta não denuncie a diferença.
const DUMMY_HASH = bcrypt.hashSync("senha-ficticia-para-tempo-constante", 10);

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function toSession(user) {
  return {
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

// Mesma lógica de autenticação para os dois perfis, mas com uma checagem
// extra de "role": um cliente não consegue logar pela tela de atendente
// e vice-versa, mesmo que descubram o endpoint errado.
async function authenticate(email, password, expectedRole) {
  if (typeof email !== "string" || typeof password !== "string") {
    throw unauthorized(INVALID_CREDENTIALS);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const validPassword = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !validPassword) throw unauthorized(INVALID_CREDENTIALS);

  // Só chega aqui quem acertou e-mail e senha, então informar o perfil
  // errado não vaza nada para quem não conhece a senha.
  if (user.role !== expectedRole) {
    throw forbidden("Este usuário não tem permissão para este tipo de acesso.");
  }

  return toSession(user);
}

// Cadastro. `role` é decidido pelo controller (nunca pelo corpo da
// requisição), para que a rota pública só consiga criar clientes e a
// rota de atendente exija estar logado como agente — ver auth.routes.js.
async function register(name, email, password, role, department) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Já existe uma conta com este e-mail.");

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash, role, department: department ?? null },
    });
  } catch (error) {
    // Duas requisições simultâneas com o mesmo e-mail: a constraint única
    // do banco barra a segunda.
    if (error.code === "P2002") throw conflict("Já existe uma conta com este e-mail.");
    throw error;
  }

  return toSession(user);
}

module.exports = { authenticate, register };
