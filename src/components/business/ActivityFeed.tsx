import { AnimatePresence, motion } from 'framer-motion'
import { UserRoundCheck, Ticket, ClipboardList, Building2, Users, Settings2, Activity } from 'lucide-react'
import { Card } from '@/components/ui'
import { useDb } from '@/store/db'
import { ago } from '@/utils/dateUtils'

const MOD: Record<string, { icon: JSX.Element; tone: string }> = {
  Visitors: { icon: <UserRoundCheck size={13} />, tone: 'bg-info/15 text-info' }, Tickets: { icon: <Ticket size={13} />, tone: 'bg-warn/15 text-warn' }, Tasks: { icon: <ClipboardList size={13} />, tone: 'bg-ok/15 text-ok' },
  Offices: { icon: <Building2 size={13} />, tone: 'bg-vis/15 text-vis' }, Tenants: { icon: <Users size={13} />, tone: 'bg-brand/15 text-brand' }, Settings: { icon: <Settings2 size={13} />, tone: 'bg-subtle text-muted' },
}
export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const logs = useDb((s) => s.auditLogs)
  const items = [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
  return (
    <Card title="Live activity" action={<span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ok"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" /></span>Live</span>} pad={false}>
      <ul className="relative max-h-[300px] overflow-y-auto px-3 py-2.5">
        <span className="absolute bottom-4 left-[26px] top-4 w-px bg-line" />
        <AnimatePresence initial={false}>{items.map((a) => { const m = MOD[a.module] ?? { icon: <Activity size={13} />, tone: 'bg-subtle text-muted' }; return <motion.li layout key={a.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-start gap-2.5 py-1.5">
          <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${m.tone}`}>{m.icon}</span>
          <div className="min-w-0 flex-1 leading-tight"><p className="text-xs"><b>{a.user.split(' (')[0]}</b> <span className="text-ink/80">{a.action}</span></p><p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted"><span className="rounded bg-subtle px-1 py-px font-medium">{a.module}</span>{ago(a.timestamp)}</p></div>
        </motion.li> })}</AnimatePresence>
      </ul>
    </Card>
  )
}
