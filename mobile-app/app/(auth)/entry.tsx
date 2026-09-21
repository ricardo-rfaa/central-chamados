import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { colors } from '../../src/theme/colors'

// Se já existe sessão salva, pula direto pro dashboard — ninguém vê essa
// tela de novo depois do primeiro login.
export default function Entry() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    )
  }

  if (user) return <Redirect href="/" />

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>CENTRAL DE CHAMADOS</Text>
      <Text style={styles.title}>Como você quer entrar?</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => router.push('/login-cliente')} style={[styles.choiceBtn, { borderColor: '#79c0ff' }]}>
          <Text style={[styles.choiceText, { color: '#79c0ff' }]}>Sou Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/login-atendente')} style={[styles.choiceBtn, { borderColor: colors.accent }]}>
          <Text style={[styles.choiceText, { color: colors.accent }]}>Sou Atendente</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background, paddingHorizontal: 24 },
  eyebrow: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  title: { fontSize: 22, color: colors.text, fontWeight: '600', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  choiceBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, borderWidth: 1 },
  choiceText: { fontSize: 14, fontWeight: '600' },
})
