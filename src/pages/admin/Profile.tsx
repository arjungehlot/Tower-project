import { useState } from 'react'
import { Avatar, Button, Card, Field, Input, PageHeader, Select } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { ROLE_LABEL } from '@/utils/constants'

export default function Profile() {
  const { me } = useMe(), { patch, theme, setTheme } = useDb(), [f, setF] = useState({ name: me?.name ?? '', phone: me?.phone ?? '', email: me?.email ?? '' }), [pw, setPw] = useState(''), [lang, setLang] = useState('English'), [n, setN] = useState({ whatsapp: true, email: true, inApp: true })
  if (!me) return null
  return <><PageHeader title="My profile" />
    <div className="grid max-w-4xl gap-4 md:grid-cols-3">
      <Card className="text-center"><div className="flex flex-col items-center gap-2"><Avatar name={me.name} size={72} /><p className="font-semibold">{me.name}</p><p className="text-xs text-muted">{ROLE_LABEL[me.role]}</p></div></Card>
      <Card title="Account" className="md:col-span-2"><div className="grid grid-cols-2 gap-3"><Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field><Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field><Field label="Email" className="col-span-2"><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field><Field label="New password" className="col-span-2"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Leave blank to keep current" /></Field></div>
        <Button className="mt-3" variant="primary" onClick={() => { patch('users', me.id, { ...f, ...(pw.length >= 6 ? { password: pw } : {}) }); setPw(''); useDb.getState().toast('Profile updated.') }}>Save profile</Button></Card>
      <Card title="Preferences" className="md:col-span-3"><div className="grid gap-3 sm:grid-cols-3"><Field label="Theme"><Select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></Field><Field label="Language"><Select value={lang} onChange={(e) => setLang(e.target.value)} options={['English', 'हिन्दी']} /></Field>
        <div><p className="label">Notify me via</p>{(['whatsapp', 'email', 'inApp'] as const).map((k) => <label key={k} className="mr-3 inline-flex items-center gap-1 text-xs capitalize"><input type="checkbox" checked={n[k]} onChange={(e) => setN({ ...n, [k]: e.target.checked })} />{k === 'inApp' ? 'In-app' : k}</label>)}</div></div></Card>
    </div></>
}
