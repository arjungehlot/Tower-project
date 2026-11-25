import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Users, BadgeCheck, LogIn, LogOut, Siren, Search } from 'lucide-react'
import { Card, EmptyState, SearchBox } from '@/components/ui'
import { VisitorCard } from '@/components/business/VisitorCard'
import { VisitorActions } from '@/components/business/VisitorActions'
import { useVisitors } from '@/hooks/useVisitors'
import { useLookups } from '@/hooks/useLookups'
import { cx } from '@/utils/helpers'
import { fmtTime, isToday } from '@/utils/dateUtils'
import { motion } from 'framer-motion'

type Tab = 'approved' | 'inside' | 'pending' | 'entries' | 'exits' | 'search'
export default function GuardHome() {
  const nav = useNavigate(), L = useLookups(), { visitors, approved, inside, pending, today } = useVisitors()
  const [tab, setTab] = useState<Tab>('approved'), [q, setQ] = useState('')
  const entries = visitors.filter((v) => isToday(v.entryAt)).sort((a, b) => b.entryAt.localeCompare(a.entryAt)), exits = visitors.filter((v) => isToday(v.exitAt)).sort((a, b) => b.exitAt.localeCompare(a.exitAt))
  const found = q.length > 1 ? visitors.filter((v) => `${v.name} ${v.mobile} ${L.officeNo(v.officeId)}`.toLowerCase().includes(q.toLowerCase())).slice(0, 12) : []
  const tiles: { id: Tab | 'register' | 'emergency'; label: string; icon: React.ReactNode; n?: number; tone: string }[] = [
    { id: 'register', label: 'REGISTER VISITOR', icon: <UserPlus size={26} />, tone: 'bg-gradient-to-br from-brand to-vis text-white dark:text-slate-900' },
    { id: 'inside', label: 'Visitors Inside', icon: <Users size={22} />, n: inside.length, tone: 'bg-info/10 text-info' },
    { id: 'approved', label: 'Approved Visitors', icon: <BadgeCheck size={22} />, n: approved.length, tone: 'bg-ok/10 text-ok' },
    { id: 'entries', label: "Today's Entries", icon: <LogIn size={22} />, n: entries.length, tone: 'bg-subtle text-ink' },
    { id: 'exits', label: "Today's Exits", icon: <LogOut size={22} />, n: exits.length, tone: 'bg-subtle text-ink' },
    { id: 'emergency', label: 'Emergency', icon: <Siren size={22} />, tone: 'bg-bad/10 text-bad' },
  ]
  const list = { approved, inside, pending, entries, exits, search: found }[tab]
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-7">
      {tiles.map((t, i) => <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => t.id === 'register' ? nav('/guard/register') : t.id === 'emergency' ? nav('/guard/emergency') : setTab(t.id)}
        className={cx('flex min-h-[96px] flex-col items-start justify-between rounded-2xl p-3.5 shadow-card text-left transition-shadow', t.tone, i === 0 && 'col-span-2', tab === t.id && 'ring-2 ring-brand')}>
        {t.icon}<div><p className={cx('font-bold leading-tight', i === 0 ? 'text-base' : 'text-xs')}>{t.label}</p>{t.n !== undefined && <p className="text-2xl font-bold">{t.n}</p>}</div></motion.button>)}
    </div>
    <div className="flex gap-2 overflow-x-auto"><SearchBox value={q} onChange={(v) => { setQ(v); if (v) setTab('search') }} placeholder="SEARCH VISITOR — name, phone or office" className="min-w-[260px] flex-1 [&_input]:h-12 [&_input]:text-base" />
      {pending.length > 0 && <button onClick={() => setTab('pending')} className={cx('whitespace-nowrap rounded-xl border px-4 text-sm font-semibold', tab === 'pending' ? 'border-warn bg-warn/10 text-warn' : 'border-line')}>Waiting approval · {pending.length}</button>}</div>
    <Card title={<span className="capitalize">{tab === 'search' ? `Search results (${found.length})` : tab === 'approved' ? 'Approved — ready for entry' : tab === 'inside' ? 'Visitors inside' : tab === 'pending' ? 'Waiting for host approval' : tab === 'entries' ? "Today's entries" : "Today's exits"}</span>} pad={false}>
      <div className="space-y-2 p-3">
        {list.map((v) => <VisitorCard key={v.id} v={v} showDuration={tab === 'inside'} actions={tab === 'entries' || tab === 'exits' ? <span className="text-xs text-muted">{fmtTime(tab === 'entries' ? v.entryAt : v.exitAt)}</span> : <VisitorActions v={v} big />} />)}
        {list.length === 0 && <EmptyState title={tab === 'search' ? 'Type at least 2 characters' : 'Nothing here right now'} text={tab === 'approved' ? 'Approved visitors will appear here for you to allow entry.' : undefined} />}
      </div>
    </Card>
    <p className="text-center text-xxs text-muted">{today.length} visitors registered today · Large controls optimised for tablet</p>
    <Search className="hidden" />
  </div>
}
