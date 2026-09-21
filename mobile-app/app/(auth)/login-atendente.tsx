import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { LoginForm } from '../../src/components/LoginForm'

export default function LoginAtendente() {
  const { signInAsAgent } = useAuth()
  const router = useRouter()

  return (
    <LoginForm
      title="Acesso do Atendente"
      subtitle="Entre para gerenciar a fila de chamados"
      accent="#f0a84a"
      onSubmit={async (email, password) => {
        await signInAsAgent(email, password)
        router.replace('/')
      }}
      switchLabel="Sou cliente →"
      onSwitch={() => router.push('/login-cliente')}
    />
  )
}
