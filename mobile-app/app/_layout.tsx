import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../src/context/AuthContext'
import { colors } from '../src/theme/colors'

// Equivalente ao main.tsx da versão web: provê o AuthProvider pra toda
// a árvore de telas. expo-router usa Stack em vez de <Routes> do
// react-router-dom — cada arquivo em app/ já é uma rota.
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Estas duas telas eram modais sobrepostos na versão web
            (position: fixed) — aqui usam a apresentação nativa "modal"
            do próprio Stack, que desliza de baixo pra cima. */}
        <Stack.Screen name="novo-chamado" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cadastro-atendente" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  )
}
