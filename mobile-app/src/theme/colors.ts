// Mesma paleta exata da versão web (src/lib/styles.ts e ticketFormatting.ts
// do projeto React). Mantida centralizada aqui para não duplicar valores
// hex espalhados pelos componentes, como acontecia na versão web.
export const colors = {
  background: '#0d1117',
  surface: '#161b22',
  surfaceAlt: '#21262d',
  border: '#30363d',
  borderSubtle: '#21262d',
  text: '#e6edf3',
  textSecondary: '#c9d1d9',
  textMuted: '#8b949e',
  textFaint: '#6e7681',
  accent: '#f0a84a',
  accentText: '#0d1117',
  danger: '#da3633',
  dangerBg: '#2d1212',
  dangerText: '#ff7b72',
  success: '#238636',
  successText: '#3fb950',
  info: '#1f6feb',
  infoText: '#79c0ff',
} as const

export const priorityColors = {
  baixa: { bg: '#1a2a1a', text: '#3fb950', border: '#238636' },
  media: { bg: '#1f2535', text: '#79c0ff', border: '#1f6feb' },
  alta: { bg: '#2d1f00', text: '#e3b341', border: '#9e6a03' },
  urgente: { bg: '#2d1212', text: '#ff7b72', border: '#da3633' },
} as const

export const statusColors = {
  novo: { bg: '#1f2535', text: '#79c0ff', dot: '#79c0ff' },
  em_atendimento: { bg: '#2d2200', text: '#d29922', dot: '#d29922' },
  resolvido: { bg: '#161b22', text: '#8b949e', dot: '#3fb950' },
  fechado: { bg: '#161b22', text: '#6e7681', dot: '#6e7681' },
} as const
