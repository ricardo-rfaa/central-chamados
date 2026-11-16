const ticketService = require("./ticket.service");
const asyncHandler = require("../../lib/asyncHandler");
const { badRequest } = require("../../lib/AppError");

const VALID_CATEGORIES = ["hardware", "software", "rede", "acesso", "outro"];
const VALID_STATUSES = ["novo", "em_atendimento", "resolvido", "fechado"];

// Os status de erro (404, 403, 409...) vêm do próprio service via AppError;
// o controller só valida a entrada e devolve o resultado.

const list = asyncHandler(async (req, res) => {
  const tickets = await ticketService.listTickets(req.user);
  res.status(200).json(tickets);
});

const getById = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.user, req.params.id);
  res.status(200).json(ticket);
});

const create = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    throw badRequest("title, description e category são obrigatórios.");
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw badRequest(`category inválida. Use uma de: ${VALID_CATEGORIES.join(", ")}.`);
  }
  const ticket = await ticketService.createTicket(req.user, { title, description, category });
  res.status(201).json(ticket);
});

const addMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw badRequest("text é obrigatório.");
  const ticket = await ticketService.addMessage(req.user, req.params.id, text);
  res.status(200).json(ticket);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw badRequest("status é obrigatório.");
  if (!VALID_STATUSES.includes(status)) {
    throw badRequest(`status inválido. Use um de: ${VALID_STATUSES.join(", ")}.`);
  }
  const ticket = await ticketService.updateStatus(req.user, req.params.id, status);
  res.status(200).json(ticket);
});

// RF10: cliente confirma o fechamento do chamado, separado da avaliação.
const confirmClosure = asyncHandler(async (req, res) => {
  const ticket = await ticketService.confirmClosure(req.user, req.params.id);
  res.status(200).json(ticket);
});

// RF11: avaliação de 1 a 5, disponível só depois do fechamento (RF10).
const rate = asyncHandler(async (req, res) => {
  const { score, comment } = req.body;
  if (!score) throw badRequest("score é obrigatório.");
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw badRequest("score deve ser um inteiro de 1 a 5.");
  }
  const ticket = await ticketService.rateTicket(req.user, req.params.id, score, comment ?? "");
  res.status(200).json(ticket);
});

module.exports = { list, getById, create, addMessage, updateStatus, confirmClosure, rate };
