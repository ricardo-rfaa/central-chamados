import { api } from './api'
import type { Ticket } from '../data'

// Todas as rotas de ticket exigem o token do usuário logado — o backend
// decide sozinho, a partir do token, se é cliente (só vê os próprios) ou
// atendente (vê todos). Por isso toda função aqui recebe o token.
export function listTickets(token: string) {
  return api.get<Ticket[]>('/tickets', token)
}

export function getTicket(token: string, id: string) {
  return api.get<Ticket>(`/tickets/${id}`, token)
}

export function createTicket(
  token: string,
  input: { title: string; description: string; category: Ticket['category'] },
) {
  return api.post<Ticket>('/tickets', input, token)
}

export function sendMessage(token: string, ticketId: string, text: string) {
  return api.post<Ticket>(`/tickets/${ticketId}/messages`, { text }, token)
}

export function updateStatus(token: string, ticketId: string, status: Ticket['status']) {
  return api.patch<Ticket>(`/tickets/${ticketId}/status`, { status }, token)
}

// RF10: confirmação de fechamento pelo cliente, separada da avaliação.
export function confirmClosure(token: string, ticketId: string) {
  return api.post<Ticket>(`/tickets/${ticketId}/close`, {}, token)
}

export function rateTicket(token: string, ticketId: string, score: number, comment: string) {
  return api.post<Ticket>(`/tickets/${ticketId}/rating`, { score, comment }, token)
}
