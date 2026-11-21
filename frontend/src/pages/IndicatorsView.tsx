import { useEffect, useState } from 'react'
import type React from 'react'
import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { ApiError } from '../services/api'
import { getIndicators, type Indicators } from '../services/indicatorService'
import { CATEGORY_LABELS } from '../data'

// Cores das séries validadas para o fundo escuro (#161b22): mesma
// luminosidade, distinguíveis por daltônicos e com contraste >= 3:1.
const OPENED = '#388bfd'
const CLOSED = '#bb8009'
const SURFACE = '#161b22'

const panelStyle: React.CSSProperties = { background: SURFACE, border: '1px solid #30363d', borderRadius: 4, padding: '16px 20px', minWidth: 0 }
const titleStyle: React.CSSProperties = { fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }
const subStyle: React.CSSProperties = { fontSize: 12, color: '#8b949e', marginBottom: 16 }
const emptyStyle: React.CSSProperties = { fontSize: 12, color: '#6e7681', padding: '24px 0', textAlign: 'center' }

function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

// "2026-11-20" -> "20/11"
function shortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function Legend() {
  const item = (color: string, label: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b949e' }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      {label}
    </span>
  )
  return <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>{item(OPENED, 'Abertos')}{item(CLOSED, 'Fechados')}</div>
}

function DailyChart({ days }: { days: Indicators['lastDays'] }) {
  const max = Math.max(1, ...days.flatMap(d => [d.opened, d.closed]))
  const totalOpened = days.reduce((s, d) => s + d.opened, 0)
  const totalClosed = days.reduce((s, d) => s + d.closed, 0)
  const HEIGHT = 140
  return (
    <div style={panelStyle}>
      <div style={titleStyle}>Abertos x fechados · últimos 7 dias</div>
      <div style={subStyle}>{plural(totalOpened, 'aberto', 'abertos')} · {plural(totalClosed, 'fechado', 'fechados')}</div>
      <Legend />
      <div role="img" aria-label={days.map(d => `${shortDate(d.date)}: ${d.opened} abertos, ${d.closed} fechados`).join('; ')} style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 8, alignItems: 'end', height: HEIGHT, borderBottom: '1px solid #30363d' }}>
        {days.map(d => (
          <div key={d.date} title={`${shortDate(d.date)} · ${d.opened} abertos · ${d.closed} fechados`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, height: '100%', cursor: 'default' }}>
            {[{ v: d.opened, c: OPENED }, { v: d.closed, c: CLOSED }].map((s, i) => (
              <div key={i} style={{ width: '40%', maxWidth: 18, height: s.v ? Math.max(3, (s.v / max) * (HEIGHT - 18)) : 0, background: s.c, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 8, marginTop: 6 }}>
        {days.map(d => (
          <div key={d.date} style={{ textAlign: 'center', fontSize: 10.5, color: '#6e7681', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>
            {shortDate(d.date)}<br />{weekday(d.date)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Barras horizontais com o valor ao lado: usadas para carga e categorias.
function BarList({ rows, emptyText }: { rows: { label: string; value: number }[]; emptyText: string }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  if (rows.length === 0) return <div style={emptyStyle}>{emptyText}</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(r => (
        <div key={r.label} title={`${r.label}: ${r.value}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 140px) 1fr 28px', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12.5, color: '#c9d1d9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <div style={{ height: 10, background: '#21262d', borderRadius: 4 }}>
            <div style={{ width: `${(r.value / max) * 100}%`, height: '100%', background: OPENED, borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12.5, color: '#e6edf3', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function Satisfaction({ data }: { data: Indicators['satisfaction'] }) {
  const max = Math.max(1, ...Object.values(data.distribution))
  return (
    <div style={panelStyle}>
      <div style={titleStyle}>Satisfação dos clientes</div>
      {data.count === 0 ? (
        <div style={emptyStyle}>Nenhuma avaliação ainda</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 4px' }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#e6edf3', lineHeight: 1 }}>{data.average?.toFixed(1).replace('.', ',')}</span>
            <span style={{ fontSize: 13, color: '#8b949e' }}>de 5</span>
          </div>
          <div style={subStyle}>{plural(data.count, 'avaliação', 'avaliações')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(['5', '4', '3', '2', '1'] as const).map(score => {
              const n = data.distribution[score]
              return (
                <div key={score} title={`Nota ${score}: ${n}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 24px', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#8b949e', fontFamily: 'var(--font-mono)' }}>{score}★</span>
                  <div style={{ height: 8, background: '#21262d', borderRadius: 4 }}>
                    <div style={{ width: `${(n / max) * 100}%`, height: '100%', background: CLOSED, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#e6edf3', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{n}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export function IndicatorsView() {
  const { token } = useAuth()
  const isMobile = useIsMobile()
  const [data, setData] = useState<Indicators | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getIndicators(token)
      .then(d => { if (!cancelled) { setData(d); setError(null) } })
      .catch(err => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os indicadores.') })
    return () => { cancelled = true }
  }, [token])

  const pad = isMobile ? '16px 14px 24px' : '24px'

  if (error) {
    return <div style={{ margin: pad, padding: '10px 14px', borderRadius: 4, background: '#2d1212', border: '1px solid #da3633', color: '#ff7b72', fontSize: 12.5 }}>{error}</div>
  }
  if (!data) {
    return <div style={{ padding: pad, color: '#8b949e', fontSize: 13 }}>Carregando indicadores...</div>
  }

  return (
    <div style={{ padding: pad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: isMobile ? 8 : 12 }}>
      <DailyChart days={data.lastDays} />
      <div style={panelStyle}>
        <div style={titleStyle}>Em atendimento por técnico</div>
        <div style={subStyle}>Carga atual de cada atendente</div>
        <BarList rows={data.workload.map(w => ({ label: w.name, value: w.inProgress }))} emptyText="Nenhum atendente cadastrado" />
      </div>
      <div style={panelStyle}>
        <div style={titleStyle}>Chamados por categoria</div>
        <div style={subStyle}>Todos os chamados registrados</div>
        <BarList rows={data.byCategory.map(c => ({ label: CATEGORY_LABELS[c.category], value: c.count }))} emptyText="Nenhum chamado registrado" />
      </div>
      <Satisfaction data={data.satisfaction} />
    </div>
  )
}
