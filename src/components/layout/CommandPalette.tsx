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
  const TONE: Record<string, string> = { 'Go to': 'bg-brand/10 text-brand', Visitors: 'bg-vis/10 text-vis', Offices: 'bg-info/10 text-info', Employees: 'bg-ok/10 text-ok', Tickets: 'bg-warn/10 text-warn', Tasks: 'bg-bad/10 text-bad', Companies: 'bg-subtle text-muted' }
  const Key = ({ children }: { children: React.ReactNode }) => <kbd className="rounded-md border border-line bg-surface px-1.5 py-px font-sans text-[10px] font-semibold text-muted shadow-sm">{children}</kbd>
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-900/45 p-4 pt-[11vh] backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="w-full max-w-xl animate-[pop_.16s_ease-out] overflow-hidden rounded-2xl border border-line bg-surface shadow-pop ring-1 ring-black/5" onClick={(e) => e.stopPropagation()}>
        <div className="h-0.5 bg-gradient-to-r from-brand/40 via-vis/30 to-info/30" />
        <div className="flex items-center gap-3 border-b px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-vis/10 text-brand"><Search size={15} /></span>
          <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} placeholder="Search visitors, offices, tickets, tasks…" aria-label="Search" autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, hits.length - 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) } else if (e.key === 'Enter') go(hits[idx]); else if (e.key === 'Escape') onClose() }}
            style={{ outline: 'none', boxShadow: 'none' }} className="h-12 flex-1 border-0 bg-transparent text-sm font-medium outline-none ring-0 placeholder:font-normal placeholder:text-faint focus:outline-none focus:ring-0 focus-visible:outline-none" />
          <button onClick={onClose} className="rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[10px] font-semibold text-muted hover:text-ink">ESC</button></div>
        <ul className="max-h-[48vh] overflow-y-auto p-2" role="listbox">
          {hits.length === 0 && <li className="flex flex-col items-center gap-1 px-3 py-9 text-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-faint"><Search size={18} /></span><p className="text-sm font-semibold">No results</p><p className="text-xs text-muted">Nothing matches “{q}”. Try a name, office number or ticket code.</p></li>}
          {hits.map((h, i) => (
            <li key={h.group + h.id} role="option" aria-selected={i === idx}>
              {(i === 0 || hits[i - 1].group !== h.group) && <p className="px-2 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-faint">{h.group}</p>}
              <button onMouseEnter={() => setIdx(i)} onClick={() => go(h)} className={cx('group flex w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[13px] transition-colors', i === idx ? 'bg-brand-soft' : 'hover:bg-subtle')}>
                <span className={cx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', TONE[h.group] ?? TONE['Go to'])}>{h.icon}</span>
                <span className="min-w-0 flex-1"><span className={cx('block truncate font-medium', i === idx && 'text-brand')}>{h.label}</span>{h.sub && <span className="block truncate text-xxs text-muted">{h.sub}</span>}</span>
                {i === idx && <span className="flex items-center gap-1 text-xxs font-semibold text-brand">Open<CornerDownLeft size={12} /></span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t bg-subtle/50 px-4 py-2 text-[11px] text-muted"><span className="flex items-center gap-3"><span className="flex items-center gap-1"><Key>↑</Key><Key>↓</Key>navigate</span><span className="flex items-center gap-1"><Key>↵</Key>open</span></span><span>{hits.length} result{hits.length === 1 ? '' : 's'}</span></div>
      </div>
    </div>
  )
}
