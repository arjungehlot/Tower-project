import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '@/components/ui'
import { useDb } from '@/store/db'
import { ago } from '@/utils/dateUtils'

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const logs = useDb((s) => s.auditLogs)
  const items = [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
  return (
    <Card title="Live activity">
      <ul className="space-y-3">
        <AnimatePresence initial={false}>{items.map((a) => <motion.li layout key={a.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><div className="min-w-0"><p className="text-xs"><b>{a.user.split(' (')[0]}</b> {a.action}</p><p className="text-xxs text-muted">{a.module} · {ago(a.timestamp)}</p></div></motion.li>)}</AnimatePresence>
      </ul>
    </Card>
  )
}
