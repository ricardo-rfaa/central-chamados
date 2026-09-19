const ticketService = require("./ticket.service");

const VALID_CATEGORIES = ["hardware", "software", "rede", "acesso", "outro"];
const VALID_STATUSES = ["novo", "em_atendimento", "resolvido", "fechado"];

async function list(req, res) {
  try {
    const tickets = await ticketService.listTickets(req.user);
    res.status(200).json(tickets);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const ticket = await ticketService.getTicketById(req.user, req.params.id);
    res.status(200).json(ticket);
  } catch (err) {
    const status = err.message.includes("não encontrado") ? 404 : 403;
    res.status(status).json({ message: err.message });
  }
}

async function create(req, res) {
  const { title, description, category } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ message: "title, description e category são obrigatórios." });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `category inválida. Use uma de: ${VALID_CATEGORIES.join(", ")}.` });
  }
  try {
    const ticket = await ticketService.createTicket(req.user, { title, description, category });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

async function addMessage(req, res) {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "text é obrigatório." });
  try {
    const ticket = await ticketService.addMessage(req.user, req.params.id, text);
    res.status(200).json(ticket);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

async function updateStatus(req, res) {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "status é obrigatório." });
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: `status inválido. Use um de: ${VALID_STATUSES.join(", ")}.` });
  }
  try {
    const ticket = await ticketService.updateStatus(req.user, req.params.id, status);
    res.status(200).json(ticket);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

// RF10: cliente confirma o fechamento do chamado, separado da avaliação.
async function confirmClosure(req, res) {
  try {
    const ticket = await ticketService.confirmClosure(req.user, req.params.id);
    res.status(200).json(ticket);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

// RF11: avaliação de 1 a 5, disponível só depois do fechamento (RF10).
async function rate(req, res) {
  const { score, comment } = req.body;
  if (!score) return res.status(400).json({ message: "score é obrigatório." });
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({ message: "score deve ser um inteiro de 1 a 5." });
  }
  try {
    const ticket = await ticketService.rateTicket(req.user, req.params.id, score, comment ?? "");
    res.status(200).json(ticket);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
}

module.exports = { list, getById, create, addMessage, updateStatus, confirmClosure, rate };
