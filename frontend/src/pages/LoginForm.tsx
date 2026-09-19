import { useState, type FormEvent } from 'react'
import { ApiError } from '../services/api'

interface LoginFormProps {
  title: string
  subtitle: string
  accent: string
  onSubmit: (email: string, password: string) => Promise<void>
  switchLabel: string
  onSwitch: () => void
  extraLinkLabel?: string
  onExtraLink?: () => void
}

// Formulário reutilizado pelas telas de cliente e atendente — só muda
// título, cor de destaque e qual função de login é chamada.
export function LoginForm({ title, subtitle, accent, onSubmit, switchLabel, onSwitch, extraLinkLabel, onExtraLink }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 340,
          maxWidth: '90vw',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 8,
          padding: 28,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: accent, letterSpacing: '0.05em', marginBottom: 4 }}>
            CENTRAL DE CHAMADOS
          </div>
          <h1 style={{ fontSize: 20, color: '#e6edf3', margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#8b949e', margin: '4px 0 0' }}>{subtitle}</p>
        </div>

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>E-mail</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 12, color: '#8b949e', margin: '14px 0 6px' }}>Senha</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />

        {error && (
          <div
            style={{
              marginTop: 14,
              padding: '8px 10px',
              borderRadius: 4,
              background: '#2d1212',
              border: '1px solid #da3633',
              color: '#ff7b72',
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 18,
            padding: '10px 0',
            borderRadius: 4,
            border: 'none',
            background: loading ? '#30363d' : accent,
            color: '#0d1117',
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={onSwitch}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '8px 0',
            borderRadius: 4,
            border: '1px solid #30363d',
            background: 'transparent',
            color: '#8b949e',
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          {switchLabel}
        </button>

        {extraLinkLabel && onExtraLink && (
          <button
            type="button"
            onClick={onExtraLink}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '8px 0',
              borderRadius: 4,
              border: 'none',
              background: 'transparent',
              color: accent,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            {extraLinkLabel}
          </button>
        )}
      </form>
    </div>
  )
}

export const inputStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: 4,
  color: '#e6edf3',
  padding: '8px 12px',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}
