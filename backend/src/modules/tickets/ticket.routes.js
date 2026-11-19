const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/authenticate");
const ticketController = require("./ticket.controller");

// Todas as rotas de ticket exigem login; a diferença entre cliente e
// atendente é decidida dentro do service (ver ticket.service.js), não
// aqui — assim a regra de "cliente só vê os próprios" fica num único
// lugar, testável, em vez de espalhada em middlewares por rota.
router.use(authenticate);

router.get("/", ticketController.list);
router.get("/:id", ticketController.getById);
router.post("/", ticketController.create);
router.post("/:id/messages", ticketController.addMessage);
router.patch("/:id/status", ticketController.updateStatus);
router.post("/:id/close", ticketController.confirmClosure);
router.post("/:id/rating", ticketController.rate);

module.exports = router;
