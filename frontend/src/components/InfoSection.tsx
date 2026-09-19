export function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

export function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#6e7681', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: accent ? '#f0a84a' : '#c9d1d9', fontFamily: accent ? 'var(--font-mono)' : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
