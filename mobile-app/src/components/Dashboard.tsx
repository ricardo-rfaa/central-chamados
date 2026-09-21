import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import type { Ticket, Priority, Status } from '../types/ticket'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { listTickets } from '../services/ticketService'
import { colors } from '../theme/colors'
import { TicketCard } from './TicketCard'
import { StatCard } from './StatCard'
import { TopBar } from './TopBar'

type FilterStatus = Status | 'todos'

const statusFilters: { key: FilterStatus; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'novo', label: 'Novos' },
  { key: 'em_atendimento', label: 'Em Atendimento' },
  { key: 'resolvido', label: 'Resolvidos' },
  { key: 'fechado', label: 'Fechados' },
]

// Portado de App.tsx da versão web (dashboard único, sem separação
// cliente/atendente ainda — ponto de partida combinado para a migração).
export function Dashboard() {
  const { token } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos')
  const [filterPriority, setFilterPriority] = useState<Priority | 'todas'>('todas')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    listTickets(token)
      .then(data => { if (!cancelled) { setTickets(data); setLoadError(null) } })
      .catch(err => { if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Não foi possível carregar os chamados.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'todos' && t.status !== filterStatus) return false
    if (filterPriority !== 'todas' && t.priority !== filterPriority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.requester.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const urgent = tickets.filter(t => t.priority === 'urgente' && t.status !== 'fechado').length
  const open = tickets.filter(t => t.status === 'novo').length
  const inProgress = tickets.filter(t => t.status === 'em_atendimento').length
  const resolved = tickets.filter(t => ['resolvido', 'fechado'].includes(t.status)).length

  function openTicket(t: Ticket) {
    router.push(`/ticket/${t.id}`)
  }

  return (
    <View style={styles.screen}>
      <TopBar onNewTicket={() => router.push('/novo-chamado')} onNewAgent={() => router.push('/cadastro-atendente')} />

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TicketCard ticket={item} onPress={() => openTicket(item)} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={
          <View>
            {loading && <ActivityIndicator color={colors.textMuted} style={{ marginVertical: 16 }} />}
            {loadError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{loadError}</Text>
              </View>
            )}

            <View style={styles.statsGrid}>
              <StatCard label="Urgentes" value={urgent} sub="Atenção imediata" accent={urgent > 0 ? colors.dangerText : undefined} />
              <StatCard label="Abertos" value={open} sub="Aguard. atribuição" />
            </View>
            <View style={styles.statsGrid}>
              <StatCard label="Atendimento" value={inProgress} sub="Com técnico" accent="#d29922" />
              <StatCard label="Resolvidos" value={resolved} sub="Encerrados" accent={colors.successText} />
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar chamado, ID ou solicitante..."
              placeholderTextColor={colors.textFaint}
              style={styles.searchInput}
            />

            <FlatList
              data={statusFilters}
              horizontal
              keyExtractor={f => f.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, paddingBottom: 12 }}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  onPress={() => setFilterStatus(f.key)}
                  style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, filterStatus === f.key && styles.filterChipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Nenhum chamado encontrado</Text> : null}
        ListFooterComponent={
          filtered.length > 0 ? (
            <Text style={styles.footerText}>
              {filtered.length} chamado{filtered.length !== 1 ? 's' : ''} exibido{filtered.length !== 1 ? 's' : ''}
            </Text>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 14, paddingTop: 16 },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  errorBox: { padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger, marginBottom: 12 },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  filterChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 3, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { borderColor: colors.accent, backgroundColor: '#2d2200' },
  filterChipText: { fontSize: 11, color: colors.textMuted },
  filterChipTextActive: { color: colors.accent },
  emptyText: { textAlign: 'center', color: colors.textFaint, fontSize: 13, paddingVertical: 32 },
  footerText: { fontSize: 11, color: colors.textFaint, marginTop: 10 },
})
