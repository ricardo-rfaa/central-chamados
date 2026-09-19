import type { Ticket } from '../data'
import { CATEGORY_LABELS } from '../data'
import { priorityColor, fmtDate } from '../lib/ticketFormatting'
import { Badge, PriorityBadge, StatusBadge } from './Badge'

export function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const pc = priorityColor(ticket.priority)
  return (
    <div onClick={onClick} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '14px 16px', cursor: 'pointer', borderLeft: `3px solid ${pc.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f0a84a' }}>{ticket.id}</span>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3', marginTop: 2, lineHeight: 1.4 }}>{ticket.title}</div>
        </div>
        <PriorityBadge p={ticket.priority} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <StatusBadge s={ticket.status} />
        <Badge label={CATEGORY_LABELS[ticket.category]} style={{ background: '#161b22', color: '#8b949e', border: '1px solid #30363d' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: '#c9d1d9' }}>{ticket.requester}</div>
          <div style={{ fontSize: 11, color: '#6e7681' }}>{ticket.department}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: ticket.assignee ? '#c9d1d9' : '#6e7681', fontStyle: ticket.assignee ? 'normal' : 'italic' }}>{ticket.assignee || 'Não atribuído'}</div>
          <div style={{ fontSize: 10, color: '#6e7681', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{fmtDate(ticket.createdAt)}</div>
        </div>
      </div>
    </div>
  )
}
