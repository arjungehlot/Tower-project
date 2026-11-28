import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Field, Input } from '@/components/ui'
import { Logo } from '@/components/layout/Logo'
import { useDb } from '@/store/db'
import { HOME } from '@/utils/permissions'
import type { Role } from '@/types'
import { ShieldCheck, Building2, ClipboardList, UserCog, HardHat, Eye, EyeOff, Mail, Lock, UserCheck, Ticket, Users, ArrowRight } from 'lucide-react'

const DEMO: { role: Role; label: string; icon: React.ReactNode }[] = [{ role: 'ADMIN', label: 'Admin', icon: <Building2 size={15} /> }, { role: 'SUPERVISOR', label: 'Supervisor', icon: <UserCog size={15} /> }, { role: 'SECURITY_GUARD', label: 'Guard', icon: <ShieldCheck size={15} /> }, { role: 'OFFICE_ADMIN', label: 'Office User', icon: <ClipboardList size={15} /> }, { role: 'OWNER', label: 'Owner', icon: <Building2 size={15} /> }, { role: 'STAFF', label: 'Staff', icon: <HardHat size={15} /> }]

/** Animated tower illustration: windows twinkle at staggered delays. */
function TowerArt() {
  const cols = 5, rows = 12
  return (
    <svg viewBox="0 0 320 420" className="h-full max-h-[420px] w-auto drop-shadow-2xl" aria-hidden>
      <defs>
        <linearGradient id="tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".22" /><stop offset="1" stopColor="#ffffff" stopOpacity=".05" /></linearGradient>
        <linearGradient id="tw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5b4fc" /><stop offset="1" stopColor="#67e8f9" /></linearGradient>
      </defs>
      <rect x="20" y="210" width="70" height="200" rx="6" fill="url(#tb)" stroke="#fff" strokeOpacity=".25" />
      <rect x="230" y="170" width="70" height="240" rx="6" fill="url(#tb)" stroke="#fff" strokeOpacity=".25" />
      <rect x="95" y="40" width="130" height="370" rx="8" fill="url(#tb)" stroke="#fff" strokeOpacity=".4" />
      <path d="M160 40V14" stroke="#fff" strokeOpacity=".6" strokeWidth="2" /><circle cx="160" cy="12" r="4" fill="#67e8f9"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite" /></circle>
      {Array.from({ length: rows * cols }).map((_, k) => { const r = Math.floor(k / cols), c = k % cols; return <rect key={k} className="tf-win" x={106 + c * 22} y={54 + r * 28} width="14" height="16" rx="2" fill="url(#tw)" style={{ animationDelay: `${((k * 37) % 40) / 10}s`, animationDuration: `${3 + (k % 5)}s` }} /> })}
      {Array.from({ length: 8 }).map((_, k) => <rect key={'a' + k} className="tf-win" x={32 + (k % 3) * 20} y={224 + Math.floor(k / 3) * 30} width="12" height="14" rx="2" fill="#a5b4fc" style={{ animationDelay: `${k * 0.5}s` }} />)}
      {Array.from({ length: 10 }).map((_, k) => <rect key={'b' + k} className="tf-win" x={242 + (k % 3) * 20} y={184 + Math.floor(k / 3) * 30} width="12" height="14" rx="2" fill="#67e8f9" style={{ animationDelay: `${k * 0.35}s` }} />)}
      <rect x="140" y="378" width="40" height="32" rx="4" fill="#fff" fillOpacity=".35" />
    </svg>
  )
}
function Chip({ icon, title, sub, className, delay }: { icon: React.ReactNode; title: string; sub: string; className: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .4 + delay * .2 }} className={`absolute ${className}`}>
      <div className="tf-float flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white shadow-xl backdrop-blur-md" style={{ animationDelay: `${delay}s` }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">{icon}</span>
        <div className="leading-tight"><p className="text-[13px] font-semibold">{title}</p><p className="text-[10.5px] text-white/70">{sub}</p></div>
      </div>
    </motion.div>
  )
}

