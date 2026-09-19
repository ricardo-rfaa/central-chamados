import type { Priority, Status } from '../data'
import { PRIORITY_LABELS, STATUS_LABELS } from '../data'
import { priorityColor, statusColor } from '../lib/ticketFormatting'

export function Badge({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.03em', whiteSpace: 'nowrap', ...style }}>
      {label}
    </span>
  )
}

export function PriorityBadge({ p }: { p: Priority }) {
  const c = priorityColor(p)
  return <Badge label={PRIORITY_LABELS[p]} style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }} />
}

export function StatusBadge({ s }: { s: Status }) {
  const c = statusColor(s)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-mono)', background: c.bg, color: c.text, padding: '2px 7px', borderRadius: 3, border: `1px solid ${c.dot}33` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {STATUS_LABELS[s]}
    </span>
  )
}
