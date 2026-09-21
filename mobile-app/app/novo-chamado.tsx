import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import type { Category } from '../src/types/ticket'
import { CATEGORY_LABELS } from '../src/types/ticket'
import { useAuth } from '../src/context/AuthContext'
import { ApiError } from '../src/services/api'
import { createTicket } from '../src/services/ticketService'
import { colors } from '../src/theme/colors'

const categories = Object.entries(CATEGORY_LABELS) as [Category, string][]

// Rota apresentada como modal (ver app/_layout.tsx: presentation: 'modal'
// nessa tela). O <select> HTML não existe em RN — vira uma linha de
// chips, já que são só 5 opções fixas conhecidas de antemão.
export default function NovoChamado() {
  const { token } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('software')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!token || !title.trim() || !description.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createTicket(token, { title, description, category })
      router.back()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível abrir o chamado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>NOVO CHAMADO</Text>
            <Text style={styles.title}>Registrar Ocorrência</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Título do problema</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Descreva brevemente o problema"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Descrição detalhada</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Forneça detalhes sobre o problema..."
          placeholderTextColor={colors.textFaint}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Categoria</Text>
        <View style={styles.categoryRow}>
          {categories.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setCategory(key)}
              style={[styles.categoryChip, category === key && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryChipText, category === key && styles.categoryChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Após o envio, o chamado será triado e encaminhado automaticamente para a equipe responsável.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !title.trim() || !description.trim()}
            style={[styles.submitButton, (loading || !title.trim() || !description.trim()) && styles.submitButtonDisabled]}
          >
            {loading ? <ActivityIndicator color={colors.accentText} /> : <Text style={styles.submitButtonText}>Abrir Chamado</Text>}
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
  label: { fontSize: 11, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 4, color: colors.text, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  categoryChipActive: { borderColor: colors.accent, backgroundColor: '#2d2200' },
  categoryChipText: { fontSize: 13, color: colors.textMuted },
  categoryChipTextActive: { color: colors.accent, fontWeight: '600' },
  infoBox: { marginTop: 16, padding: 12, backgroundColor: colors.surface, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  infoText: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  errorBox: { marginTop: 14, padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  buttonRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 24 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  cancelButtonText: { color: colors.textMuted, fontSize: 13 },
  submitButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 4, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', minWidth: 130 },
  submitButtonDisabled: { backgroundColor: colors.border },
  submitButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 13 },
})
