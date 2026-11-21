import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet, useWindowDimensions } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../src/context/AuthContext'
import { ApiError } from '../src/services/api'
import { getIndicators, type Indicators } from '../src/services/indicatorService'
import { CATEGORY_LABELS } from '../src/types/ticket'
import { colors } from '../src/theme/colors'

// Cores das séries validadas para o fundo escuro (colors.surface): mesma
// luminosidade, distinguíveis por daltônicos e com contraste >= 3:1.
const OPENED = '#388bfd'
const CLOSED = '#bb8009'
const CHART_HEIGHT = 120

function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

// "2026-11-20" -> "20/11"
function shortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {subtitle ? <Text style={styles.panelSub}>{subtitle}</Text> : null}
      {children}
    </View>
  )
}

function DailyChart({ days }: { days: Indicators['lastDays'] }) {
  const max = Math.max(1, ...days.flatMap(d => [d.opened, d.closed]))
  const totalOpened = days.reduce((s, d) => s + d.opened, 0)
  const totalClosed = days.reduce((s, d) => s + d.closed, 0)
  return (
    <Panel title="Abertos x fechados · 7 dias" subtitle={`${plural(totalOpened, 'aberto', 'abertos')} · ${plural(totalClosed, 'fechado', 'fechados')}`}>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: OPENED }]} /><Text style={styles.legendText}>Abertos</Text></View>
        <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: CLOSED }]} /><Text style={styles.legendText}>Fechados</Text></View>
      </View>
      <View
        accessible
        accessibilityLabel={days.map(d => `${shortDate(d.date)}: ${d.opened} abertos, ${d.closed} fechados`).join('; ')}
        style={styles.chartArea}
      >
        {days.map(d => (
          <View key={d.date} style={styles.dayColumn}>
            {[{ v: d.opened, c: OPENED }, { v: d.closed, c: CLOSED }].map((s, i) => (
              <View key={i} style={[styles.dayBar, { height: s.v ? Math.max(3, (s.v / max) * (CHART_HEIGHT - 16)) : 0, backgroundColor: s.c }]} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.axisRow}>
        {days.map(d => <Text key={d.date} style={styles.axisLabel}>{shortDate(d.date)}</Text>)}
      </View>
    </Panel>
  )
}

function BarList({ rows, color = OPENED, emptyText }: { rows: { label: string; value: number }[]; color?: string; emptyText: string }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  if (rows.length === 0) return <Text style={styles.empty}>{emptyText}</Text>
  return (
    <View style={{ gap: 10 }}>
      {rows.map(r => (
        <View key={r.label} accessible accessibilityLabel={`${r.label}: ${r.value}`} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{r.label}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(r.value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.barValue}>{r.value}</Text>
        </View>
      ))}
    </View>
  )
}

export default function IndicatorsScreen() {
  const { user, token } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const twoColumns = width >= 760
  const [data, setData] = useState<Indicators | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(() => {
    if (!token) return Promise.resolve()
    return getIndicators(token)
      .then(d => { setData(d); setError(null) })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os indicadores.'))
  }, [token])

  useEffect(() => { load() }, [load])

  // Indicadores são só para atendentes; a API também bloqueia (403).
  if (user && user.role !== 'agent') return <Redirect href="/" />

  const sat = data?.satisfaction

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Indicadores</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.textMuted} onRefresh={() => { setRefreshing(true); load().finally(() => setRefreshing(false)) }} />}
      >
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
        {!data && !error && <ActivityIndicator color={colors.textMuted} style={{ marginTop: 24 }} />}

        {data && (
          <View style={[styles.grid, twoColumns && styles.gridTwo]}>
            <View style={twoColumns ? styles.cell : undefined}>
              <DailyChart days={data.lastDays} />
            </View>
            <View style={twoColumns ? styles.cell : undefined}>
              <Panel title="Em atendimento por técnico" subtitle="Carga atual de cada atendente">
                <BarList rows={data.workload.map(w => ({ label: w.name, value: w.inProgress }))} emptyText="Nenhum atendente cadastrado" />
              </Panel>
            </View>
            <View style={twoColumns ? styles.cell : undefined}>
              <Panel title="Chamados por categoria" subtitle="Todos os chamados registrados">
                <BarList rows={data.byCategory.map(c => ({ label: CATEGORY_LABELS[c.category], value: c.count }))} emptyText="Nenhum chamado registrado" />
              </Panel>
            </View>
            <View style={twoColumns ? styles.cell : undefined}>
              <Panel title="Satisfação dos clientes">
                {sat && sat.count > 0 ? (
                  <>
                    <View style={styles.heroRow}>
                      <Text style={styles.hero}>{sat.average?.toFixed(1).replace('.', ',')}</Text>
                      <Text style={styles.heroUnit}>de 5</Text>
                    </View>
                    <Text style={styles.panelSub}>{plural(sat.count, 'avaliação', 'avaliações')}</Text>
                    <BarList
                      color={CLOSED}
                      rows={(['5', '4', '3', '2', '1'] as const).map(s => ({ label: `${s}★`, value: sat.distribution[s] }))}
                      emptyText=""
                    />
                  </>
                ) : (
                  <Text style={styles.empty}>Nenhuma avaliação ainda</Text>
                )}
              </Panel>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 8 },
  backText: { color: colors.textMuted, fontSize: 11 },
  headerTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  content: { padding: 14 },
  grid: { gap: 8 },
  gridTwo: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '48.9%' },
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 4, padding: 14 },
  panelTitle: { fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  panelSub: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: colors.textMuted },
  chartArea: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: colors.border },
  dayColumn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 2 },
  dayBar: { width: '32%', maxWidth: 16, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  axisRow: { flexDirection: 'row', marginTop: 6 },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textFaint },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 110, fontSize: 12.5, color: colors.textSecondary },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 24, textAlign: 'right', fontSize: 12.5, color: colors.text },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6, marginBottom: 2 },
  hero: { fontSize: 32, fontWeight: '700', color: colors.text },
  heroUnit: { fontSize: 13, color: colors.textMuted },
  empty: { fontSize: 12, color: colors.textFaint, paddingVertical: 20, textAlign: 'center' },
  errorBox: { padding: 10, borderRadius: 4, backgroundColor: colors.dangerBg, borderWidth: 1, borderColor: colors.danger, marginBottom: 12 },
  errorText: { color: colors.dangerText, fontSize: 12.5 },
})
