// Tipos portados 1:1 da versão web (src/data.ts). O contrato com o
// backend não muda — são os mesmos campos, os mesmos nomes de enum.
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente'
export type Category = 'hardware' | 'software' | 'rede' | 'acesso' | 'outro'
export type Status = 'novo' | 'em_atendimento' | 'resolvido' | 'fechado'
export type Team = 'Infraestrutura' | 'Suporte N1' | 'Suporte N2' | 'Segurança' | 'Redes'

export interface Message {
  id: string
  from: 'tecnico' | 'usuario'
  text: string
  time: string
}

export interface Rating {
  score: 1 | 2 | 3 | 4 | 5
  comment: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: Category
  priority: Priority
  status: Status
  team: Team
  assignee: string | null
  requester: string
  requesterId: string
  department: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  rating: Rating | null
  sla: string
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const STATUS_LABELS: Record<Status, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  hardware: 'Hardware',
  software: 'Software',
  rede: 'Rede',
  acesso: 'Acesso',
  outro: 'Outro',
}
