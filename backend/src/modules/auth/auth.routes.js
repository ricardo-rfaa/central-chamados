const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");

// Endpoints separados (em vez de um único /auth/login com "role" no body)
// deixam claro no log e no rate-limit qual público está acessando,
// e permitem regras diferentes no futuro (ex: 2FA só pra atendente).
router.post("/client/login", authController.loginClient);
router.post("/agent/login", authController.loginAgent);

// Cadastro de cliente é público — qualquer pessoa cria a própria conta.
router.post("/client/register", authController.registerClient);

// Cadastro de atendente exige estar logado como atendente — ninguém
// de fora consegue criar uma conta com acesso de atendente.
router.post("/agent/register", authenticate, authorize("agent"), authController.registerAgent);

module.exports = router;
