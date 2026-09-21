import { useState, useEffect, useCallback } from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import type { Ticket } from '../../src/types/ticket'
import { useAuth } from '../../src/context/AuthContext'
import { ApiError } from '../../src/services/api'
import { getTicket } from '../../src/services/ticketService'
import { colors } from '../../src/theme/colors'
import { TicketDetail } from '../../src/components/TicketDetail'

// Rota dinâmica: /ticket/CHM-1234 vira { id: 'CHM-1234' } aqui. Diferente
// da versão web (que já tinha o ticket em memória, vindo da lista do
// dashboard), aqui buscamos direto da API pelo ID — mais simples e
// garante que os dados estão sempre atualizados ao entrar na tela.
export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { token } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!token || !id) return
    setLoading(true)
    getTicket(token, id)
      .then(setTicket)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o chamado.'))
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    )
  }

  if (error || !ticket) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Chamado não encontrado.'}</Text>
      </View>
    )
  }

  return <TicketDetail ticket={ticket} onUpdate={setTicket} />
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
  errorText: { color: colors.dangerText, fontSize: 13, textAlign: 'center' },
})
