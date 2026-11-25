export const fmtTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—')
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
export const fmtDateTime = (iso?: string) => (iso ? `${fmtDate(iso)}, ${fmtTime(iso)}` : '—')
export const isToday = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString()
export const dayKey = (iso: string) => new Date(iso).toISOString().slice(0, 10)
export function duration(fromIso?: string, toIso?: string | number) {
  if (!fromIso) return '—'
  const to = toIso ? new Date(toIso).getTime() : Date.now()
  const m = Math.max(0, Math.floor((to - new Date(fromIso).getTime()) / 60000))
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`
}
export const ago = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}
export const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
