const authService = require("./auth.service");
const asyncHandler = require("../../lib/asyncHandler");
const { badRequest } = require("../../lib/AppError");

function validateRegisterInput(body) {
  const { name, email, password } = body;
  if (!name || !email || !password) throw badRequest("name, email e password são obrigatórios.");
  if (password.length < 6) throw badRequest("A senha deve ter pelo menos 6 caracteres.");
}

// Os erros (credenciais inválidas, e-mail duplicado...) são lançados pelo
// service como AppError e respondidos pelo middleware errorHandler.
const loginClient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const session = await authService.authenticate(email, password, "client");
  res.status(200).json(session);
});

const loginAgent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const session = await authService.authenticate(email, password, "agent");
  res.status(200).json(session);
});

// Rota pública — qualquer pessoa pode criar a própria conta de cliente.
// `role` é fixado aqui como "client", nunca lido do corpo da requisição.
const registerClient = asyncHandler(async (req, res) => {
  validateRegisterInput(req.body);
  const { name, email, password, department } = req.body;
  const session = await authService.register(name, email, password, "client", department);
  res.status(201).json(session);
});

// Rota protegida — só chega aqui quem já passou por authenticate +
// authorize("agent") nas routes, ou seja, só atendente cadastra atendente.
const registerAgent = asyncHandler(async (req, res) => {
  validateRegisterInput(req.body);
  const { name, email, password } = req.body;
  const session = await authService.register(name, email, password, "agent");
  res.status(201).json(session);
});

module.exports = { loginClient, loginAgent, registerClient, registerAgent };
