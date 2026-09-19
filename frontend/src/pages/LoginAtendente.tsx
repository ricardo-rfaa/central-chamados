import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoginForm } from './LoginForm'

export function LoginAtendente() {
  const { signInAsAgent } = useAuth()
  const navigate = useNavigate()

  return (
    <LoginForm
      title="Acesso do Atendente"
      subtitle="Entre para gerenciar a fila de chamados"
      accent="#f0a84a"
      onSubmit={async (email, password) => {
        await signInAsAgent(email, password)
        navigate('/', { replace: true })
      }}
      switchLabel="Sou cliente →"
      onSwitch={() => navigate('/login/cliente')}
    />
  )
}
