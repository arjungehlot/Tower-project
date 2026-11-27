import { useState, type ReactNode } from 'react'
import { Bell, Globe, KeyRound, Mail, MessageCircle, Moon, Phone, Save, Smartphone, Sun, User } from 'lucide-react'
import { Avatar, Button, Card, Field, Input, PageHeader, Select } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { ROLE_LABEL } from '@/utils/constants'
import { cx } from '@/utils/helpers'

const CH = { whatsapp: { label: 'WhatsApp', icon: MessageCircle, c: 'text-ok bg-ok/10' }, email: { label: 'Email', icon: Mail, c: 'text-info bg-info/10' }, inApp: { label: 'In-app', icon: Smartphone, c: 'text-vis bg-vis/10' } } as const

function Row({ icon, v }: { icon: ReactNode; v?: string }) { return <div className="flex items-center gap-2.5 rounded-lg bg-subtle/70 px-3 py-1.5 text-[12.5px]"><span className="text-faint">{icon}</span><span className="min-w-0 truncate">{v || '—'}</span></div> }

export default function Profile() {
  const { me } = useMe(), { patch, theme, setTheme } = useDb(), [f, setF] = useState({ name: me?.name ?? '', phone: me?.phone ?? '', email: me?.email ?? '' }), [pw, setPw] = useState(''), [lang, setLang] = useState('English'), [n, setN] = useState({ whatsapp: true, email: true, inApp: true })
  if (!me) return null
  const save = () => { patch('users', me.id, { ...f, ...(pw.length >= 6 ? { password: pw } : {}) }); setPw(''); useDb.getState().toast('Profile updated.') }
  return <><PageHeader title="My profile" subtitle="Manage your account details and preferences" />
    <div className="grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card pad={false} className="overflow-hidden">
        <div className="flex flex-col items-center px-4 py-5 text-center">
          <Avatar name={me.name} size={72} />
          <p className="mt-2 text-base font-semibold leading-tight">{f.name || me.name}</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />{ROLE_LABEL[me.role]}</span>
          <div className="mt-3 w-full space-y-1.5 text-left"><Row icon={<Mail size={14} />} v={f.email} /><Row icon={<Phone size={14} />} v={f.phone} /></div>
        </div>
      </Card>
      <div className="space-y-3">
        <Card title="Account" action={<span className="text-xxs text-muted">Update your personal details</span>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><div className="relative"><User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="pl-9" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div></Field>
            <Field label="Phone"><div className="relative"><Phone size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="pl-9" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div></Field>
            <Field label="Email"><div className="relative"><Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="pl-9" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div></Field>
            <Field label="New password"><div className="relative"><KeyRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Input className="pl-9" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Leave blank to keep current" /></div></Field>
          </div>
          <div className="mt-3 flex justify-end"><Button variant="primary" onClick={save}><Save size={14} />Save profile</Button></div>
        </Card>
        <Card title="Preferences">
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,220px)_1fr]">
            <div><p className="label">Theme</p><div className="inline-flex rounded-lg border border-line bg-subtle p-0.5">{([['light', 'Light', Sun], ['dark', 'Dark', Moon]] as const).map(([v, l, I]) => <button key={v} type="button" onClick={() => setTheme(v)} className={cx('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition', theme === v ? 'bg-surface text-brand shadow-card' : 'text-muted hover:text-ink')}><I size={13} />{l}</button>)}</div></div>
            <Field label="Language"><div className="relative"><Globe size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" /><Select className="pl-9" value={lang} onChange={(e) => setLang(e.target.value)} options={['English', 'हिन्दी']} /></div></Field>
            <div><p className="label flex items-center gap-1"><Bell size={11} />Notify me via</p><div className="flex flex-wrap gap-2">{(Object.keys(CH) as (keyof typeof CH)[]).map((k) => { const { label, icon: I, c } = CH[k], on = n[k]; return <button key={k} type="button" role="switch" aria-checked={on} onClick={() => setN({ ...n, [k]: !on })} className={cx('inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition', on ? 'border-brand/40 bg-brand/5 text-ink' : 'border-line text-muted hover:border-faint')}><span className={cx('flex h-5 w-5 items-center justify-center rounded-md', on ? c : 'bg-subtle text-faint')}><I size={12} /></span>{label}<span className={cx('relative h-4 w-7 rounded-full transition', on ? 'bg-brand' : 'bg-line')}><span className={cx('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all', on ? 'left-3.5' : 'left-0.5')} /></span></button> })}</div></div>
          </div>
        </Card>
      </div>
    </div></>
}
