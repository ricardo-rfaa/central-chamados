const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token ausente." });

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, role }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};
