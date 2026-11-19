import type { Priority, Status } from '../data'

export function priorityColor(p: Priority) {
  return {
    baixa: { bg: '#1a2a1a', text: '#3fb950', border: '#238636' },
    media: { bg: '#1f2535', text: '#79c0ff', border: '#1f6feb' },
    alta: { bg: '#2d1f00', text: '#e3b341', border: '#9e6a03' },
    urgente: { bg: '#2d1212', text: '#ff7b72', border: '#da3633' },
  }[p]
}

export function statusColor(s: Status) {
  return {
    novo: { bg: '#1f2535', text: '#79c0ff', dot: '#79c0ff' },
    em_atendimento: { bg: '#2d2200', text: '#d29922', dot: '#d29922' },
    resolvido: { bg: '#161b22', text: '#8b949e', dot: '#3fb950' },
    fechado: { bg: '#161b22', text: '#6e7681', dot: '#6e7681' },
  }[s]
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
