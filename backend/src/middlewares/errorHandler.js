const { AppError } = require("../lib/AppError");

// Middleware de erro central (precisa dos 4 parâmetros para o Express
// reconhecê-lo). AppError vira a resposta com o status dele; erros do
// body-parser (JSON malformado) mantêm o status 4xx; qualquer outro erro
// inesperado vira 500 sem expor detalhes internos ao cliente.
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON inválido no corpo da requisição." });
  }

  console.error(err);
  return res.status(500).json({ message: "Erro interno do servidor." });
};
