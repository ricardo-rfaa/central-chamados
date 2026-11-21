import { api } from './api'
import type { Category } from '../types/ticket'

// Mesmo formato devolvido por GET /indicators (só atendentes).
export interface Indicators {
  generatedAt: string
  lastDays: { date: string; opened: number; closed: number }[]
  workload: { agentId: string; name: string; inProgress: number }[]
  byCategory: { category: Category; count: number }[]
  satisfaction: {
    average: number | null
    count: number
    distribution: Record<'1' | '2' | '3' | '4' | '5', number>
  }
}

export function getIndicators(token: string) {
  return api.get<Indicators>('/indicators', token)
}
