import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme/colors'

// Sempre em layout "mobile" agora — não existe mais o ternário isMobile
// da versão web, porque este app roda só em celular. useSafeAreaInsets
// é o equivalente RN ao env(safe-area-inset-top) do CSS.
export function TopBar({ onNewTicket, onNewAgent }: { onNewTicket: () => void; onNewAgent: () => void }) {
  const insets = useSafeAreaInsets()
  const { user, signOut } = useAuth()

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>⊕</Text>
        </View>
        <Text style={styles.logoText}>ChamadosMGR</Text>
        <View style={{ flex: 1 }} />
        {user?.role !== 'agent' ? (
          <TouchableOpacity onPress={onNewTicket} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>+ Chamado</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onNewAgent} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>+ Atend.</Text>
          </TouchableOpacity>
        )}
        {user && (
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sair</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', rowGap: 8 },
  logoBox: { width: 26, height: 26, backgroundColor: colors.accent, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 13 },
  logoText: { fontWeight: '700', fontSize: 13, color: colors.text },
  primaryButton: { backgroundColor: colors.accent, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  primaryButtonText: { color: colors.accentText, fontWeight: '600', fontSize: 11 },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  secondaryButtonText: { color: colors.textMuted, fontSize: 11 },
  signOutButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8, marginLeft: 8 },
  signOutText: { color: colors.textMuted, fontSize: 11 },
})
