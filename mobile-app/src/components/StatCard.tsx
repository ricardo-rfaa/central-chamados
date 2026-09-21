import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 16,
  },
  label: { fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  value: { fontSize: 28, fontWeight: '700', color: colors.text },
  sub: { fontSize: 11, color: colors.textFaint, marginTop: 6 },
})
