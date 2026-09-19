const authService = require("./auth.service");

function validateRegisterInput(body) {
  const { name, email, password } = body;
  if (!name || !email || !password) return "name, email e password são obrigatórios.";
  if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
  return null;
}

async function loginClient(req, res) {
  const { email, password } = req.body;
  try {
    const session = await authService.authenticate(email, password, "client");
    return res.status(200).json(session);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

async function loginAgent(req, res) {
  const { email, password } = req.body;
  try {
    const session = await authService.authenticate(email, password, "agent");
    return res.status(200).json(session);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

// Rota pública — qualquer pessoa pode criar a própria conta de cliente.
// `role` é fixado aqui como "client", nunca lido do corpo da requisição.
async function registerClient(req, res) {
  const invalid = validateRegisterInput(req.body);
  if (invalid) return res.status(400).json({ message: invalid });
  const { name, email, password, department } = req.body;
  try {
    const session = await authService.register(name, email, password, "client", department);
    return res.status(201).json(session);
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
}

// Rota protegida — só chega aqui quem já passou por authenticate +
// authorize("agent") nas routes, ou seja, só atendente cadastra atendente.
async function registerAgent(req, res) {
  const invalid = validateRegisterInput(req.body);
  if (invalid) return res.status(400).json({ message: invalid });
  const { name, email, password } = req.body;
  try {
    const session = await authService.register(name, email, password, "agent");
    return res.status(201).json(session);
  } catch (err) {
    return res.status(409).json({ message: err.message });
  }
}

module.exports = { loginClient, loginAgent, registerClient, registerAgent };
