import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogIn, LogOut, Clock, UserRoundCheck, XCircle, Users, Radio } from 'lucide-react'
import { Card, PageHeader, StatCard, EmptyState } from '@/components/ui'
import { VisitorCard } from '@/components/business/VisitorCard'
import { VisitorActions } from '@/components/business/VisitorActions'
import { useVisitors } from '@/hooks/useVisitors'
import { useLookups } from '@/hooks/useLookups'
import { fmtTime } from '@/utils/dateUtils'

export default function LiveVisitors() {
  const { today, inside, pending, stats } = useVisitors(), L = useLookups(), nav = useNavigate()
  const feed = today.flatMap((v) => v.timeline.filter((t) => /entered|exited/.test(t.label)).map((t) => ({ at: t.at, v, kind: t.label.includes('entered') ? 'in' : 'out' }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 14)
  return <>
    <PageHeader title={<span className="flex items-center gap-2">Live Visitors <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-ok" /></span></span>} subtitle="Real-time visitor presence across the building" />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatCard label="Currently inside" value={stats.inside} icon={<Users size={15} />} tone="info" /><StatCard label="Entered today" value={stats.entered} icon={<LogIn size={15} />} tone="ok" /><StatCard label="Exited" value={stats.exited} icon={<LogOut size={15} />} />
      <StatCard label="Pending" value={stats.pending} icon={<Clock size={15} />} tone="warn" /><StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={15} />} tone="bad" />
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title={<span className="flex items-center gap-2"><Radio size={14} className="text-info" />Inside the building ({inside.length})</span>} pad={false}>
          <div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3"><AnimatePresence initial={false}>{inside.sort((a, b) => a.entryAt.localeCompare(b.entryAt)).map((v) => <motion.div key={v.id} layout className="h-full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}><VisitorCard tile v={v} showDuration onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} size="md" />} /></motion.div>)}</AnimatePresence>
            {inside.length === 0 && <div className="col-span-full"><EmptyState title="No visitors inside" text="Visitors appear here once the guard allows entry." /></div>}</div>
        </Card>
        {pending.length > 0 && <Card title={`Awaiting approval (${pending.length})`} pad={false}><div className="grid gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-3">{pending.map((v) => <VisitorCard tile key={v.id} v={v} onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} size="md" />} />)}</div></Card>}
      </div>
      <Card title="Activity feed"><ul className="space-y-3">
        <AnimatePresence initial={false}>{feed.map((f) => <motion.li key={f.v.id + f.at} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2.5"><span className={`mt-0.5 rounded-full p-1 ${f.kind === 'in' ? 'bg-ok/10 text-ok' : 'bg-subtle text-muted'}`}>{f.kind === 'in' ? <LogIn size={12} /> : <LogOut size={12} />}</span><div><p className="text-xs"><b>{f.v.name}</b> {f.kind === 'in' ? 'entered' : 'exited'} · Office {L.officeNo(f.v.officeId)}</p><p className="text-xxs text-muted">{fmtTime(f.at)}</p></div></motion.li>)}</AnimatePresence>
        {feed.length === 0 && <p className="text-xs text-muted">No movement yet today.</p>}</ul></Card>
    </div>
  </>
}
