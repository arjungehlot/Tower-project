import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Field, Input } from '@/components/ui'
import { Logo } from '@/components/layout/Logo'
import { useDb } from '@/store/db'
import { HOME } from '@/utils/permissions'
import type { Role } from '@/types'
import { ShieldCheck, Building2, ClipboardList, UserCog, HardHat } from 'lucide-react'

const DEMO: { role: Role; label: string; icon: React.ReactNode }[] = [{ role: 'ADMIN', label: 'Admin', icon: <Building2 size={15} /> }, { role: 'SUPERVISOR', label: 'Supervisor', icon: <UserCog size={15} /> }, { role: 'SECURITY_GUARD', label: 'Guard', icon: <ShieldCheck size={15} /> }, { role: 'OFFICE_ADMIN', label: 'Office User', icon: <ClipboardList size={15} /> }, { role: 'STAFF', label: 'Staff', icon: <HardHat size={15} /> }]
export default function Login() {
  const nav = useNavigate(), { login, loginAs, toast } = useDb(), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  const go = (r: Role) => nav(HOME[r], { replace: true })
  const submit = (e: React.FormEvent) => { e.preventDefault(); const u = login(email, pw); if (u) go(u.role); else setErr('Invalid email or password.') }
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-soft via-bg to-bg p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-pop">
        <Logo /><h1 className="mt-5 text-lg font-bold">Sign in</h1><p className="text-xs text-muted">Manage your tower, visitors, staff and tickets.</p>
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr('') }} autoComplete="username" placeholder="you@company.com" /></Field>
          <Field label="Password" error={err}><Input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} autoComplete="current-password" /></Field>
          <div className="flex items-center justify-between text-xs"><label className="inline-flex items-center gap-1.5"><input type="checkbox" defaultChecked />Remember me</label><button type="button" className="text-brand" onClick={() => toast('Password reset link sent (simulated).', 'info')}>Forgot password?</button></div>
          <Button type="submit" variant="primary" size="lg" className="w-full">Login</Button>
        </form>
        <div className="mt-5 border-t pt-4"><p className="label">Demo login</p><div className="grid grid-cols-2 gap-2">{DEMO.map((d) => <Button key={d.role} icon={d.icon} onClick={() => { loginAs(d.role); go(d.role) }}>{d.label}</Button>)}</div>
          <p className="mt-3 text-center text-xxs text-muted">Or use admin@towerflow.in / demo123</p></div>
      </motion.div>
    </div>
  )
}
