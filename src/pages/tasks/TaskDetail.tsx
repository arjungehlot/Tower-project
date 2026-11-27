import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, MapPin, User, ShieldCheck, UserCog, CalendarPlus, Timer, Play, CheckCircle2, Ticket as TicketIcon, Wrench, UserCheck, ThumbsUp, Loader, PauseCircle, XCircle, Ban, type LucideIcon } from 'lucide-react'
import { Avatar, Button, Card, Input, ProgressBar, Stars, Timeline } from '@/components/ui'
import { TaskActions } from '@/components/business/TaskActions'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { useMe } from '@/hooks/useMe'
import * as ts from '@/services/taskService'
import { fmtDateTime, fmtTime } from '@/utils/dateUtils'

export default function TaskDetail() {
  const { id } = useParams(), L = useLookups(), { me } = useMe(), t = useDb((s) => s.tasks.find((x) => x.id === id)), [msg, setMsg] = useState(''), [proof, setProof] = useState('')
  if (!t) return <p className="p-6 text-muted">Task not found.</p>
  const emp = L.employee(t.assignedEmployeeId), sup = L.employee(t.supervisorId), canProgress = t.status === 'IN_PROGRESS' && (me?.role === 'STAFF' || useDb.getState().demoMode)
  const ST: Record<string, { i: LucideIcon; c: string; l: string; spin?: boolean }> = { ASSIGNED: { i: UserCheck, c: 'bg-warn/10 text-warn', l: 'Assigned' }, ACCEPTED: { i: ThumbsUp, c: 'bg-info/10 text-info', l: 'Accepted' }, IN_PROGRESS: { i: Loader, c: 'bg-brand/10 text-brand', l: 'In progress', spin: true }, ON_HOLD: { i: PauseCircle, c: 'bg-vis/10 text-vis', l: 'On hold' }, COMPLETED: { i: CheckCircle2, c: 'bg-ok/10 text-ok', l: 'Completed' }, REJECTED: { i: XCircle, c: 'bg-bad/10 text-bad', l: 'Rejected' }, CANCELLED: { i: Ban, c: 'bg-subtle text-muted', l: 'Cancelled' } }
  const PRI: Record<string, { c: string; l: string; bars: number }> = { CRITICAL: { c: 'text-bad', l: 'Critical', bars: 4 }, HIGH: { c: 'text-warn', l: 'High', bars: 3 }, MEDIUM: { c: 'text-info', l: 'Medium', bars: 2 }, LOW: { c: 'text-muted', l: 'Low', bars: 1 } }
  const st = ST[t.status] ?? ST.ASSIGNED, SI = st.i, pr = PRI[t.priority] ?? PRI.LOW, open = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD'].includes(t.status), late = open && new Date(t.deadline).getTime() < Date.now()
  const rel = (d: string) => { const m = Math.round(Math.abs(new Date(d).getTime() - Date.now()) / 60000); return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d` }
  const send = () => { if (msg.trim()) { ts.addComment(t.id, msg.trim(), me?.role === 'STAFF' ? 'staff' : 'admin'); setMsg('') } }
  return <>
    <Link to="/tasks" className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"><ArrowLeft size={12} />Back to tasks</Link>
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-line/70">
      <div className="h-0.5 bg-gradient-to-r from-brand/40 via-vis/30 to-info/30" /><span className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-brand/5" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Wrench size={20} /></span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1"><h1 className="text-lg font-bold leading-tight tracking-tight">{t.title}</h1>
              <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-[11px] font-semibold ${st.c}`}><SI size={12} className={st.spin ? 'animate-spin [animation-duration:2.5s]' : ''} />{st.l}</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${pr.c}`}><span className="flex h-3.5 items-end gap-[2px]">{[1, 2, 3, 4].map((n) => <i key={n} className={`w-[3px] rounded-sm bg-current ${n <= pr.bars ? '' : 'opacity-20'}`} style={{ height: 3 + n * 2.5 }} />)}</span>{pr.l}</span></div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted"><span className="rounded-md bg-brand/10 px-1.5 py-0.5 font-bold text-brand">{t.code}</span><span>{t.category}</span>
              <span className="text-faint">·</span><span className="inline-flex items-center gap-1"><MapPin size={11} className="text-faint" />{L.location(t.towerId, t.floorId, t.officeId) || 'Common area'}</span>
              {open && <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold ${late ? 'bg-bad/10 text-bad' : 'bg-subtle'}`}><Timer size={11} />{late ? 'Overdue by ' : 'Due in '}{rel(t.deadline)}</span>}</div></div></div>
        <div className="flex items-center gap-2"><TaskActions t={t} size="md" /></div>
      </div>
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <Card title="Details" action={<span className="text-xxs text-muted">{t.code}</span>}>
          <p className="mb-2.5 rounded-lg bg-subtle/70 px-3 py-2 text-[13px] leading-snug">{t.description}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Tile icon={<MapPin size={13} />} k="Location" v={L.location(t.towerId, t.floorId, t.officeId) || 'Common area'} />
            <Tile icon={<User size={13} />} k="Assigned to" v={emp ? <span className="inline-flex items-center gap-1.5"><Avatar name={emp.name} size={16} />{emp.name}</span> : '—'} />
            <Tile icon={<ShieldCheck size={13} />} k="Supervisor" v={sup?.name} />
            <Tile icon={<UserCog size={13} />} k="Created by" v={L.user(t.createdBy)?.name ?? 'System'} />
            <Tile icon={<CalendarPlus size={13} />} k="Created" v={t.createdAt && fmtDateTime(t.createdAt)} />
            <Tile icon={<Timer size={13} />} k="Deadline" v={t.deadline && fmtDateTime(t.deadline)} tone="warn" />
            <Tile icon={<Play size={13} />} k="Started" v={t.startedAt && fmtDateTime(t.startedAt)} />
            <Tile icon={<CheckCircle2 size={13} />} k={t.verifiedAt ? 'Verified' : 'Completed'} v={(t.verifiedAt ?? t.completedAt) && fmtDateTime((t.verifiedAt ?? t.completedAt)!)} />
          </div>
          {(t.ticketId || t.attachments?.length) ? <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            {t.ticketId && <Link className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 font-semibold text-brand hover:bg-brand/15" to={`/tickets/${t.ticketId}`}><TicketIcon size={12} />{useDb.getState().tickets.find((x) => x.id === t.ticketId)?.code}</Link>}
            {t.attachments?.length ? <span className="inline-flex items-center gap-1 text-muted"><Paperclip size={12} />{t.attachments.join(', ')}</span> : null}</div> : null}</Card>
        <Card title="Progress" action={<b className={t.status === 'COMPLETED' ? 'text-ok' : 'text-brand'}>{t.progress}%</b>}>
          <ProgressBar value={t.progress} tone={t.status === 'COMPLETED' ? 'ok' : 'brand'} className="!h-2" />
          {canProgress && <div className="mt-2.5 flex flex-wrap items-center gap-2"><input type="range" aria-label="Progress" min={0} max={90} step={10} value={t.progress} onChange={(e) => ts.setProgress(t.id, +e.target.value)} className="min-w-[140px] flex-1 accent-[rgb(var(--brand))]" /><Input className="w-52" placeholder="Completion proof (file / note)" value={proof} onChange={(e) => setProof(e.target.value)} /><Button variant="success" size="sm" onClick={() => ts.complete(t.id, proof)}>Mark complete</Button></div>}
          {t.proof && <p className="mt-2 text-xs"><span className="text-muted">Completion proof:</span> {t.proof}</p>}</Card>
        {t.rating && <Card title="Rating"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(['quality', 'speed', 'professionalism', 'cleanliness'] as const).map((k) => <div key={k}><p className="label">{k}</p><Stars value={t.rating![k]} size={13} /></div>)}</div><p className="mt-2 text-sm font-semibold">Overall {t.rating.overall}/5 {t.rating.comment && <span className="font-normal text-muted">— “{t.rating.comment}”</span>}</p></Card>}
        <Card title="Comments" action={<span className="rounded-full bg-subtle px-2 py-0.5 text-xxs font-semibold text-muted">{t.comments.length}</span>}>
          {t.comments.length > 0 && <div className="mb-2.5 max-h-48 space-y-2 overflow-y-auto">{t.comments.map((c) => <div key={c.id} className="flex gap-2"><Avatar name={c.by} size={22} /><div className="rounded-lg bg-subtle px-3 py-1.5"><p className="text-xxs text-muted"><b className="text-ink">{c.by}</b> · {fmtTime(c.at)}</p><p className="text-xs">{c.text}</p></div></div>)}</div>}
          <div className="flex gap-2"><Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={t.comments.length ? 'Add a comment…' : 'No comments yet — add the first one…'} aria-label="Comment" /><Button variant="primary" onClick={send} aria-label="Send"><Send size={14} /></Button></div></Card>
      </div>
      <div className="relative h-[360px] lg:h-auto lg:min-h-[320px]"><Card className="absolute inset-0" pad={false} title="Activity timeline" action={<span className="text-xxs text-muted">{t.timeline.length} events</span>}>
        <div className="relative h-full"><div className="absolute inset-0 overflow-y-auto p-3 pl-4"><Timeline items={t.timeline} /></div></div></Card></div>
    </div></>
}
function Tile({ icon, k, v, tone }: { icon: ReactNode; k: string; v?: ReactNode; tone?: 'warn' }) {
  return <div className="min-w-0 rounded-lg border border-line bg-surface px-2.5 py-1.5">
    <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${tone === 'warn' ? 'text-warn' : 'text-faint'}`}>{icon}{k}</p>
    <p className="mt-0.5 truncate text-[12.5px] font-medium" title={typeof v === 'string' ? v : undefined}>{v || '—'}</p></div>
}
