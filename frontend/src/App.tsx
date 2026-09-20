import { useState, useEffect } from 'react'
import type { Ticket, Priority, Status } from './data'
import { PRIORITY_LABELS } from './data'
import { useAuth } from './context/AuthContext'
import { ApiError } from './services/api'
import { listTickets } from './services/ticketService'
import { useIsMobile } from './hooks/useIsMobile'
import { inputStyle } from './lib/styles'
import { NewTicketForm } from './components/NewTicketForm'
import { RegisterAgentModal } from './pages/RegisterAgentModal'
import { TicketDetail } from './components/TicketDetail'
import { TicketRow } from './components/TicketRow'
import { TicketCard } from './components/TicketCard'
import { StatCard } from './components/StatCard'
import { TopBar } from './components/TopBar'

type View = 'dashboard' | 'detail'
type FilterStatus = Status | 'todos'

export default function App() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showRegisterAgent, setShowRegisterAgent] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos')
  const [filterPriority, setFilterPriority] = useState<Priority | 'todas'>('todas')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    listTickets(token)
      .then(data => { if (!cancelled) { setTickets(data); setLoadError(null) } })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Não foi possível carregar os chamados.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  function updateTicket(t: Ticket) {
    setTickets(ts => ts.map(x => x.id === t.id ? t : x))
    setSelected(t)
  }

  function addTicket(t: Ticket) {
    setTickets(ts => [t, ...ts])
    setShowForm(false)
  }

  function openTicket(t: Ticket) {
    setSelected(t)
    setView('detail')
  }

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'todos' && t.status !== filterStatus) return false
    if (filterPriority !== 'todas' && t.priority !== filterPriority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.requester.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const isMobile = useIsMobile()
  const urgent = tickets.filter(t => t.priority === 'urgente' && t.status !== 'fechado').length
  const open = tickets.filter(t => t.status === 'novo').length
  const inProgress = tickets.filter(t => t.status === 'em_atendimento').length
  const resolved = tickets.filter(t => ['resolvido', 'fechado'].includes(t.status)).length

  const statusFilters: { key: FilterStatus; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'novo', label: 'Novos' },
    { key: 'em_atendimento', label: 'Em Atendimento' },
    { key: 'resolvido', label: 'Resolvidos' },
    { key: 'fechado', label: 'Fechados' },
  ]

  if (view === 'detail' && selected) {
    const fresh = tickets.find(t => t.id === selected.id) || selected
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
        <TopBar onNew={() => setShowForm(true)} onHome={() => setView('dashboard')} onNewAgent={() => setShowRegisterAgent(true)} />
        <div style={{ flex: 1, overflow: isMobile ? 'auto' : 'hidden' }}>
          <TicketDetail ticket={fresh} onBack={() => setView('dashboard')} onUpdate={updateTicket} />
        </div>
        {showForm && <NewTicketForm onClose={() => setShowForm(false)} onCreated={addTicket} />}
        {showRegisterAgent && <RegisterAgentModal onClose={() => setShowRegisterAgent(false)} />}
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      <TopBar onNew={() => setShowForm(true)} onHome={() => setView('dashboard')} onNewAgent={() => setShowRegisterAgent(true)} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <div style={{ padding: isMobile ? '16px 14px' : '16px 24px', color: '#8b949e', fontSize: 13 }}>Carregando chamados...</div>
        )}
        {loadError && (
          <div style={{ margin: isMobile ? '16px 14px 0' : '16px 24px 0', padding: '10px 14px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
            {loadError}
          </div>
        )}
        {/* stats */}
        <div style={{ padding: isMobile ? '16px 14px 0' : '24px 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 16 : 24 }}>
            <StatCard label="Urgentes" value={urgent} sub="Atenção imediata" accent={urgent > 0 ? '#ff7b72' : undefined} />
            <StatCard label="Abertos" value={open} sub="Aguard. atribuição" />
            <StatCard label="Atendimento" value={inProgress} sub="Com técnico" accent="#d29922" />
            <StatCard label="Resolvidos" value={resolved} sub="Encerrados" accent="#3fb950" />
          </div>
        </div>

        {/* filters */}
        <div style={{ padding: isMobile ? '0 14px 12px' : '0 24px 16px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 12, alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar chamado, ID ou solicitante..." style={{ ...inputStyle, width: isMobile ? '100%' : 280 }} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {statusFilters.map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{ padding: isMobile ? '6px 10px' : '5px 12px', borderRadius: 3, fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', border: `1px solid ${filterStatus === f.key ? '#f0a84a' : '#30363d'}`, background: filterStatus === f.key ? '#2d2200' : 'transparent', color: filterStatus === f.key ? '#f0a84a' : '#8b949e', transition: 'all 0.1s' }}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | 'todas')} style={{ ...inputStyle, width: isMobile ? '100%' : 120 }}>
            <option value="todas">Prioridade</option>
            {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* list */}
        <div style={{ padding: isMobile ? '0 14px 24px' : '0 24px 24px' }}>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.length === 0 && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#6e7681', fontSize: 13 }}>Nenhum chamado encontrado</div>
              )}
              {filtered.map(t => <TicketCard key={t.id} ticket={t} onClick={() => openTicket(t)} />)}
            </div>
          ) : (
            <div style={{ border: '1px solid #30363d', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#161b22' }}>
                    {['ID', 'Título', 'Categoria', 'Prioridade', 'Status', 'Equipe', 'Técnico', 'Criado'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#6e7681', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #30363d', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#6e7681', fontSize: 13 }}>Nenhum chamado encontrado</td></tr>
                  )}
                  {filtered.map(t => <TicketRow key={t.id} ticket={t} onClick={() => openTicket(t)} />)}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)' }}>
            {filtered.length} chamado{filtered.length !== 1 ? 's' : ''} exibido{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {showForm && <NewTicketForm onClose={() => setShowForm(false)} onCreated={addTicket} />}
      {showRegisterAgent && <RegisterAgentModal onClose={() => setShowRegisterAgent(false)} />}
    </div>
  )
}
