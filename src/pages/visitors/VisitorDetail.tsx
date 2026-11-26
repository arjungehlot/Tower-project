import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Mail, Phone, AtSign, IdCard, Users, Clock, LogIn, LogOut, Timer, Building2, MapPin, UserRound, ShieldCheck, DoorClosed } from 'lucide-react'
import { Avatar, Card, StatusBadge } from '@/components/ui'
import { VisitorActions } from '@/components/business/VisitorActions'
import { LiveDuration } from '@/components/business/VisitorCard'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { fmtDateTime, fmtTime } from '@/utils/dateUtils'

function Stat({ icon, label, value, tone = 'text-brand' }: { icon: ReactNode; label: string; value: ReactNode; tone?: string }) {
  return <div className="flex items-center gap-2 px-3 py-1.5"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-subtle ${tone}`}>{icon}</span><div className="min-w-0 leading-tight"><p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted">{label}</p><p className="truncate text-xs font-semibold">{value || '—'}</p></div></div>
}
function Item({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-subtle/60"><span className="text-faint">{icon}</span><div className="min-w-0 leading-tight"><p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted">{label}</p><div className="truncate text-xs font-medium">{children || '—'}</div></div></div>
}

export default function VisitorDetail() {
  const { id } = useParams(), L = useLookups(), v = useDb((s) => s.visitors.find((x) => x.id === id)), allMsgs = useDb((s) => s.messages), msgs = allMsgs.filter((m) => m.related === id)
  if (!v) return <p className="p-6 text-muted">Visitor not found.</p>
  const host = L.host(v.hostId), guard = L.user(v.guardId)
  return <div className="space-y-2.5">
    <Link to="/visitors" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Visitors</Link>
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand via-vis to-info" />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 pb-2.5 pt-3.5">
        <Avatar name={v.name} src={v.photo} size={42} />
        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-base font-bold leading-tight">{v.name}</h1><StatusBadge status={v.status} /><span className="rounded-md bg-subtle px-1.5 py-0.5 text-[10.5px] font-semibold text-muted">{v.id.toUpperCase()}</span></div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted"><span className="inline-flex items-center gap-1"><Phone size={12} />{v.mobile}</span>{v.email && <span className="inline-flex items-center gap-1"><AtSign size={12} />{v.email}</span>}<span className="inline-flex items-center gap-1"><IdCard size={12} />{v.idType} · {v.idNumber}</span></div>
        </div>
        <div className="flex flex-wrap gap-2"><VisitorActions v={v} size="sm" /></div>
      </div>
    <div className="grid grid-cols-2 divide-x divide-line border-t bg-subtle/40 md:grid-cols-4">
      <Stat icon={<LogIn size={15} />} label="Entry" value={v.entryAt ? fmtTime(v.entryAt) : ''} tone="text-ok" />
      <Stat icon={<LogOut size={15} />} label="Exit" value={v.exitAt ? fmtTime(v.exitAt) : ''} tone="text-warn" />
      <Stat icon={<Timer size={15} />} label="Duration" value={v.entryAt && <LiveDuration from={v.entryAt} to={v.exitAt} />} tone="text-info" />
      <Stat icon={<Clock size={15} />} label="Expected" value={v.expectedDuration} tone="text-vis" />
    </div>
    </div>
    {v.status === 'INFO_REQUESTED' && <p className="rounded-lg bg-vis/10 px-3 py-2 text-xs text-vis">More information requested: {v.remark}</p>}
    <div className="grid items-start gap-2.5 lg:grid-cols-[1fr_280px]">
      <Card title="Visit information"><div className="grid grid-cols-2 gap-x-1 gap-y-0.5 md:grid-cols-3 xl:grid-cols-4">
        <Item icon={<Building2 size={13} />} label="Office"><Link className="text-brand" to={`/offices/${v.officeId}`}>{L.officeNo(v.officeId)} · {L.officeTenant(v.officeId)?.name}</Link></Item>
        <Item icon={<MapPin size={13} />} label="Location">{L.location(v.towerId, v.floorId)}</Item>
        <Item icon={<UserRound size={13} />} label="Host">{host?.name}</Item>
        <Item icon={<Phone size={13} />} label="Host phone">{host?.phone}</Item>
        <Item icon={<ShieldCheck size={13} />} label="Guard">{guard?.name}</Item>
        <Item icon={<DoorClosed size={13} />} label="Gate">{v.gate}</Item>
        <Item icon={<Users size={13} />} label="Visitors">{v.count}</Item>
        <Item icon={<Clock size={13} />} label="Purpose">{v.purpose}</Item>
        <Item icon={<Clock size={13} />} label="Requested">{fmtDateTime(v.requestedAt)}</Item>
      </div></Card>
      <Card title="Timeline"><ol className="relative space-y-1.5 border-l border-line pl-4">{v.timeline.map((t, i) => <li key={i} className="relative"><span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface ${i === v.timeline.length - 1 ? 'bg-brand' : 'bg-faint'}`} /><div className="flex items-baseline justify-between gap-2"><p className="text-xs font-medium">{t.label}</p><p className="shrink-0 text-[10.5px] text-muted">{fmtTime(t.at)}</p></div></li>)}</ol></Card>
    </div>
    <Card title="Notifications sent">{msgs.length === 0 ? <p className="text-xs text-muted">No messages logged for this visit.</p> : <ul className="divide-y divide-line">{msgs.map((m) => <li key={m.id} className="flex items-start gap-2.5 py-1">{m.channel === 'whatsapp' ? <MessageCircle size={14} className="mt-0.5 text-ok" /> : <Mail size={14} className="mt-0.5 text-info" />}<div className="min-w-0 flex-1"><p className="text-xs">{m.message}</p><p className="text-xxs text-muted">To {m.recipient} · {fmtTime(m.sentAt)}</p></div><StatusBadge status={m.status} /></li>)}</ul>}</Card>
  </div>
}
