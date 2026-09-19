import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Se já existe sessão salva, pula direto pro dashboard — ninguém vê essa
// tela de novo depois do primeiro login (equivalente ao index.tsx do Expo).
export function Entry() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) return null

  if (user) return <Navigate to="/" replace />

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#0d1117',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#8b949e', letterSpacing: '0.05em' }}>
        CENTRAL DE CHAMADOS
      </div>
      <h1 style={{ fontSize: 22, color: '#e6edf3', margin: 0 }}>Como você quer entrar?</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/login/cliente')} style={choiceBtn('#79c0ff')}>
          Sou Cliente
        </button>
        <button onClick={() => navigate('/login/atendente')} style={choiceBtn('#f0a84a')}>
          Sou Atendente
        </button>
      </div>
    </div>
  )
}

function choiceBtn(accent: string): React.CSSProperties {
  return {
    padding: '12px 24px',
    borderRadius: 6,
    border: `1px solid ${accent}`,
    background: 'transparent',
    color: accent,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  }
}
