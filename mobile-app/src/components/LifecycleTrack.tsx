import { View, Text, StyleSheet } from 'react-native'
import type { Status } from '../types/ticket'
import { colors } from '../theme/colors'

const steps: { key: Status; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'em_atendimento', label: 'Atendimento' },
  { key: 'resolvido', label: 'Resolução' },
  { key: 'fechado', label: 'Fechamento' },
]
const order: Record<string, number> = { novo: 0, em_atendimento: 1, resolvido: 2, fechado: 3 }

export function LifecycleTrack({ status }: { status: Status }) {
  const current = order[status] ?? 0

  return (
    <View>
      {steps.map((step, i) => {
        const done = current > i
        const active = current === i
        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.dotColumn}>
              <View style={[
                styles.dot,
                { borderColor: done ? colors.successText : active ? colors.accent : colors.border },
                done && { backgroundColor: colors.success },
                active && { backgroundColor: '#2d2200' },
              ]}>
                {done && <Text style={styles.checkmark}>✓</Text>}
                {active && <View style={styles.activeDot} />}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.connector, { backgroundColor: done ? colors.success : colors.border }]} />
              )}
            </View>
            <Text style={[
              styles.label,
              done && { color: colors.successText },
              active && { color: colors.accent, fontWeight: '600' },
            ]}>
              {step.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dotColumn: { alignItems: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#fff', fontSize: 9, fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  connector: { width: 1, height: 20, marginVertical: 2 },
  label: { fontSize: 12, color: colors.textFaint, paddingTop: 1 },
})
