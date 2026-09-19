import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoginForm } from './LoginForm'

export function LoginCliente() {
  const { signInAsClient } = useAuth()
  const navigate = useNavigate()

  return (
    <LoginForm
      title="Acesso do Cliente"
      subtitle="Entre para abrir e acompanhar seus chamados"
      accent="#79c0ff"
      onSubmit={async (email, password) => {
        await signInAsClient(email, password)
        navigate('/', { replace: true })
      }}
      switchLabel="Sou atendente →"
      onSwitch={() => navigate('/login/atendente')}
      extraLinkLabel="Ainda não tenho conta — criar agora"
      onExtraLink={() => navigate('/cadastro/cliente')}
    />
  )
}
