import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { LoginForm } from '../../src/components/LoginForm'

export default function LoginCliente() {
  const { signInAsClient } = useAuth()
  const router = useRouter()

  return (
    <LoginForm
      title="Acesso do Cliente"
      subtitle="Entre para abrir e acompanhar seus chamados"
      accent="#79c0ff"
      onSubmit={async (email, password) => {
        await signInAsClient(email, password)
        router.replace('/')
      }}
      switchLabel="Sou atendente →"
      onSwitch={() => router.push('/login-atendente')}
      extraLinkLabel="Ainda não tenho conta — criar agora"
      onExtraLink={() => router.push('/cadastro-cliente')}
    />
  )
}
