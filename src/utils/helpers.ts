export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 9)}`
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
export const initials = (n: string) => n.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()
export const colorFor = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 55% 45%)` }
export const avg = (a: number[]) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10 : 0)
export const countBy = <T,>(a: T[], f: (x: T) => string) => a.reduce<Record<string, number>>((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name + '.csv'; a.click()
}
