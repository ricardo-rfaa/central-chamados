// O Express 4 não captura rejeições de handlers async. Este wrapper
// encaminha qualquer erro para o errorHandler via next(err).
module.exports = function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
};
