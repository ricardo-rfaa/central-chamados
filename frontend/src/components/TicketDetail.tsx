import { useState } from 'react'
import type { Ticket, Status } from '../data'
import { CATEGORY_LABELS } from '../data'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { sendMessage, updateStatus as updateStatusApi, confirmClosure as confirmClosureApi, rateTicket } from '../services/ticketService'
import { useIsMobile } from '../hooks/useIsMobile'
import { fmtDate } from '../lib/ticketFormatting'
import { inputStyle, btnStyle } from '../lib/styles'
import { StatusBadge, PriorityBadge } from './Badge'
import { InfoSection, InfoRow } from './InfoSection'

export function TicketDetail({ ticket, onBack, onUpdate }: { ticket: Ticket; onBack: () => void; onUpdate: (t: Ticket) => void }) {
  const isMobile = useIsMobile()
  const { token, user } = useAuth()
  const isAgent = user?.role === 'agent'
  const [msg, setMsg] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [showRating, setShowRating] = useState(ticket.status === 'fechado' && !ticket.rating)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // No celular a aba de detalhes começa fechada (ocupa a tela toda);
  // no desktop começa aberta, já que tem espaço sobrando ao lado.
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  async function run(action: () => Promise<Ticket>) {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível concluir a ação.')
    } finally {
      setBusy(false)
    }
  }

  function sendMsg() {
    if (!msg.trim() || !token) return
    const text = msg
    setMsg('')
    run(() => sendMessage(token, ticket.id, text))
  }

  function assumeTicket() {
    run(() => updateStatusApi(token!, ticket.id, 'em_atendimento'))
  }

  function resolveTicket() {
    run(() => updateStatusApi(token!, ticket.id, 'resolvido'))
  }

  // RF10: o cliente confirma que o problema foi resolvido, e só então o
  // chamado é fechado — ação separada de avaliar (RF11).
  function confirmClosure() {
    run(() => confirmClosureApi(token!, ticket.id)).then(() => setShowRating(true))
  }

  function submitRating() {
    if (!rating || !token) return
    run(() => rateTicket(token, ticket.id, rating, ratingComment)).then(() => setShowRating(false))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header */}
      <div style={{ padding: isMobile ? '12px 14px' : '16px 24px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 10 : 16, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', cursor: 'pointer', padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          ← Voltar
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f0a84a' }}>{ticket.id}</span>
          <div style={{ fontWeight: 600, fontSize: isMobile ? 14 : 15, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap', lineHeight: 1.4 }}>{ticket.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <StatusBadge s={ticket.status} />
          <PriorityBadge p={ticket.priority} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : sidebarOpen ? '1fr 300px' : '1fr auto', flex: 1, overflow: 'hidden', transition: 'grid-template-columns 0.15s' }}>
        {/* main */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #30363d', overflow: 'hidden' }}>
          {/* description */}
          <div style={{ padding: isMobile ? 14 : 24, borderBottom: '1px solid #21262d' }}>
            <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descrição</div>
            <p style={{ color: '#c9d1d9', lineHeight: 1.7, fontSize: 13 }}>{ticket.description}</p>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 14 : 24 }}>
            <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Comunicação — {ticket.messages.length} mensagem{ticket.messages.length !== 1 ? 's' : ''}
            </div>
            {ticket.messages.length === 0 && (
              <p style={{ color: '#6e7681', fontSize: 13, fontStyle: 'italic' }}>Nenhuma mensagem ainda.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ticket.messages.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'tecnico' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '80%', background: m.from === 'tecnico' ? '#21262d' : '#1a2d1a', border: `1px solid ${m.from === 'tecnico' ? '#30363d' : '#238636'}`, borderRadius: 6, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                      {m.from === 'tecnico' ? (ticket.assignee || 'Técnico') : ticket.requester} · {m.time}
                    </div>
                    <p style={{ color: '#e6edf3', fontSize: 13, lineHeight: 1.6 }}>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* rating block */}
          {!isAgent && showRating && (
            <div style={{ padding: 24, borderTop: '1px solid #30363d', background: '#161b22' }}>
              <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avaliar Atendimento</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{ width: 36, height: 36, borderRadius: 4, border: `1px solid ${rating >= s ? '#f0a84a' : '#30363d'}`, background: rating >= s ? '#2d2200' : 'transparent', color: rating >= s ? '#f0a84a' : '#6e7681', cursor: 'pointer', fontSize: 16 }}>★</button>
                ))}
              </div>
              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Comentário opcional..." rows={2} style={{ ...inputStyle, marginBottom: 10, resize: 'none' }} />
              <button onClick={submitRating} disabled={busy} style={{ ...btnStyle, background: '#f0a84a', color: '#0d1117', fontWeight: 600, border: 'none', fontSize: 12 }}>Enviar Avaliação</button>
            </div>
          )}

          {/* fallback de erro para quando não há input de mensagem visível (ex: chamado já fechado) */}
          {error && (ticket.status === 'fechado' || ticket.status === 'resolvido') && (
            <div style={{ margin: isMobile ? '0 14px 14px' : '0 24px 24px', padding: '8px 10px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
              {error}
            </div>
          )}

          {/* message input */}
          {ticket.status !== 'fechado' && ticket.status !== 'resolvido' && (
            <div style={{ padding: isMobile ? '12px 14px' : '16px 24px', borderTop: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {error && (
                <div style={{ padding: '8px 10px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Escreva uma mensagem..." style={{ ...inputStyle, flex: 1 }} disabled={busy} />
                <button onClick={sendMsg} disabled={busy} style={{ ...btnStyle, background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', fontSize: 12 }}>Enviar</button>
              </div>
            </div>
          )}
        </div>

        {/* sidebar */}
        {isMobile ? (
          <div style={{ borderTop: '1px solid #30363d' }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#161b22', border: 'none', color: '#e6edf3', fontSize: 12, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
            >
              <span>Detalhes</span>
              <span style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
            </button>
            {sidebarOpen && (
              <div style={{ overflowY: 'auto', padding: 14 }}>
                <TicketSidebarContent
                  ticket={ticket} isAgent={isAgent} busy={busy}
                  assumeTicket={assumeTicket} resolveTicket={resolveTicket} confirmClosure={confirmClosure} setShowRating={setShowRating}
                />
              </div>
            )}
          </div>
        ) : sidebarOpen ? (
          <div style={{ overflowY: 'auto', padding: 24 }}>
            <button
              onClick={() => setSidebarOpen(false)}
              title="Recolher detalhes"
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, background: 'none', border: 'none', color: '#6e7681', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', padding: 0 }}
            >
              ▸ Recolher
            </button>
            <TicketSidebarContent
              ticket={ticket} isAgent={isAgent} busy={busy}
              assumeTicket={assumeTicket} resolveTicket={resolveTicket} confirmClosure={confirmClosure} setShowRating={setShowRating}
            />
          </div>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            title="Expandir detalhes"
            style={{ background: '#161b22', border: 'none', borderLeft: '1px solid #30363d', color: '#6e7681', cursor: 'pointer', writingMode: 'vertical-rl', fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '16px 8px' }}
          >
            ◂ Detalhes
          </button>
        )}
      </div>
    </div>
  )
}

// Conteúdo da aba de detalhes, extraído para ser reaproveitado tanto no
// layout desktop (coluna lateral) quanto no mobile (gaveta abaixo do chat).
function TicketSidebarContent({ ticket, isAgent, busy, assumeTicket, resolveTicket, confirmClosure, setShowRating }: {
  ticket: Ticket
  isAgent: boolean
  busy: boolean
  assumeTicket: () => void
  resolveTicket: () => void
  confirmClosure: () => void
  setShowRating: (v: boolean) => void
}) {
  return (
    <>
      <InfoSection label="Detalhes">
        <InfoRow label="Solicitante" value={ticket.requester} />
        <InfoRow label="Departamento" value={ticket.department} />
        <InfoRow label="Categoria" value={CATEGORY_LABELS[ticket.category]} />
        <InfoRow label="Equipe" value={ticket.team} />
        <InfoRow label="Técnico" value={ticket.assignee || '—'} />
        <InfoRow label="SLA" value={ticket.sla} accent />
        <InfoRow label="Criado" value={fmtDate(ticket.createdAt)} />
        <InfoRow label="Atualizado" value={fmtDate(ticket.updatedAt)} />
      </InfoSection>

      {/* actions */}
      {(isAgent || (!isAgent && (ticket.status === 'resolvido' || (ticket.status === 'fechado' && !ticket.rating)))) && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ações</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isAgent && ticket.status === 'novo' && (
              <button onClick={assumeTicket} disabled={busy} style={{ ...btnStyle, background: '#f0a84a', color: '#0d1117', fontWeight: 600, border: 'none', textAlign: 'left', fontSize: 12 }}>
                ↳ Assumir Chamado
              </button>
            )}
            {isAgent && ticket.status === 'em_atendimento' && (
              <button onClick={resolveTicket} disabled={busy} style={{ ...btnStyle, background: '#238636', color: '#fff', border: 'none', textAlign: 'left', fontSize: 12 }}>
                ✓ Marcar como Resolvido
              </button>
            )}
            {/* RF10: cliente confirma que o problema foi resolvido antes do chamado fechar */}
            {!isAgent && ticket.status === 'resolvido' && (
              <button onClick={confirmClosure} disabled={busy} style={{ ...btnStyle, background: '#238636', color: '#fff', border: 'none', textAlign: 'left', fontSize: 12 }}>
                ✓ Confirmar Resolução e Fechar
              </button>
            )}
            {/* RF11: avaliação só aparece depois do chamado já fechado */}
            {!isAgent && ticket.status === 'fechado' && !ticket.rating && (
              <button onClick={() => setShowRating(true)} style={{ ...btnStyle, background: '#1f6feb', color: '#fff', border: 'none', fontSize: 12 }}>
                ★ Avaliar Atendimento
              </button>
            )}
          </div>
        </div>
      )}

      {/* rating display */}
      {ticket.rating && (
        <div style={{ marginTop: 24, padding: 16, background: '#0d1117', borderRadius: 4, border: '1px solid #30363d' }}>
          <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avaliação</div>
          <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ fontSize: 14, color: s <= ticket.rating!.score ? '#f0a84a' : '#30363d' }}>★</span>
            ))}
          </div>
          {ticket.rating.comment && <p style={{ fontSize: 12, color: '#8b949e', lineHeight: 1.5, fontStyle: 'italic' }}>"{ticket.rating.comment}"</p>}
        </div>
      )}

      {/* lifecycle */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ciclo de Vida</div>
        <LifecycleTrack status={ticket.status} />
      </div>
    </>
  )
}

function LifecycleTrack({ status }: { status: Status }) {
  const steps: { key: Status; label: string }[] = [
    { key: 'novo', label: 'Novo' },
    { key: 'em_atendimento', label: 'Atendimento' },
    { key: 'resolvido', label: 'Resolução' },
    { key: 'fechado', label: 'Fechamento' },
  ]
  const order: Record<string, number> = { novo: 0, em_atendimento: 1, resolvido: 2, fechado: 3 }
  const current = order[status] ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => {
        const done = current > i
        const active = current === i
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${done ? '#3fb950' : active ? '#f0a84a' : '#30363d'}`, background: done ? '#238636' : active ? '#2d2200' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {done && <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>✓</span>}
                {active && <span style={{ width: 6, height: 6, background: '#f0a84a', borderRadius: '50%', display: 'block' }} />}
              </div>
              {i < steps.length - 1 && <div style={{ width: 1, height: 20, background: done ? '#238636' : '#30363d', margin: '2px 0' }} />}
            </div>
            <div style={{ paddingTop: 1 }}>
              <span style={{ fontSize: 12, color: done ? '#3fb950' : active ? '#f0a84a' : '#6e7681', fontWeight: active ? 600 : 400 }}>{step.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
