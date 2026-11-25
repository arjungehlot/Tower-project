import { useNavigate } from 'react-router-dom'
import { UserPlus, Ticket, Clock, CalendarCheck, Users, Bell } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader, StatCard, StatusBadge } from '@/components/ui'
import { VisitorCard } from '@/components/business/VisitorCard'
import { VisitorActions } from '@/components/business/VisitorActions'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import { visibleTo } from '@/services/notificationService'
import { ago, isToday } from '@/utils/dateUtils'

export default function OfficeDashboard() {
  const nav = useNavigate(), { me, officeId } = useMe(), L = useLookups(), { visitors, tickets, notifications } = useDb()
  const o = L.office(officeId), mine = visitors.filter((v) => v.officeId === officeId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  const waiting = mine.filter((v) => v.status === 'PENDING' || v.status === 'INFO_REQUESTED'), upcoming = mine.filter((v) => v.status === 'APPROVED'), inside = mine.filter((v) => v.status === 'INSIDE')
  const tk = tickets.filter((t) => t.officeId === officeId), openTk = tk.filter((t) => !['CLOSED'].includes(t.status)), notes = notifications.filter((n) => visibleTo(n, me)).slice(0, 5)
  return <>
    <PageHeader title={`Hello, ${me?.name.split(' ')[0]}`} subtitle={o ? `Office ${o.number} · ${L.tenant(o.tenantId)?.name} · ${L.location(o.towerId, o.floorId)}` : ''} actions={<><Button icon={<Ticket size={14} />} onClick={() => nav('/tickets/mine?new=1')}>Raise ticket</Button><Button variant="primary" icon={<UserPlus size={14} />} onClick={() => nav('/visitor/register')}>Invite visitor</Button></>} />
    <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Visitors waiting" value={waiting.length} icon={<Clock size={15} />} tone="warn" /><StatCard label="Upcoming / approved" value={upcoming.length} icon={<CalendarCheck size={15} />} tone="ok" /><StatCard label="Visitors inside" value={inside.length} icon={<Users size={15} />} tone="info" /><StatCard label="Open tickets" value={openTk.length} icon={<Ticket size={15} />} tone="vis" /></div>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title={`Visitors waiting for you (${waiting.length})`} pad={false}><div className="space-y-2 p-3">{waiting.map((v) => <VisitorCard key={v.id} v={v} onClick={() => nav(`/visitors/${v.id}`)} actions={<VisitorActions v={v} />} />)}{!waiting.length && <EmptyState title="No visitors waiting" text="Approval requests from the gate appear here instantly." />}</div></Card>
        <Card title="My visitors today" pad={false}><div className="space-y-2 p-3">{mine.filter((v) => isToday(v.requestedAt) && !waiting.includes(v)).map((v) => <VisitorCard key={v.id} v={v} showDuration onClick={() => nav(`/visitors/${v.id}`)} />)}{!mine.some((v) => isToday(v.requestedAt) && !waiting.includes(v)) && <p className="p-4 text-center text-xs text-muted">No other visitors today.</p>}</div></Card>
      </div>
      <div className="space-y-3">
        <Card title="Ticket status" action={<button className="text-xxs font-medium text-brand" onClick={() => nav('/tickets/mine')}>View all</button>}><ul className="space-y-2">{tk.slice(0, 5).map((t) => <li key={t.id}><button onClick={() => nav(`/tickets/${t.id}`)} className="flex w-full items-center justify-between gap-2 text-left text-xs hover:text-brand"><span className="truncate">{t.code} · {t.subject}</span><StatusBadge status={t.status} /></button></li>)}{!tk.length && <p className="text-xs text-muted">No tickets raised.</p>}</ul></Card>
        <Card title="Recent notifications" action={<Bell size={14} className="text-muted" />}><ul className="space-y-2">{notes.map((n) => <li key={n.id} className="text-xs"><p className="font-medium">{n.title}</p><p className="text-muted">{n.body}</p><p className="text-xxs text-faint">{ago(n.createdAt)}</p></li>)}{!notes.length && <p className="text-xs text-muted">Nothing new.</p>}</ul></Card>
      </div>
    </div></>
}
