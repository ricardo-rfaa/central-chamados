import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Ticket } from '../types/ticket'
import { CATEGORY_LABELS } from '../types/ticket'
import { priorityColors, colors } from '../theme/colors'
import { fmtDate } from '../lib/ticketFormatting'
import { Badge, PriorityBadge, StatusBadge } from './Badge'

export function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  const pc = priorityColors[ticket.priority]
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { borderLeftColor: pc.border }]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.id}>{ticket.id}</Text>
          <Text style={styles.title}>{ticket.title}</Text>
        </View>
        <PriorityBadge p={ticket.priority} />
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge s={ticket.status} />
        <Badge label={CATEGORY_LABELS[ticket.category]} backgroundColor={colors.surface} textColor={colors.textMuted} borderColor={colors.border} />
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.requester}>{ticket.requester}</Text>
          <Text style={styles.department}>{ticket.department}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.assignee, !ticket.assignee && styles.assigneeEmpty]}>
            {ticket.assignee || 'Não atribuído'}
          </Text>
          <Text style={styles.date}>{fmtDate(ticket.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 3,
    gap: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  id: { fontSize: 11, color: colors.accent },
  title: { fontWeight: '600', fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 19 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requester: { fontSize: 12, color: colors.textSecondary },
  department: { fontSize: 11, color: colors.textFaint },
  assignee: { fontSize: 11, color: colors.textSecondary },
  assigneeEmpty: { color: colors.textFaint, fontStyle: 'italic' },
  date: { fontSize: 10, color: colors.textFaint, marginTop: 2 },
})
