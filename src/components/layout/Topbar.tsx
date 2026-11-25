import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Building2, ChevronRight, Menu, Moon, Plus, Search, Sun, LogOut, User, UserRoundCheck, Ticket, ClipboardList, DoorOpen, Users, Building } from 'lucide-react'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { visibleTo } from '@/services/notificationService'
import { Avatar, Dropdown, Badge } from '@/components/ui'
import { ROLE_LABEL } from '@/utils/constants'
import { ago } from '@/utils/dateUtils'

const LABELS: Record<string, string> = { dashboard: 'Dashboard', visitors: 'Visitors', visitor: 'Visitors', register: 'Register', live: 'Live', tickets: 'Tickets', tasks: 'Tasks', staff: 'Staff', offices: 'Offices', tenants: 'Tenants', towers: 'Towers', floors: 'Floors', notifications: 'Notifications', reports: 'Reports', analytics: 'Analytics', settings: 'Settings', 'audit-logs': 'Audit Logs', users: 'Users', roles: 'Permissions', whatsapp: 'WhatsApp', emails: 'Email Logs', office: 'Office', 'my-work': 'My Work', profile: 'Profile', leases: 'Leases', assets: 'Assets', maintenance: 'Maintenance', documents: 'Documents', emergency: 'Emergency', ratings: 'Ratings', supervisors: 'Supervisors', tracking: 'Tracking', history: 'History', gate: 'Gate Entries', availability: 'Availability', mine: 'My Tickets' }
export function Topbar({ openMenu, openSearch }: { openMenu: () => void; openSearch: () => void }) {
  const { me, officeId } = useMe(), loc = useLocation(), nav = useNavigate()
  const { theme, setTheme, logout, towers, towerFilter, setTowerFilter, notifications } = useDb()
  const crumbs = useMemo(() => loc.pathname.split('/').filter(Boolean), [loc.pathname])
  const mine = notifications.filter((n) => visibleTo(n, me)), unread = mine.filter((n) => !n.read)
  const [bell, setBell] = useState(false)
  if (!me) return null
  const isAdm = ['SUPER_ADMIN', 'ADMIN'].includes(me.role)
  const create = [
    { label: me.role.startsWith('OFFICE') ? 'Invite Visitor' : 'Register Visitor', icon: <UserRoundCheck size={14} />, onClick: () => nav('/visitor/register'), hidden: !['SUPER_ADMIN', 'ADMIN', 'OFFICE_ADMIN', 'OFFICE_EMPLOYEE'].includes(me.role) },
    { label: 'Create Ticket', icon: <Ticket size={14} />, onClick: () => nav(me.role.startsWith('OFFICE') ? '/tickets/mine?new=1' : '/tickets?new=1'), hidden: me.role === 'STAFF' },
    { label: 'Assign Task', icon: <ClipboardList size={14} />, onClick: () => nav('/tasks?new=1'), hidden: !['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'].includes(me.role) },
    { label: 'Add Office', icon: <DoorOpen size={14} />, onClick: () => nav('/offices?new=1'), hidden: !isAdm },
    { label: 'Add Staff', icon: <Users size={14} />, onClick: () => nav('/staff?new=1'), hidden: !isAdm },
    { label: 'Add Tenant', icon: <Building size={14} />, onClick: () => nav('/tenants?new=1'), hidden: !isAdm },
  ]
  const rl = ROLE_LABEL[me.role]
  return (
    <header className="no-print sticky top-0 z-30 flex h-12 items-center gap-2.5 border-b bg-surface/85 px-3 backdrop-blur-md md:px-4">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand via-vis to-info" />
      <button className="rounded-md p-1.5 text-muted hover:bg-subtle md:hidden" onClick={openMenu} aria-label="Open menu"><Menu size={18} /></button>
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-xs text-muted xl:flex">
        <Link to="/" className="rounded px-1 hover:bg-subtle hover:text-ink">Home</Link>
        {crumbs.map((c, i) => <span key={i} className="flex items-center gap-1"><ChevronRight size={11} className="text-faint" />{i === crumbs.length - 1 ? <span className="rounded-md bg-brand-soft px-1.5 py-0.5 font-semibold text-brand">{LABELS[c] ?? c}</span> : <span>{LABELS[c] ?? c}</span>}</span>)}
      </nav>
      <button onClick={openSearch} className="group mx-auto flex h-8 w-full max-w-md items-center gap-2 rounded-full border border-line bg-subtle/70 px-3 text-xs text-muted transition-all hover:border-brand/40 hover:bg-surface hover:shadow-card xl:mx-0 xl:ml-auto" aria-label="Open search">
        <Search size={14} className="text-faint group-hover:text-brand" /><span className="flex-1 text-left">Search visitors, offices, tickets…</span><kbd className="hidden rounded border bg-surface px-1.5 py-px text-[10px] font-medium sm:block">Ctrl K</kbd>
      </button>
      {isAdm && towers.length > 1 && <label className="relative hidden md:block"><Building2 size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand" /><select aria-label="Select tower" value={towerFilter} onChange={(e) => setTowerFilter(e.target.value)} className="input !h-8 !w-36 rounded-full !pl-7 text-xs font-medium"><option value="all">All towers</option>{towers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
      {create.some((c) => !c.hidden) && <Dropdown trigger={<button className="inline-flex h-8 items-center gap-1 rounded-full bg-gradient-to-b from-brand to-brand-strong px-3 text-xs font-semibold text-white shadow-sm shadow-brand/30 hover:brightness-110 dark:text-slate-900"><Plus size={14} /><span className="hidden sm:inline">Create</span></button>} items={create} />}
      <div className="relative">
        <button className="relative rounded-full p-1.5 text-muted transition-colors hover:bg-subtle hover:text-ink" onClick={() => setBell(!bell)} aria-label={`Notifications, ${unread.length} unread`}><Bell size={16} />{unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[9px] font-bold text-white ring-2 ring-surface">{unread.length > 99 ? '99+' : unread.length}</span>}</button>
        {bell && <><div className="fixed inset-0 z-30" onClick={() => setBell(false)} /><div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b bg-subtle/60 px-3 py-2"><p className="text-xs font-semibold">Notifications</p><Badge tone="brand">{unread.length} new</Badge></div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">{mine.slice(0, 6).map((n) => <li key={n.id}><button onClick={() => { setBell(false); nav(n.link || '/notifications') }} className="block w-full px-3 py-2 text-left hover:bg-subtle"><p className="text-xs font-medium">{!n.read && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />}{n.title}</p><p className="truncate text-xxs text-muted">{n.body}</p><p className="text-xxs text-faint">{ago(n.createdAt)}</p></button></li>)}{mine.length === 0 && <li className="p-4 text-center text-xs text-muted">All caught up</li>}</ul>
          <Link to="/notifications" onClick={() => setBell(false)} className="block border-t px-3 py-2 text-center text-xs font-medium text-brand hover:bg-subtle">View all</Link>
        </div></>}
      </div>
      <button className="rounded-full p-1.5 text-muted transition-colors hover:bg-subtle hover:text-ink" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
      <span className="hidden h-6 w-px bg-line sm:block" />
      <Dropdown trigger={<button className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2.5 transition-colors hover:bg-subtle" aria-label="Profile menu"><span className="relative"><Avatar name={me.name} size={26} /><span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-ok ring-2 ring-surface" /></span><span className="hidden whitespace-nowrap text-left leading-tight lg:block"><span className="block text-xs font-semibold">{me.name}</span><span className="block text-[10px] text-muted">{rl}</span></span></button>}
        items={[{ label: 'My profile', icon: <User size={14} />, onClick: () => nav('/profile') }, { label: 'Sign out', icon: <LogOut size={14} />, danger: true, onClick: () => { logout(); nav('/login') } }]} />
    </header>
  )
}
