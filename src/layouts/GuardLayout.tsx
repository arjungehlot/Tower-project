import { Outlet, Link, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, Siren } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { DemoPanel } from '@/components/layout/DemoPanel'
import { Avatar, ErrorBoundary } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'

/** Minimal, large-target layout for the security desk (tablet-first). No admin navigation. */
export default function GuardLayout() {
  const { me } = useMe(), nav = useNavigate(), { theme, setTheme, logout } = useDb()
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-surface px-4">
        <Link to="/guard"><Logo /></Link>
        <div className="flex items-center gap-3">
          <Link to="/guard/emergency" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-bad px-3 text-xs font-bold text-white dark:text-slate-900"><Siren size={15} />EMERGENCY</Link>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode" className="rounded-lg p-2 text-muted hover:bg-subtle">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <div className="hidden items-center gap-2 sm:flex"><Avatar name={me?.name ?? 'G'} /><div className="leading-tight"><p className="text-xs font-semibold">{me?.name}</p><p className="text-[10px] text-muted">Gate 1 · Security Guard</p></div></div>
          <button onClick={() => { logout(); nav('/login') }} aria-label="Sign out" className="rounded-lg p-2 text-muted hover:bg-subtle"><LogOut size={18} /></button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-3 md:p-5"><ErrorBoundary><Outlet /></ErrorBoundary></main>
      <DemoPanel />
    </div>
  )
}
