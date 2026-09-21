import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { ApiError } from '../services/api'
import { colors } from '../theme/colors'

interface LoginFormProps {
  title: string
  subtitle: string
  accent: string
  onSubmit: (email: string, password: string) => Promise<void>
  switchLabel: string
  onSwitch: () => void
  extraLinkLabel?: string
  onExtraLink?: () => void
}

// Formulário reutilizado pelas telas de cliente e atendente — mesma
// lógica da versão web (src/pages/LoginForm.tsx), só trocando <form>/
// <input> por View/TextInput. KeyboardAvoidingView é o equivalente RN
// para o teclado não cobrir os campos — não existe problema análogo na web.
export function LoginForm({ title, subtitle, accent, onSubmit, switchLabel, onSwitch, extraLinkLabel, onExtraLink }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: accent }]}>CENTRAL DE CHAMADOS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoFocus
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Senha</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textFaint}
          secureTextEntry
          style={styles.input}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.primaryButton, { backgroundColor: loading ? colors.border : accent }]}
        >
          {loading ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onSwitch} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{switchLabel}</Text>
        </TouchableOpacity>

        {extraLinkLabel && onExtraLink && (
          <TouchableOpacity onPress={onExtraLink} style={styles.linkButton}>
            <Text style={[styles.linkButtonText, { color: accent }]}>{extraLinkLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 28,
  },
  header: { marginBottom: 20 },
  eyebrow: { fontSize: 11, letterSpacing: 0.5, marginBottom: 4, fontWeight: '500' },
  title: { fontSize: 20, color: colors.text, fontWeight: '600' },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  label: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    color: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 4,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  primaryButton: {
    width: '100%',
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 14 },
  secondaryButton: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.textMuted, fontSize: 12.5 },
  linkButton: { width: '100%', marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  linkButtonText: { fontSize: 12.5 },
})
