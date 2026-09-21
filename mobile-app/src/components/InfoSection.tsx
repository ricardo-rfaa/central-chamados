import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  )
}

export function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, accent && { color: colors.accent }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  rowLabel: { fontSize: 12, color: colors.textFaint, flexShrink: 0 },
  rowValue: { fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
})
