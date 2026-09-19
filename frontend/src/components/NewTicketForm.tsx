import { useState } from 'react'
import type { Ticket, Category } from '../data'
import { CATEGORY_LABELS } from '../data'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { createTicket } from '../services/ticketService'
import { inputStyle, btnStyle } from '../lib/styles'
import { Field } from './Field'

export function NewTicketForm({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Ticket) => void }) {
  const { token } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', category: 'software' as Category })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const ticket = await createTicket(token, form)
      onCreated(ticket)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível abrir o chamado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, width: '100%', maxWidth: 560, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>NOVO CHAMADO</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e6edf3' }}>Registrar Ocorrência</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="Título do problema">
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Descreva brevemente o problema" style={inputStyle} />
          </Field>
          <Field label="Descrição detalhada">
            <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Forneça detalhes sobre o problema..." style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Categoria">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} style={inputStyle}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 8, padding: '10px 14px', background: '#0d1117', borderRadius: 4, border: '1px solid #30363d', fontSize: 12, color: '#8b949e' }}>
          Após o envio, o chamado será triado e encaminhado automaticamente para a equipe responsável.
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: '8px 10px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="button" onClick={onClose} style={{ ...btnStyle, background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}>Cancelar</button>
          <button type="submit" disabled={loading} style={{ ...btnStyle, background: loading ? '#30363d' : '#f0a84a', color: '#0d1117', fontWeight: 600, border: 'none' }}>
            {loading ? 'Enviando...' : 'Abrir Chamado'}
          </button>
        </div>
      </form>
    </div>
  )
}
