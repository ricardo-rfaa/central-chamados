export function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, color: '#6e7681', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || '#e6edf3', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6e7681', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}
