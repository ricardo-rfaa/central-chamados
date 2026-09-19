import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { inputStyle } from './LoginForm'

// Cadastro aberto: qualquer pessoa cria a própria conta de cliente.
// Ao contrário do atendente (ver CadastroAtendente.tsx), não exige
// estar logado — é o equivalente a "criar conta" em qualquer site.
export function CadastroCliente() {
  const { signUpAsClient } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUpAsClient(name, email, password, department)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', fontFamily: 'var(--font-sans)' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, maxWidth: '90vw', background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#79c0ff', letterSpacing: '0.05em', marginBottom: 4 }}>
            CENTRAL DE CHAMADOS
          </div>
          <h1 style={{ fontSize: 20, color: '#e6edf3', margin: 0 }}>Criar Conta de Cliente</h1>
          <p style={{ fontSize: 13, color: '#8b949e', margin: '4px 0 0' }}>Cadastre-se para abrir e acompanhar chamados</p>
        </div>

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>Nome completo</label>
        <input required autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" style={inputStyle} />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>E-mail</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>Departamento</label>
        <input required value={department} onChange={e => setDepartment(e.target.value)} placeholder="Ex: Financeiro" style={inputStyle} />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>Senha</label>
        <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} />

        {error && (
          <div style={{ marginTop: 14, padding: '8px 10px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 18, padding: '10px 0', borderRadius: 4, border: 'none', background: loading ? '#30363d' : '#79c0ff', color: '#0d1117', fontWeight: 600, fontSize: 14, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <button type="button" onClick={() => navigate('/login/cliente')} style={{ width: '100%', marginTop: 10, padding: '8px 0', borderRadius: 4, border: '1px solid #30363d', background: 'transparent', color: '#8b949e', fontSize: 12.5, cursor: 'pointer' }}>
          Já tenho conta →
        </button>
      </form>
    </div>
  )
}
