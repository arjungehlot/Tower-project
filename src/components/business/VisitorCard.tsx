import { Avatar, StatusBadge } from '@/components/ui'
import { useLookups } from '@/hooks/useLookups'
import { useNow } from '@/hooks/useMe'
import { duration, fmtTime } from '@/utils/dateUtils'
import type { Visitor } from '@/types'
import type { ReactNode } from 'react'

export function LiveDuration({ from, to }: { from: string; to?: string }) { useNow(15000); return <>{duration(from, to || undefined)}</> }
export function VisitorCard({ v, actions, onClick, showDuration }: { v: Visitor; actions?: ReactNode; onClick?: () => void; showDuration?: boolean }) {
  const L = useLookups(), host = L.host(v.hostId), t = L.officeTenant(v.officeId)
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
