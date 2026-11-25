import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/store/db'
import { cx } from '@/utils/helpers'
import type { Office } from '@/types'

export function useOfficeLive() {
  const visitors = useDb((s) => s.visitors)
  return useMemo(() => {
    const m = new Map<string, { pending: number; inside: number }>()
    visitors.forEach((v) => { if (v.status === 'PENDING' || v.status === 'APPROVED' || v.status === 'INSIDE') { const c = m.get(v.officeId) ?? { pending: 0, inside: 0 }; v.status === 'INSIDE' ? c.inside++ : c.pending++; m.set(v.officeId, c) } })
    return m
  }, [visitors])
}
export function officeTone(o: Office, live?: { pending: number; inside: number }) {
  if (live?.inside) return 'bg-info text-white border-info'
  if (live?.pending) return 'bg-warn text-white border-warn'
  return { Occupied: 'bg-ok/15 text-ok border-ok/30', Vacant: 'bg-subtle text-faint border-line', Reserved: 'bg-vis/10 text-vis border-vis/30', 'Under Maintenance': 'bg-bad/10 text-bad border-bad/30' }[o.status]
}
export const MapLegend = () => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xxs text-muted">{[['bg-ok', 'Occupied'], ['bg-faint', 'Vacant'], ['bg-warn', 'Visitor pending'], ['bg-info', 'Visitor inside'], ['bg-bad', 'Maintenance']].map(([c, l]) => <span key={l} className="inline-flex items-center gap-1"><span className={cx('h-2 w-2 rounded-sm', c)} />{l}</span>)}</div>
)
export function FloorMap({ offices, size = 'md' }: { offices: Office[]; size?: 'sm' | 'md' }) {
  const nav = useNavigate(), live = useOfficeLive(), tenants = useDb((s) => s.tenants)
  return (
    <div className={cx('grid gap-2', size === 'md' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-6')}>
      {offices.map((o, i) => (
        <motion.button key={o.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }} onClick={() => nav(`/offices/${o.id}`)} aria-label={`Office ${o.number}, ${o.status}`}
          className={cx('rounded-lg border p-2.5 text-left transition-shadow hover:shadow-pop', officeTone(o, live.get(o.id)))}>
          <p className="text-sm font-bold">{o.number}</p><p className="truncate text-xxs opacity-90">{tenants.find((t) => t.id === o.tenantId)?.name ?? o.status}</p>
          <p className="mt-0.5 text-[10px] font-medium opacity-80">{live.get(o.id)?.inside ? `${live.get(o.id)!.inside} inside` : live.get(o.id)?.pending ? 'Visitor pending' : o.status}</p>
        </motion.button>
      ))}
    </div>
  )
}
