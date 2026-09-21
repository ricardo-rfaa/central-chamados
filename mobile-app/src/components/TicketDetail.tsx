import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import type { Ticket } from '../types/ticket'
import { CATEGORY_LABELS } from '../types/ticket'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { sendMessage, updateStatus as updateStatusApi, confirmClosure as confirmClosureApi, rateTicket } from '../services/ticketService'
import { fmtDate } from '../lib/ticketFormatting'
import { colors } from '../theme/colors'
import { StatusBadge, PriorityBadge } from './Badge'
import { InfoSection, InfoRow } from './InfoSection'
import { LifecycleTrack } from './LifecycleTrack'

// Portado de components/TicketDetail.tsx da versão web. Em RN não existe
// "desktop com sidebar ao lado" — este app é mobile-only, então a versão
// aqui é sempre a "gaveta" (collapse/expand), que já era o comportamento
// mobile da versão web.
export function TicketDetail({ ticket, onUpdate }: { ticket: Ticket; onUpdate: (t: Ticket) => void }) {
  const router = useRouter()
  const { token, user } = useAuth()
  const isAgent = user?.role === 'agent'
  const [msg, setMsg] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [showRating, setShowRating] = useState(ticket.status === 'fechado' && !ticket.rating)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<Ticket>) {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      const updated = await action()
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível concluir a ação.')
    } finally {
      setBusy(false)
    }
  }

  function sendMsg() {
    if (!msg.trim() || !token) return
    const text = msg
    setMsg('')
    run(() => sendMessage(token, ticket.id, text))
  }

  function assumeTicket() {
    run(() => updateStatusApi(token!, ticket.id, 'em_atendimento'))
  }

  function resolveTicket() {
    run(() => updateStatusApi(token!, ticket.id, 'resolvido'))
  }

  // RF10: o cliente confirma que o problema foi resolvido, e só então o
  // chamado é fechado — ação separada de avaliar (RF11).
  function confirmClosure() {
    run(() => confirmClosureApi(token!, ticket.id)).then(() => setShowRating(true))
  }

  function submitRating() {
    if (!rating || !token) return
    run(() => rateTicket(token, ticket.id, rating, ratingComment)).then(() => setShowRating(false))
  }

  const showMessageInput = ticket.status !== 'fechado' && ticket.status !== 'resolvido'
  const showActionsSection = isAgent || (!isAgent && (ticket.status === 'resolvido' || (ticket.status === 'fechado' && !ticket.rating)))

  return (
    <View style={styles.screen}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
          <Text style={styles.ticketTitle} numberOfLines={2}>{ticket.title}</Text>
        </View>
        <View style={styles.headerBadges}>
          <StatusBadge s={ticket.status} />
          <PriorityBadge p={ticket.priority} />
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={ticket.messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.messagesContent}
        renderItem={({ item: m }) => (
          <View style={[styles.messageWrap, m.from === 'tecnico' ? styles.messageWrapLeft : styles.messageWrapRight]}>
            <View style={[styles.messageBubble, m.from === 'tecnico' ? styles.bubbleTecnico : styles.bubbleUsuario]}>
              <Text style={styles.messageMeta}>
                {m.from === 'tecnico' ? (ticket.assignee || 'Técnico') : ticket.requester} · {m.time}
              </Text>
              <Text style={styles.messageText}>{m.text}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.descriptionBox}>
            <Text style={styles.sectionLabel}>Descrição</Text>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              Comunicação — {ticket.messages.length} mensagem{ticket.messages.length !== 1 ? 's' : ''}
            </Text>
            {ticket.messages.length === 0 && (
              <Text style={styles.emptyMessages}>Nenhuma mensagem ainda.</Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View>
            {/* rating block */}
            {!isAgent && showRating && (
              <View style={styles.ratingBox}>
                <Text style={styles.sectionLabel}>Avaliar Atendimento</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setRating(s)}
                      style={[styles.starButton, rating >= s && styles.starButtonActive]}
                    >
                      <Text style={[styles.starText, rating >= s && styles.starTextActive]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  placeholder="Comentário opcional..."
                  placeholderTextColor={colors.textFaint}
                  multiline
                  numberOfLines={2}
                  style={styles.ratingInput}
                />
                <TouchableOpacity onPress={submitRating} disabled={busy} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Enviar Avaliação</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* details toggle (gaveta) */}
            <TouchableOpacity onPress={() => setDetailsOpen(o => !o)} style={styles.detailsToggle}>
              <Text style={styles.detailsToggleText}>Detalhes</Text>
              <Text style={styles.detailsToggleIcon}>{detailsOpen ? '▾' : '▸'}</Text>
            </TouchableOpacity>

            {detailsOpen && (
              <View style={styles.detailsContent}>
                <InfoSection label="Informações">
                  <InfoRow label="Solicitante" value={ticket.requester} />
                  <InfoRow label="Departamento" value={ticket.department} />
                  <InfoRow label="Categoria" value={CATEGORY_LABELS[ticket.category]} />
                  <InfoRow label="Equipe" value={ticket.team} />
                  <InfoRow label="Técnico" value={ticket.assignee || '—'} />
                  <InfoRow label="SLA" value={ticket.sla} accent />
                  <InfoRow label="Criado" value={fmtDate(ticket.createdAt)} />
                  <InfoRow label="Atualizado" value={fmtDate(ticket.updatedAt)} />
                </InfoSection>

                {showActionsSection && (
                  <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionLabel}>Ações</Text>
                    <View style={{ gap: 8 }}>
                      {isAgent && ticket.status === 'novo' && (
                        <TouchableOpacity onPress={assumeTicket} disabled={busy} style={styles.actionButtonPrimary}>
                          <Text style={styles.actionButtonPrimaryText}>↳ Assumir Chamado</Text>
                        </TouchableOpacity>
                      )}
                      {isAgent && ticket.status === 'em_atendimento' && (
                        <TouchableOpacity onPress={resolveTicket} disabled={busy} style={styles.actionButtonSuccess}>
                          <Text style={styles.actionButtonSuccessText}>✓ Marcar como Resolvido</Text>
                        </TouchableOpacity>
                      )}
                      {/* RF10 */}
                      {!isAgent && ticket.status === 'resolvido' && (
                        <TouchableOpacity onPress={confirmClosure} disabled={busy} style={styles.actionButtonSuccess}>
                          <Text style={styles.actionButtonSuccessText}>✓ Confirmar Resolução e Fechar</Text>
                        </TouchableOpacity>
                      )}
                      {/* RF11 */}
                      {!isAgent && ticket.status === 'fechado' && !ticket.rating && (
                        <TouchableOpacity onPress={() => setShowRating(true)} style={styles.actionButtonInfo}>
                          <Text style={styles.actionButtonInfoText}>★ Avaliar Atendimento</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {ticket.rating && (
                  <View style={styles.ratingDisplay}>
                    <Text style={styles.sectionLabel}>Avaliação</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Text key={s} style={[styles.starDisplay, s <= ticket.rating!.score && { color: colors.accent }]}>★</Text>
                      ))}
                    </View>
                    {ticket.rating.comment && <Text style={styles.ratingComment}>"{ticket.rating.comment}"</Text>}
                  </View>
                )}

                <View style={{ marginTop: 24 }}>
                  <Text style={styles.sectionLabel}>Ciclo de Vida</Text>
                  <LifecycleTrack status={ticket.status} />
                </View>
              </View>
            )}
          </View>
        }
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showMessageInput && (
        <View style={styles.messageInputRow}>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor={colors.textFaint}
            style={styles.messageInput}
            editable={!busy}
          />
          <TouchableOpacity onPress={sendMsg} disabled={busy} style={styles.sendButton}>
            {busy ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={styles.sendButtonText}>Enviar</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, flexWrap: 'wrap' },
  backButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10 },
  backButtonText: { color: colors.textMuted, fontSize: 12 },
  ticketId: { fontSize: 11, color: colors.accent },
  ticketTitle: { fontWeight: '600', fontSize: 14, color: colors.text, lineHeight: 19 },
  headerBadges: { flexDirection: 'row', gap: 6 },
  messagesContent: { padding: 14 },
  descriptionBox: { paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  sectionLabel: { fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  descriptionText: { color: colors.textSecondary, lineHeight: 20, fontSize: 13 },
  emptyMessages: { color: colors.textFaint, fontSize: 13, fontStyle: 'italic' },
  messageWrap: { marginBottom: 12 },
  messageWrapLeft: { alignItems: 'flex-start' },
  messageWrapRight: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', borderRadius: 6, padding: 10, borderWidth: 1 },
  bubbleTecnico: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  bubbleUsuario: { backgroundColor: '#1a2d1a', borderColor: colors.success },
  messageMeta: { fontSize: 10, color: colors.textFaint, marginBottom: 4 },
  messageText: { color: colors.text, fontSize: 13, lineHeight: 18 },
  ratingBox: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, borderRadius: 6, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  starButton: { width: 36, height: 36, borderRadius: 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  starButtonActive: { borderColor: colors.accent, backgroundColor: '#2d2200' },
  starText: { fontSize: 16, color: colors.textFaint },
  starTextActive: { color: colors.accent },
  ratingInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 4, color: colors.text, padding: 10, fontSize: 13, marginBottom: 10, minHeight: 50, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: colors.accent, paddingVertical: 10, borderRadius: 4, alignItems: 'center' },
  primaryButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 12 },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 6, paddingVertical: 12, paddingHorizontal: 14 },
  detailsToggleText: { color: colors.text, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailsToggleIcon: { color: colors.text },
  detailsContent: { padding: 14, backgroundColor: colors.surface, borderRadius: 6, marginTop: 8 },
  actionButtonPrimary: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 4 },
  actionButtonPrimaryText: { color: colors.accentText, fontWeight: '600', fontSize: 12 },
  actionButtonSuccess: { backgroundColor: colors.success, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 4 },
  actionButtonSuccessText: { color: '#fff', fontSize: 12 },
  actionButtonInfo: { backgroundColor: colors.info, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 4 },
  actionButtonInfoText: { color: '#fff', fontSize: 12 },
  ratingDisplay: { marginTop: 24, padding: 16, backgroundColor: colors.background, borderRadius: 4, borderWidth: 1, borderColor: colors.border },
  starDisplay: { fontSize: 14, color: colors.border, marginRight: 2 },
  ratingComment: { fontSize: 12, color: colors.textMuted, lineHeight: 18, fontStyle: 'italic', marginTop: 8 },
  errorBox: { margin: 14, padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
  messageInputRow: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: colors.border },
  messageInput: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 4, color: colors.text, paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
  sendButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  sendButtonText: { color: colors.text, fontSize: 12 },
})
