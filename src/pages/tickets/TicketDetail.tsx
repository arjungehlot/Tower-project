import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, RotateCcw, CheckCircle2, User, DoorOpen, UserCog, CalendarPlus, Timer, Clock, ClipboardList } from 'lucide-react'
import { Avatar, Badge, Button, Card, Input, Modal, PageHeader, Select, StatusBadge, Stars, Timeline } from '@/components/ui'
import { TaskActions } from '@/components/business/TaskActions'
import { StaffCard } from '@/components/business/StaffCard'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import * as ts from '@/services/ticketService'
import { recommend } from '@/services/employeeService'
import { TICKET_TO_STAFF } from '@/utils/constants'
import { fmtDateTime, fmtTime } from '@/utils/dateUtils'
import { cx } from '@/utils/helpers'
import type { Comment } from '@/types'

const KIND: Record<string, string> = { admin: 'Admin', staff: 'Staff', office: 'Office', internal: 'Internal note' }
export default function TicketDetail() {
  const { id } = useParams(), L = useLookups(), { me, can } = useMe(), t = useDb((s) => s.tickets.find((x) => x.id === id)), task = useDb((s) => s.tasks.find((x) => x.id === t?.taskId))
  const [msg, setMsg] = useState(''), [kind, setKind] = useState<Comment['kind']>(me?.role.startsWith('OFFICE') ? 'office' : me?.role === 'STAFF' ? 'staff' : 'admin'), [rate, setRate] = useState(false), [stars, setStars] = useState(5)
  if (!t) return <p className="p-6 text-muted">Ticket not found.</p>
  const reporter = L.host(t.reporterId), emp = L.employee(t.assignedEmployeeId), isOffice = !!me?.role.startsWith('OFFICE'), canAssign = can('tickets', 'assign') && ['OPEN'].includes(t.status)
  const recs = canAssign ? recommend(TICKET_TO_STAFF[t.category] ?? 'Maintenance', L.tower(t.towerId)?.name, t.category) : []
  const comments = t.comments.filter((c) => c.kind !== 'internal' || !isOffice), overdue = !['RESOLVED', 'CLOSED'].includes(t.status) && new Date(t.dueAt) < new Date()
  const send = () => { if (msg.trim()) { ts.addComment(t.id, msg.trim(), kind); setMsg('') } }
  return <>
    <PageHeader back={<Link to={isOffice ? '/tickets/mine' : '/tickets'} className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Tickets</Link>}
      title={<span className="flex flex-wrap items-center gap-2"><span className="text-muted">#{t.code}</span>{t.subject}<StatusBadge status={t.priority} /><StatusBadge status={t.status} />{overdue && <Badge tone="red" dot>Overdue</Badge>}</span>} subtitle={`${t.category} · ${L.location(t.towerId, t.floorId, t.officeId)}`}
      actions={<>{(isOffice || can('tickets', 'close')) && t.status === 'RESOLVED' && <><Button variant="success" icon={<CheckCircle2 size={14} />} onClick={() => setRate(true)}>Confirm resolution</Button><Button icon={<RotateCcw size={14} />} onClick={() => ts.reopen(t.id)}>Reopen</Button></>}
        {can('tickets', 'update') && !['CLOSED'].includes(t.status) && t.status !== 'OPEN' && <Select aria-label="Status" className="w-36" value={t.status} onChange={(e) => ts.setStatus(t.id, e.target.value as never)} options={['ASSIGNED', 'IN_PROGRESS', 'WAITING', 'RESOLVED']} />}</>} />
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title="Details" action={overdue ? <Badge tone="red" dot>SLA breached</Badge> : <span className="text-xxs text-muted">Due {fmtDateTime(t.dueAt)}</span>}>
          <p className="mb-2.5 rounded-lg bg-subtle/70 px-3 py-2 text-[13px] leading-snug">{t.description}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <Tile icon={<User size={13} />} k="Reporter" v={reporter && <span className="inline-flex items-center gap-1.5"><Avatar name={reporter.name} size={16} />{reporter.name}<span className="text-xxs text-muted">· {reporter.designation}</span></span>} />
            <Tile icon={<DoorOpen size={13} />} k="Office" v={<Link className="text-brand hover:underline" to={`/offices/${t.officeId}`}>{L.officeNo(t.officeId)} · {L.officeTenant(t.officeId)?.name}</Link>} />
            <Tile icon={<UserCog size={13} />} k="Assigned staff" v={emp ? <span className="inline-flex items-center gap-1.5"><Avatar name={emp.name} size={16} />{emp.name}</span> : 'Unassigned'} />
            <Tile icon={<CalendarPlus size={13} />} k="Raised" v={fmtDateTime(t.createdAt)} />
            <Tile icon={<Timer size={13} />} k="SLA due" v={fmtDateTime(t.dueAt)} tone={overdue ? 'bad' : 'warn'} />
            <Tile icon={<Clock size={13} />} k="Preferred visit" v={t.preferredVisit} />
          </div>
          {t.attachments.length > 0 && <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted"><Paperclip size={12} />{t.attachments.join(', ')}</p>}</Card>
        {canAssign && <Card title="Recommended staff — assign to resolve" pad={false}><div className="space-y-1.5 p-3">{recs.slice(0, 6).map((e, i) => <StaffCard key={e.id} e={e} right={<div className="flex items-center gap-2"><StatusBadge status={e.status} /><Button size="xs" variant={i === 0 ? 'primary' : 'secondary'} onClick={() => ts.assign(t.id, e.id)}>Assign</Button></div>} />)}{recs.length === 0 && <p className="text-xs text-muted">No staff registered for this category.</p>}<p className="pt-1 text-xxs text-faint">Ranked by availability → location → workload → skill → rating.</p></div></Card>}
        {task && <Card title="Work updates" action={<div className="flex gap-1"><TaskActions t={task} size="xs" /></div>}>
          <div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 text-brand"><ClipboardList size={15} /></span>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2 text-xs"><Link className="font-semibold text-brand hover:underline" to={`/tasks/${task.id}`}>{task.code}</Link><StatusBadge status={task.status} /></div>
              <div className="mt-1.5 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-gradient-to-r from-brand to-vis transition-all" style={{ width: `${task.progress}%` }} /></div><b className="w-9 text-right text-xs">{task.progress}%</b></div></div></div>
          {task.proof && <p className="mt-2 text-xxs text-muted">Proof: {task.proof}</p>}</Card>}
        {t.status === 'CLOSED' && <Card title="Resolution"><p className="text-xs">Closed after office confirmation.</p>{t.rating && <p className="mt-1 flex items-center gap-2 text-xs">Office rating: <Stars value={t.rating} size={13} /></p>}</Card>}
        <Card title="Conversation" action={<span className="rounded-full bg-subtle px-2 py-0.5 text-xxs font-semibold text-muted">{comments.length}</span>}>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">{comments.map((c) => <div key={c.id} className={cx('flex gap-2', c.kind === 'office' && 'flex-row-reverse')}><Avatar name={c.by} size={24} /><div className={cx('max-w-[80%] rounded-2xl px-3 py-1.5', c.kind === 'internal' ? 'border border-dashed border-warn bg-warn/10' : c.kind === 'office' ? 'rounded-tr-sm bg-brand-soft' : 'rounded-tl-sm bg-subtle')}><p className="text-[10.5px] text-muted"><b className="text-ink">{c.by}</b> · {KIND[c.kind]} · {fmtTime(c.at)}</p><p className="text-xs">{c.text}</p></div></div>)}</div>
          <div className="mt-2.5 flex gap-2 border-t pt-2.5">{!isOffice && me?.role !== 'STAFF' && <Select aria-label="Comment type" className="w-32" value={kind} onChange={(e) => setKind(e.target.value as Comment['kind'])} options={[{ value: 'admin', label: 'Comment' }, { value: 'internal', label: 'Internal note' }]} />}<Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Write a message…" aria-label="Message" /><Button variant="primary" onClick={send} aria-label="Send"><Send size={14} /></Button></div></Card>
      </div>
      <div className="relative h-[340px] lg:h-auto lg:min-h-[300px]"><Card className="absolute inset-0" pad={false} title="Timeline" action={<span className="text-xxs text-muted">{t.timeline.length} events</span>}>
        <div className="relative h-full"><div className="absolute inset-0 overflow-y-auto p-3 pl-4"><Timeline items={t.timeline} /></div></div></Card></div>
    </div>
    <Modal open={rate} onClose={() => setRate(false)} title="Confirm resolution" size="sm" footer={<><Button onClick={() => setRate(false)}>Cancel</Button><Button variant="success" onClick={() => { ts.confirmClose(t.id, stars); setRate(false) }}>Close ticket</Button></>}><p className="mb-3 text-xs text-muted">Is the issue resolved? Rate the service.</p><div className="flex justify-center"><Stars value={stars} onChange={setStars} size={28} /></div></Modal>
  </>
}

function Tile({ icon, k, v, tone }: { icon: ReactNode; k: string; v?: ReactNode; tone?: 'warn' | 'bad' }) {
  return <div className="min-w-0 rounded-lg border border-line bg-surface px-2.5 py-1.5">
    <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : 'text-faint'}`}>{icon}{k}</p>
    <p className="mt-0.5 truncate text-[12.5px] font-medium">{v || '—'}</p></div>
}
