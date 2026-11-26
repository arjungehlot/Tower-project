import { Phone, Building2, UserRound } from 'lucide-react'
import { Avatar, StatusBadge } from '@/components/ui'
import { useLookups } from '@/hooks/useLookups'
import { useNow } from '@/hooks/useMe'
import { duration, fmtTime } from '@/utils/dateUtils'
import type { Visitor } from '@/types'
import type { ReactNode } from 'react'

export function LiveDuration({ from, to }: { from: string; to?: string }) { useNow(15000); return <>{duration(from, to || undefined)}</> }
export function VisitorCard({ v, actions, onClick, showDuration, tile }: { v: Visitor; actions?: ReactNode; onClick?: () => void; showDuration?: boolean; tile?: boolean }) {
  const L = useLookups(), host = L.host(v.hostId), t = L.officeTenant(v.officeId)
  if (tile) return (
    <div className="group flex flex-col rounded-2xl bg-surface p-3 shadow-card ring-1 ring-line/70 transition-all hover:-translate-y-0.5 hover:shadow-pop">
      <div className="flex items-center gap-2.5" onClick={onClick} role={onClick ? 'button' : undefined}>
        <Avatar name={v.name} src={v.photo} size={40} />
        <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13.5px] font-bold">{v.name}</p><p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted"><Phone size={10} />{v.mobile}</p></div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2"><StatusBadge status={v.status} /><span className="truncate rounded-md bg-brand-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-brand">{v.purpose}</span></div>
      <div className="mt-2.5 space-y-1 text-[11.5px]">
        <p className="flex items-center gap-1.5 truncate"><Building2 size={12} className="shrink-0 text-faint" /><b className="truncate font-semibold">{t?.name ?? '—'}</b><span className="shrink-0 rounded bg-subtle px-1 py-px text-[10px] font-bold text-muted">{L.officeNo(v.officeId)}</span></p>
        <p className="flex items-center gap-1.5 truncate text-muted"><UserRound size={12} className="shrink-0 text-faint" />{host?.name ?? '—'}</p>
      </div>
      <div className="mt-2.5 grid grid-cols-2 divide-x divide-line rounded-xl bg-subtle/70 py-1.5 text-center">
        <div className="leading-tight"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{v.entryAt ? 'Entry' : 'Requested'}</p><p className="text-xs font-semibold">{fmtTime(v.entryAt || v.requestedAt)}</p></div>
        <div className="leading-tight"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted">{v.entryAt ? 'Duration' : 'Waiting'}</p><p className="text-xs font-semibold text-info">{v.entryAt ? <LiveDuration from={v.entryAt} to={v.exitAt} /> : <LiveDuration from={v.requestedAt} />}</p></div>
      </div>
      {actions && <div className="mt-2.5 flex flex-wrap gap-1.5 [&>*]:flex-1 [&>*]:justify-center [&>*]:whitespace-nowrap">{actions}</div>}
    </div>
  )
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-card transition-shadow hover:shadow-pop">
      <div className="flex min-w-[200px] flex-[3] items-center gap-2.5" onClick={onClick} role={onClick ? 'button' : undefined}>
        <Avatar name={v.name} src={v.photo} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 leading-tight"><p className="truncate text-[12.5px] font-semibold">{v.name}</p><StatusBadge status={v.status} /></div>
          <p className="truncate text-[11px] leading-snug text-muted">Office {L.officeNo(v.officeId)}{t ? ` · ${t.name}` : ''} · Host {host?.name}</p>
          <p className="truncate text-[10.5px] leading-snug text-muted/80">{v.purpose}{v.entryAt ? ` · Entry ${fmtTime(v.entryAt)}` : ` · Requested ${fmtTime(v.requestedAt)}`}{showDuration && v.entryAt && <> · <span className="font-semibold text-info">Inside for <LiveDuration from={v.entryAt} to={v.exitAt} /></span></>}</p>
        </div>
      </div>
      {actions && <div className="flex flex-[2] basis-[240px] flex-wrap justify-end gap-1 [&>*]:grow [&>*]:basis-0 [&>*]:justify-center [&>*]:whitespace-nowrap">{actions}</div>}
    </div>
  )
}
