import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { inputStyle } from './LoginForm'

// Só abre a partir de um botão que já só aparece pra quem é atendente
// (ver TopBar em App.tsx) — e o backend confere de novo com o token,
// então mesmo que alguém force a abertura desse modal sem ser atendente,
// o cadastro é rejeitado no servidor.
export function RegisterAgentModal({ onClose }: { onClose: () => void }) {
  const { signUpAgent } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUpAgent(name, email, password)
      setSuccess(true)
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o atendente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>NOVO ATENDENTE</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e6edf3' }}>Cadastrar Atendente</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>Nome completo</label>
        <input required autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nome do novo atendente" style={inputStyle} />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>E-mail</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="atendente@empresa.com" style={inputStyle} />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>Senha provisória</label>
        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />

        {error && (
          <div style={{ marginTop: 14, padding: '8px 10px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginTop: 14, padding: '8px 10px', borderRadius: 4, background: '#0d2818', border: '1px solid #238636', color: '#3fb950', fontSize: 12.5 }}>
            Atendente cadastrado com sucesso. Você pode cadastrar outro ou fechar esta janela.
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}>Fechar</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 18px', borderRadius: 4, fontSize: 13, cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', background: loading ? '#30363d' : '#f0a84a', color: '#0d1117', fontWeight: 600, border: 'none' }}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
