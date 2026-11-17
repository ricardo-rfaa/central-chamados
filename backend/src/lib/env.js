require("dotenv").config();

// Variáveis obrigatórias são conferidas quando o módulo é carregado: se
// faltar alguma (ex.: esqueceram de cadastrar na Vercel), a API falha na
// inicialização com uma mensagem clara, em vez de quebrar só no login.
function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Variável de ambiente ${name} não definida. Configure-a no .env (local) ou nas Environment Variables do deploy.`
    );
  }
  return value;
}

module.exports = {
  JWT_SECRET: required("JWT_SECRET"),
};
