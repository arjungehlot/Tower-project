import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, UserRoundCheck, Ticket, ClipboardList, ShieldCheck, Settings, IndianRupee, Siren } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge, Button, Card, EmptyState, PageHeader, Tabs } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { visibleTo, markRead, markAllRead } from '@/services/notificationService'
import { ago, fmtDateTime } from '@/utils/dateUtils'
import { cx } from '@/utils/helpers'

const CATS = ['Visitor', 'Ticket', 'Task', 'Approval', 'System', 'Payment', 'Security']
const ICON: Record<string, React.ReactNode> = { Visitor: <UserRoundCheck size={15} />, Ticket: <Ticket size={15} />, Task: <ClipboardList size={15} />, Approval: <ShieldCheck size={15} />, System: <Settings size={15} />, Payment: <IndianRupee size={15} />, Security: <Siren size={15} /> }
const TONE: Record<string, string> = { Visitor: 'bg-vis/10 text-vis', Ticket: 'bg-warn/10 text-warn', Task: 'bg-info/10 text-info', Approval: 'bg-ok/10 text-ok', System: 'bg-subtle text-muted', Payment: 'bg-brand-soft text-brand', Security: 'bg-bad/10 text-bad' }
export default function Notifications() {
  const nav = useNavigate(), { me } = useMe(), all = useDb((s) => s.notifications).filter((n) => visibleTo(n, me)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const [cat, setCat] = useState('all'), [unreadOnly, setUnread] = useState(false), [sel, setSel] = useState<string | null>(null)
  const rows = all.filter((n) => (cat === 'all' || n.category === cat) && (!unreadOnly || !n.read)), unread = all.filter((n) => !n.read).length, cur = all.find((n) => n.id === sel)
  return <>
    <PageHeader title="Notification Center" subtitle={`${unread} unread of ${all.length}`} actions={<><Button size="md" onClick={() => setUnread(!unreadOnly)} variant={unreadOnly ? 'primary' : 'secondary'}>Unread only</Button><Button icon={<CheckCheck size={14} />} onClick={() => markAllRead(me)} disabled={!unread}>Mark all read</Button></>} />
    <Tabs value={cat} onChange={setCat} tabs={[{ id: 'all', label: 'All', count: all.length }, ...CATS.map((c) => ({ id: c, label: c, count: all.filter((n) => n.category === c).length }))]} />
    <div className="mt-3 grid gap-3 lg:grid-cols-3">
      <Card pad={false} className="lg:col-span-2"><ul className="divide-y divide-line">
        <AnimatePresence initial={false}>{rows.map((n) => <motion.li layout key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}><button onClick={() => { setSel(n.id); markRead(n.id) }} className={cx('flex w-full items-start gap-3 px-3.5 py-3 text-left hover:bg-subtle', sel === n.id && 'bg-brand-soft/50')}>
          <span className={cx('mt-0.5 rounded-lg p-1.5', TONE[n.category])}>{ICON[n.category] ?? <Bell size={15} />}</span><div className="min-w-0 flex-1"><p className={cx('text-xs', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p><p className="truncate text-xs text-muted">{n.body}</p></div><div className="text-right"><p className="text-xxs text-muted">{ago(n.createdAt)}</p>{!n.read && <span className="mt-1 inline-block h-2 w-2 rounded-full bg-brand" aria-label="Unread" />}</div></button></motion.li>)}</AnimatePresence>
        {!rows.length && <EmptyState title="No notifications" text="You're all caught up." />}</ul></Card>
      <Card title="Detail">{cur ? <div className="space-y-2"><Badge tone="brand">{cur.category}</Badge><p className="text-sm font-semibold">{cur.title}</p><p className="text-xs text-muted">{cur.body}</p><p className="text-xxs text-faint">{fmtDateTime(cur.createdAt)}</p>{cur.link && <Button variant="primary" size="sm" onClick={() => nav(cur.link)}>Open</Button>}</div> : <p className="text-xs text-muted">Select a notification to view details.</p>}</Card>
    </div></>
}
