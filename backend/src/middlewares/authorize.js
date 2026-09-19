// Uso: router.get("/tickets/queue", authenticate, authorize("agent"), handler)
module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso não permitido para este perfil." });
    }
    next();
  };
};
