import { View, Text, StyleSheet } from 'react-native'
import type { Priority, Status } from '../types/ticket'
import { PRIORITY_LABELS, STATUS_LABELS } from '../types/ticket'
import { priorityColors, statusColors } from '../theme/colors'

export function Badge({ label, backgroundColor, textColor, borderColor }: {
  label: string
  backgroundColor: string
  textColor: string
  borderColor?: string
}) {
  return (
    <View style={[styles.badge, { backgroundColor, borderColor: borderColor ?? backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  )
}

export function PriorityBadge({ p }: { p: Priority }) {
  const c = priorityColors[p]
  return <Badge label={PRIORITY_LABELS[p]} backgroundColor={c.bg} textColor={c.text} borderColor={c.border} />
}

export function StatusBadge({ s }: { s: Status }) {
  const c = statusColors[s]
  return (
    <View style={[styles.badge, styles.statusBadge, { backgroundColor: c.bg, borderColor: c.dot }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.badgeText, { color: c.text }]}>{STATUS_LABELS[s]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
})
