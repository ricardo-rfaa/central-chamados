import { useState } from 'react'
import type { Ticket } from '../data'
import { CATEGORY_LABELS } from '../data'
import { fmtDate } from '../lib/ticketFormatting'
import { Badge, PriorityBadge, StatusBadge } from './Badge'

export const tdStyle: React.CSSProperties = { padding: '12px 16px', borderBottom: '1px solid #21262d', verticalAlign: 'middle' }

export function TicketRow({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <tr onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ cursor: 'pointer', background: hov ? '#1c2128' : 'transparent', transition: 'background 0.1s' }}>
      <td style={tdStyle}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f0a84a' }}>{ticket.id}</span></td>
      <td style={tdStyle}>
        <div style={{ fontWeight: 500, color: '#e6edf3', fontSize: 13, marginBottom: 2 }}>{ticket.title}</div>
        <div style={{ fontSize: 11, color: '#6e7681' }}>{ticket.requester} · {ticket.department}</div>
      </td>
      <td style={tdStyle}><Badge label={CATEGORY_LABELS[ticket.category]} style={{ background: '#161b22', color: '#8b949e', border: '1px solid #30363d' }} /></td>
      <td style={tdStyle}><PriorityBadge p={ticket.priority} /></td>
      <td style={tdStyle}><StatusBadge s={ticket.status} /></td>
      <td style={tdStyle}><span style={{ fontSize: 12, color: '#6e7681' }}>{ticket.team}</span></td>
      <td style={tdStyle}><span style={{ fontSize: 12, color: ticket.assignee ? '#c9d1d9' : '#6e7681', fontStyle: ticket.assignee ? 'normal' : 'italic' }}>{ticket.assignee || 'Não atribuído'}</span></td>
      <td style={tdStyle}><span style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)' }}>{fmtDate(ticket.createdAt)}</span></td>
    </tr>
  )
}
