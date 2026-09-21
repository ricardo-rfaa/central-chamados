import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { ApiError } from '../../src/services/api'
import { colors } from '../../src/theme/colors'

// Cadastro aberto: qualquer pessoa cria a própria conta de cliente.
// Mesma regra da versão web — não exige estar logado.
export default function CadastroCliente() {
  const { signUpAsClient } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await signUpAsClient(name, email, password, department)
      router.replace('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>CENTRAL DE CHAMADOS</Text>
            <Text style={styles.title}>Criar Conta de Cliente</Text>
            <Text style={styles.subtitle}>Cadastre-se para abrir e acompanhar chamados</Text>
          </View>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textFaint} autoFocus style={styles.input} />

          <Text style={[styles.label, { marginTop: 14 }]}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="seu@email.com" placeholderTextColor={colors.textFaint} autoCapitalize="none" keyboardType="email-address" style={styles.input} />

          <Text style={[styles.label, { marginTop: 14 }]}>Departamento</Text>
          <TextInput value={department} onChangeText={setDepartment} placeholder="Ex: Financeiro" placeholderTextColor={colors.textFaint} style={styles.input} />

          <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>
          <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textFaint} secureTextEntry style={styles.input} />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[styles.primaryButton, { backgroundColor: loading ? colors.border : '#79c0ff' }]}>
            {loading ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.primaryButtonText}>Criar Conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login-cliente')} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Já tenho conta →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 28 },
  header: { marginBottom: 20 },
  eyebrow: { fontSize: 11, color: '#79c0ff', letterSpacing: 0.5, marginBottom: 4, fontWeight: '500' },
  title: { fontSize: 20, color: colors.text, fontWeight: '600' },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 4, color: colors.text, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14 },
  errorBox: { marginTop: 14, padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  primaryButton: { width: '100%', marginTop: 18, paddingVertical: 12, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 14 },
  secondaryButton: { width: '100%', marginTop: 10, paddingVertical: 10, borderRadius: 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  secondaryButtonText: { color: colors.textMuted, fontSize: 12.5 },
})
