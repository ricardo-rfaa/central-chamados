import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { ApiError } from '../src/services/api'
import { colors } from '../src/theme/colors'

// Só chega aqui quem já é atendente (o botão que leva pra esta tela só
// aparece pra esse role — ver TopBar). O backend confere de novo com o
// token, então mesmo que alguém force a navegação sem ser atendente, o
// cadastro é rejeitado no servidor.
export default function CadastroAtendente() {
  const { signUpAgent } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await signUpAgent(name, email, password)
      setSuccess(true)
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível cadastrar o atendente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>NOVO ATENDENTE</Text>
            <Text style={styles.title}>Cadastrar Atendente</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nome completo</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nome do novo atendente" placeholderTextColor={colors.textFaint} autoFocus style={styles.input} />

        <Text style={[styles.label, { marginTop: 14 }]}>E-mail</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="atendente@empresa.com" placeholderTextColor={colors.textFaint} autoCapitalize="none" keyboardType="email-address" style={styles.input} />

        <Text style={[styles.label, { marginTop: 14 }]}>Senha provisória</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textFaint} secureTextEntry style={styles.input} />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Atendente cadastrado com sucesso. Você pode cadastrar outro ou voltar.</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Fechar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[styles.submitButton, loading && styles.submitButtonDisabled]}>
            {loading ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.submitButtonText}>Cadastrar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  eyebrow: { fontSize: 11, color: colors.textFaint, marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  closeButton: { padding: 4 },
  closeButtonText: { color: colors.textFaint, fontSize: 24, lineHeight: 24 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 4, color: colors.text, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14 },
  errorBox: { marginTop: 14, padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  successBox: { marginTop: 14, padding: 10, borderRadius: 4, backgroundColor: '#0d2818', borderWidth: 1, borderColor: colors.success },
  successText: { color: colors.successText, fontSize: 12.5 },
  buttonRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 24 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  cancelButtonText: { color: colors.textMuted, fontSize: 13 },
  submitButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 4, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', minWidth: 110 },
  submitButtonDisabled: { backgroundColor: colors.border },
  submitButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 13 },
})
