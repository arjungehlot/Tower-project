import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Avatar, Badge, Button, Card, Input, KV, Modal, PageHeader, Select, StatusBadge, Stars, Timeline } from '@/components/ui'
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
        <Card title="Details"><p className="mb-3 text-[13px]">{t.description}</p><div className="grid gap-x-8 sm:grid-cols-2"><KV k="Reporter" v={reporter && `${reporter.name} (${reporter.designation})`} /><KV k="Office" v={<Link className="text-brand" to={`/offices/${t.officeId}`}>{L.officeNo(t.officeId)} · {L.officeTenant(t.officeId)?.name}</Link>} /><KV k="Raised" v={fmtDateTime(t.createdAt)} /><KV k="SLA due" v={fmtDateTime(t.dueAt)} /><KV k="Preferred visit" v={t.preferredVisit} /><KV k="Assigned staff" v={emp && <span className="inline-flex items-center gap-1.5"><Avatar name={emp.name} size={18} />{emp.name}</span>} /></div>
          {t.attachments.length > 0 && <p className="mt-2 text-xs text-muted"><Paperclip size={12} className="mr-1 inline" />{t.attachments.join(', ')}</p>}</Card>
        {canAssign && <Card title="Recommended staff — assign to resolve" pad={false}><div className="space-y-1.5 p-3">{recs.slice(0, 6).map((e, i) => <StaffCard key={e.id} e={e} right={<div className="flex items-center gap-2"><StatusBadge status={e.status} /><Button size="xs" variant={i === 0 ? 'primary' : 'secondary'} onClick={() => ts.assign(t.id, e.id)}>Assign</Button></div>} />)}{recs.length === 0 && <p className="text-xs text-muted">No staff registered for this category.</p>}<p className="pt-1 text-xxs text-faint">Ranked by availability → location → workload → skill → rating.</p></div></Card>}
        {task && <Card title="Work updates" action={<div className="flex gap-1"><TaskActions t={task} size="xs" /></div>}><div className="flex items-center justify-between text-xs"><Link className="font-semibold text-brand" to={`/tasks/${task.id}`}>{task.code}</Link><StatusBadge status={task.status} /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${task.progress}%` }} /></div><p className="mt-1 text-xxs text-muted">{task.progress}% complete{task.proof && ` · Proof: ${task.proof}`}</p></Card>}
        {t.status === 'CLOSED' && <Card title="Resolution"><p className="text-xs">Closed after office confirmation.</p>{t.rating && <p className="mt-1 flex items-center gap-2 text-xs">Office rating: <Stars value={t.rating} size={13} /></p>}</Card>}
        <Card title="Conversation"><div className="space-y-2.5">{comments.map((c) => <div key={c.id} className={cx('flex gap-2', c.kind === 'office' && 'flex-row-reverse')}><Avatar name={c.by} size={26} /><div className={cx('max-w-[80%] rounded-xl px-3 py-1.5', c.kind === 'internal' ? 'border border-dashed border-warn bg-warn/10' : c.kind === 'office' ? 'bg-brand-soft' : 'bg-subtle')}><p className="text-xxs text-muted"><b className="text-ink">{c.by}</b> · {KIND[c.kind]} · {fmtTime(c.at)}</p><p className="text-xs">{c.text}</p></div></div>)}</div>
          <div className="mt-3 flex gap-2">{!isOffice && me?.role !== 'STAFF' && <Select aria-label="Comment type" className="w-32" value={kind} onChange={(e) => setKind(e.target.value as Comment['kind'])} options={[{ value: 'admin', label: 'Comment' }, { value: 'internal', label: 'Internal note' }]} />}<Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Write a message…" aria-label="Message" /><Button variant="primary" onClick={send} aria-label="Send"><Send size={14} /></Button></div></Card>
      </div>
      <Card title="Timeline"><Timeline items={t.timeline} /></Card>
    </div>
    <Modal open={rate} onClose={() => setRate(false)} title="Confirm resolution" size="sm" footer={<><Button onClick={() => setRate(false)}>Cancel</Button><Button variant="success" onClick={() => { ts.confirmClose(t.id, stars); setRate(false) }}>Close ticket</Button></>}><p className="mb-3 text-xs text-muted">Is the issue resolved? Rate the service.</p><div className="flex justify-center"><Stars value={stars} onChange={setStars} size={28} /></div></Modal>
  </>
}
