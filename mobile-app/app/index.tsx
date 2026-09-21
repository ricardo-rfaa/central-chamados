import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { colors } from '../src/theme/colors'
import { Dashboard } from '../src/components/Dashboard'

// Equivalente ao ProtectedRoute da versão web: sem sessão, manda pro
// entry; com sessão, mostra o dashboard (cliente ou atendente, decidido
// dentro do próprio Dashboard pelo role).
export default function Index() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    )
  }

  if (!user) return <Redirect href="/entry" />

  return <Dashboard />
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
})
