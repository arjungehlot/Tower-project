import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { Avatar, Card, KV, PageHeader, StatusBadge, Timeline } from '@/components/ui'
import { VisitorActions } from '@/components/business/VisitorActions'
import { LiveDuration } from '@/components/business/VisitorCard'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { fmtDateTime, fmtTime } from '@/utils/dateUtils'

export default function VisitorDetail() {
  const { id } = useParams(), L = useLookups(), v = useDb((s) => s.visitors.find((x) => x.id === id)), allMsgs = useDb((s) => s.messages), msgs = allMsgs.filter((m) => m.related === id)
  if (!v) return <p className="p-6 text-muted">Visitor not found.</p>
  const host = L.host(v.hostId), guard = L.user(v.guardId)
  return <>
    <PageHeader back={<Link to="/visitors" className="mb-1 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ArrowLeft size={12} />Visitors</Link>} title={<span className="flex items-center gap-2">{v.name}<StatusBadge status={v.status} /></span>} subtitle={`Visit ID ${v.id.toUpperCase()}`} actions={<VisitorActions v={v} size="md" />} />
    {v.status === 'INFO_REQUESTED' && <p className="mb-3 rounded-lg bg-vis/10 p-2.5 text-xs text-vis">More information requested: {v.remark}</p>}
    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="lg:col-span-1"><div className="mb-3 flex flex-col items-center gap-2 text-center"><Avatar name={v.name} src={v.photo} size={88} /><div><p className="font-semibold">{v.name}</p><p className="text-xs text-muted">{v.mobile}{v.email && ` · ${v.email}`}</p></div></div>
        <KV k="ID" v={`${v.idType} · ${v.idNumber}`} /><KV k="Purpose" v={v.purpose} /><KV k="Visitors" v={v.count} /><KV k="Expected" v={v.expectedDuration} /></Card>
      <Card title="Visit information"><KV k="Office" v={<Link className="text-brand" to={`/offices/${v.officeId}`}>{L.officeNo(v.officeId)} · {L.officeTenant(v.officeId)?.name}</Link>} /><KV k="Location" v={L.location(v.towerId, v.floorId)} /><KV k="Host" v={host?.name} /><KV k="Host phone" v={host?.phone} /><KV k="Guard" v={guard?.name} /><KV k="Gate" v={v.gate} />
        <KV k="Requested" v={fmtDateTime(v.requestedAt)} /><KV k="Entry" v={v.entryAt ? fmtTime(v.entryAt) : ''} /><KV k="Exit" v={v.exitAt ? fmtTime(v.exitAt) : ''} /><KV k="Duration" v={v.entryAt && <b><LiveDuration from={v.entryAt} to={v.exitAt} /></b>} /></Card>
      <Card title="Timeline"><Timeline items={v.timeline} /></Card>
    </div>
    <Card className="mt-4" title="Notifications sent">{msgs.length === 0 ? <p className="text-xs text-muted">No messages logged for this visit.</p> : <ul className="divide-y divide-line">{msgs.map((m) => <li key={m.id} className="flex items-start gap-3 py-2">{m.channel === 'whatsapp' ? <MessageCircle size={15} className="mt-0.5 text-ok" /> : <Mail size={15} className="mt-0.5 text-info" />}<div className="flex-1"><p className="text-xs">{m.message}</p><p className="text-xxs text-muted">To {m.recipient} · {fmtTime(m.sentAt)}</p></div><StatusBadge status={m.status} /></li>)}</ul>}</Card>
  </>
}
