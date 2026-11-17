// Erro de regra de negócio com o status HTTP já definido. Os services
// lançam AppError e o middleware errorHandler transforma em resposta,
// sem precisar adivinhar o status pelo texto da mensagem.
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

const badRequest = (message) => new AppError(400, message);
const unauthorized = (message) => new AppError(401, message);
const forbidden = (message) => new AppError(403, message);
const notFound = (message) => new AppError(404, message);
const conflict = (message) => new AppError(409, message);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict };
