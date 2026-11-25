import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserRoundCheck, DoorOpen, Users, Ticket, ClipboardList, Building, CornerDownLeft } from 'lucide-react'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { navFor } from './navConfig'
import { cx } from '@/utils/helpers'

interface Hit { id: string; group: string; label: string; sub?: string; to: string; icon: React.ReactNode }
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate(), { me } = useMe(), s = useDb()
  const [q, setQ] = useState(''), [idx, setIdx] = useState(0), ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => ref.current?.focus(), 30) } }, [open])
  const hits = useMemo<Hit[]>(() => {
    const t = q.trim().toLowerCase()
    const pages: Hit[] = me ? navFor(me.role).flatMap((sec) => sec.items.map((i) => ({ id: i.to, group: 'Go to', label: i.label, to: i.to, icon: <i.icon size={14} /> }))) : []
    if (!t) return pages.slice(0, 8)
    const m = (...a: (string | undefined)[]) => a.some((x) => x?.toLowerCase().includes(t))
    const isAdminish = me && ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'].includes(me.role)
    const out: Hit[] = pages.filter((p) => m(p.label))
    if (isAdminish) {
      s.visitors.filter((v) => m(v.name, v.mobile)).slice(0, 4).forEach((v) => out.push({ id: v.id, group: 'Visitors', label: v.name, sub: `${v.mobile} · ${v.status}`, to: `/visitors/${v.id}`, icon: <UserRoundCheck size={14} /> }))
      s.offices.filter((o) => m(o.number, s.tenants.find((x) => x.id === o.tenantId)?.name)).slice(0, 4).forEach((o) => out.push({ id: o.id, group: 'Offices', label: `Office ${o.number}`, sub: s.tenants.find((x) => x.id === o.tenantId)?.name ?? o.status, to: `/offices/${o.id}`, icon: <DoorOpen size={14} /> }))
      s.employees.filter((e) => m(e.name, e.empId, e.category)).slice(0, 4).forEach((e) => out.push({ id: e.id, group: 'Employees', label: e.name, sub: `${e.category} · ${e.empId}`, to: `/staff/${e.id}`, icon: <Users size={14} /> }))
      s.tickets.filter((x) => m(x.code, x.subject)).slice(0, 4).forEach((x) => out.push({ id: x.id, group: 'Tickets', label: `${x.code} — ${x.subject}`, sub: x.status, to: `/tickets/${x.id}`, icon: <Ticket size={14} /> }))
      s.tasks.filter((x) => m(x.code, x.title)).slice(0, 4).forEach((x) => out.push({ id: x.id, group: 'Tasks', label: `${x.code} — ${x.title}`, sub: x.status, to: `/tasks/${x.id}`, icon: <ClipboardList size={14} /> }))
      s.tenants.filter((x) => m(x.name, x.contactPerson)).slice(0, 4).forEach((x) => out.push({ id: x.id, group: 'Companies', label: x.name, sub: x.industry, to: `/tenants/${x.id}`, icon: <Building size={14} /> }))
    }
    return out.slice(0, 20)
  }, [q, me, s.visitors, s.offices, s.employees, s.tickets, s.tasks, s.tenants])
  const go = (h?: Hit) => { if (h) { nav(h.to); onClose() } }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-900/50 p-4 pt-[12vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b px-3"><Search size={16} className="text-faint" />
          <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} placeholder="Search visitors, offices, employees, tickets, tasks, companies…" aria-label="Search"
            onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, hits.length - 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) } else if (e.key === 'Enter') go(hits[idx]); else if (e.key === 'Escape') onClose() }}
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-faint" /><kbd className="rounded border px-1.5 text-xxs text-muted">Esc</kbd></div>
        <ul className="max-h-[50vh] overflow-y-auto p-1.5" role="listbox">
          {hits.length === 0 && <li className="px-3 py-8 text-center text-xs text-muted">No results for “{q}”</li>}
          {hits.map((h, i) => (
            <li key={h.group + h.id} role="option" aria-selected={i === idx}>
              {(i === 0 || hits[i - 1].group !== h.group) && <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-faint">{h.group}</p>}
              <button onMouseEnter={() => setIdx(i)} onClick={() => go(h)} className={cx('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]', i === idx && 'bg-brand-soft text-brand')}>
                {h.icon}<span className="flex-1 truncate">{h.label}</span>{h.sub && <span className="truncate text-xxs text-muted">{h.sub}</span>}{i === idx && <CornerDownLeft size={12} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