export default function Login() {
  const nav = useNavigate(), { login, loginAs, toast } = useDb(), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [show, setShow] = useState(false)
  const go = (r: Role) => nav(HOME[r], { replace: true })
  const submit = (e: React.FormEvent) => { e.preventDefault(); const u = login(email, pw); if (u) go(u.role); else setErr('Invalid email or password.') }
  return (
    <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      {/* Left: animated brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-brand-strong to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-vis/30 blur-3xl" style={{ animation: 'tf-drift 14s ease-in-out infinite' }} />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-info/30 blur-3xl" style={{ animation: 'tf-drift 18s ease-in-out infinite reverse' }} />
        <div className="pointer-events-none absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative flex items-center gap-2.5 text-white"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Building2 size={19} /></span><div className="leading-tight"><p className="text-base font-bold">TowerFlow</p><p className="text-[11px] text-white/70">Smart Building Management</p></div></div>
        <div className="relative flex flex-1 items-center justify-center py-6">
          <div className="relative flex h-full w-full max-w-md items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }} className="h-full"><TowerArt /></motion.div>
            <Chip delay={0} className="left-0 top-6" icon={<UserCheck size={16} />} title="Visitor approved" sub="Gate 2 · just now" />
            <Chip delay={1.2} className="right-0 top-1/3" icon={<Ticket size={16} />} title="Ticket resolved" sub="TK-1024 · 2 min ago" />
            <Chip delay={2.2} className="bottom-8 left-4" icon={<Users size={16} />} title="14 staff available" sub="Live availability" />
          </div>
        </div>
        <div className="relative text-white">
          <h2 className="text-2xl font-bold leading-snug">Run every tower, visitor<br />and service request from one place.</h2>
          <ul className="mt-4 grid grid-cols-3 gap-3 text-xs text-white/80">{[['Visitor workflow', 'Approve in seconds'], ['Staff & tasks', 'Smart assignment'], ['Live analytics', 'Real-time insight']].map(([a, b]) => <li key={a} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 backdrop-blur"><p className="font-semibold text-white">{a}</p><p className="text-[11px]">{b}</p></li>)}</ul>
        </div>
      </aside>
      {/* Right: form */}
      <main className="relative flex items-center justify-center bg-gradient-to-br from-brand-soft/60 via-bg to-bg p-5 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-[13px] text-muted">Sign in to manage your tower, visitors, staff and tickets.</p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <Field label="Email"><div className="relative"><Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="!h-10 !pl-9 !text-[13px]" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }} autoComplete="username" placeholder="you@company.com" /></div></Field>
            <Field label="Password" error={err}><div className="relative"><Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="!h-10 !pl-9 !pr-10 !text-[13px]" type={show ? 'text' : 'password'} value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} autoComplete="current-password" placeholder="••••••••" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-faint hover:text-ink">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></Field>
            <div className="flex items-center justify-between text-xs"><label className="inline-flex cursor-pointer items-center gap-1.5 text-muted"><input type="checkbox" defaultChecked className="accent-[rgb(var(--brand))]" />Remember me</label><button type="button" className="font-medium text-brand hover:underline" onClick={() => toast('Password reset link sent (simulated).', 'info')}>Forgot password?</button></div>
            <Button type="submit" variant="primary" size="lg" className="!h-10 w-full text-sm" icon={<ArrowRight size={16} />}>Sign in</Button>
          </form>
          <div className="my-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-faint"><span className="h-px flex-1 bg-line" />Quick demo login<span className="h-px flex-1 bg-line" /></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{DEMO.map((d) => <button key={d.role} onClick={() => { loginAs(d.role); go(d.role) }} className="group flex flex-col items-center gap-1 rounded-xl border border-line bg-surface px-2 py-2.5 text-xs font-medium shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-pop"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">{d.icon}</span>{d.label}</button>)}</div>
          <p className="mt-5 text-center text-[11px] text-muted">Or use <span className="font-medium text-ink">admin@towerflow.in</span> / demo123</p>
        </motion.div>
      </main>
    </div>
  )
}
