import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navFor } from './navConfig'
import { Logo } from './Logo'
import { useMe } from '@/hooks/useMe'
import { Tooltip } from '@/components/ui'
import { cx } from '@/utils/helpers'

export function Sidebar({ collapsed, setCollapsed, mobileOpen, closeMobile }: { collapsed: boolean; setCollapsed: (b: boolean) => void; mobileOpen: boolean; closeMobile: () => void }) {
  const { me } = useMe()
  if (!me) return null
  const sections = navFor(me.role)
  const body = (compact: boolean) => (
    <>
      <div className={cx('flex h-12 items-center border-b px-3', compact ? 'justify-center' : 'justify-between')}>
        <Logo collapsed={compact} />
        <button className="rounded p-1 text-muted hover:bg-subtle md:hidden" onClick={closeMobile} aria-label="Close menu"><X size={16} /></button>
      </div>
      <nav className="flex-1 space-y-2.5 overflow-y-auto px-2 py-2.5" aria-label="Main navigation">
        {sections.map((s) => (
          <div key={s.title}>
            {!compact && <p className="mb-0.5 px-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-faint">{s.title}</p>}
            {compact && <div className="mx-2 mb-1 border-t" />}
            {s.items.map((i) => {
              const link = (
                <NavLink key={i.to} to={i.to} end={i.end ?? false} onClick={closeMobile}
                  className={({ isActive }) => cx('group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[5px] text-[12.5px] font-medium transition-all', compact && 'justify-center px-0', isActive ? 'bg-gradient-to-r from-brand-soft to-transparent font-semibold text-brand before:absolute before:-left-2 before:top-1.5 before:h-[calc(100%-12px)] before:w-[3px] before:rounded-r before:bg-brand' : 'text-muted hover:bg-subtle hover:text-ink')}>
                  <i.icon size={15} className="shrink-0" />{!compact && <span className="truncate">{i.label}</span>}
                </NavLink>
              )
              return compact ? <Tooltip key={i.to} text={i.label}>{link}</Tooltip> : link
            })}
          </div>
        ))}
      </nav>
      <button onClick={() => setCollapsed(!collapsed)} className="hidden items-center gap-2 border-t px-4 py-2.5 text-xs text-muted hover:bg-subtle md:flex" aria-label="Toggle sidebar">
        {collapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} />Collapse</>}
      </button>
    </>
  )
  return (
    <>
      <aside className={cx('hidden shrink-0 flex-col border-r bg-surface transition-[width] duration-200 md:flex', collapsed ? 'w-14' : 'w-56')}>{body(collapsed)}</aside>
      {mobileOpen && <div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-slate-900/50" onClick={closeMobile} /><aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-pop">{body(false)}</aside></div>}
    </>
  )
}
