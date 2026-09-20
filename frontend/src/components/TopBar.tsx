import { useAuth } from '../context/AuthContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { btnStyle } from '../lib/styles'

export function TopBar({ onNew, onHome, onNewAgent }: { onNew: () => void; onHome: () => void; onNewAgent: () => void }) {
  const isMobile = useIsMobile()
  const { user, signOut } = useAuth()
  return (
    <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', paddingTop: 'env(safe-area-inset-top, 0px)', paddingLeft: isMobile ? 'max(14px, env(safe-area-inset-left))' : '24px', paddingRight: isMobile ? 'max(14px, env(safe-area-inset-right))' : '24px', paddingBottom: isMobile ? 8 : 0, display: 'flex', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', rowGap: 8, gap: isMobile ? 10 : 20, minHeight: 52, flexShrink: 0 }}>
      <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
        <div style={{ width: 26, height: 26, background: '#f0a84a', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>⊕</span>
        </div>
        <span style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: '#e6edf3', letterSpacing: '-0.02em' }}>ChamadosMGR</span>
      </button>
      {!isMobile && <>
        <span style={{ color: '#30363d', fontSize: 18 }}>|</span>
        <span style={{ fontSize: 12, color: '#6e7681', fontFamily: 'var(--font-mono)' }}>Central de Suporte TI</span>
      </>}
      <div style={{ flex: 1 }} />
      {!isMobile && <span style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)' }}>18/08/2026</span>}
      {user?.role !== 'agent' && (
        <button onClick={onNew} style={{ ...btnStyle, background: '#f0a84a', color: '#0d1117', fontWeight: 600, border: 'none', fontSize: isMobile ? 11 : 12, padding: isMobile ? '6px 10px' : '6px 14px', whiteSpace: 'nowrap' }}>
          {isMobile ? '+ Chamado' : '+ Novo Chamado'}
        </button>
      )}
      {user?.role === 'agent' && (
        <button onClick={onNewAgent} title="Cadastrar novo atendente" style={{ ...btnStyle, background: 'transparent', border: '1px solid #30363d', color: '#8b949e', fontSize: isMobile ? 11 : 12, padding: isMobile ? '6px 10px' : '6px 14px', whiteSpace: 'nowrap' }}>
          {isMobile ? '+ Atend.' : '+ Atendente'}
        </button>
      )}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: isMobile ? 8 : 14, borderLeft: '1px solid #30363d' }}>
          {!isMobile && (
            <span style={{ fontSize: 12, color: '#8b949e', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {user.name} · {user.role === 'agent' ? 'Atendente' : 'Cliente'}
            </span>
          )}
          <button
            onClick={signOut}
            title="Sair"
            style={{ background: 'none', border: '1px solid #30363d', borderRadius: 4, color: '#8b949e', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', padding: isMobile ? '5px 8px' : '5px 10px' }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
