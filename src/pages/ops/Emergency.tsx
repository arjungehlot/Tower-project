import { useState } from 'react'
import { Flame, HeartPulse, ShieldAlert, ZapOff, ArrowUpDown, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Card, PageHeader } from '@/components/ui'
import { useDb } from '@/store/db'
import { notify, auditLog, sendMessage } from '@/services/core'
import { fmtTime } from '@/utils/dateUtils'

const TYPES = [{ id: 'Fire Emergency', icon: Flame }, { id: 'Medical Emergency', icon: HeartPulse }, { id: 'Security Emergency', icon: ShieldAlert }, { id: 'Power Failure', icon: ZapOff }, { id: 'Lift Emergency', icon: ArrowUpDown }]
export default function Emergency() {
  const { settings, towers, toast } = useDb(), [active, setActive] = useState<{ type: string; at: string } | null>(null)
  const trigger = (type: string) => {
    setActive({ type, at: new Date().toISOString() })
    notify({ category: 'Security', title: `ALERT: ${type}`, body: `${type} reported. Follow emergency protocol immediately.`, roles: ['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR', 'SECURITY_GUARD'] })
    sendMessage({ channel: 'whatsapp', recipient: 'Emergency response team', contact: towers[0].emergencyContact, subject: '', message: `${type} alert raised from the building control desk.`, type: 'Emergency', related: '', relatedLabel: type })
    auditLog(`triggered ${type}`, 'Emergency', type); toast(`${type} alert broadcast to response team.`, 'error')
  }
  return <>
    <AnimatePresence>{active && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-3 rounded-xl border-2 border-bad bg-bad/10 p-3 text-bad" role="alert">
      <ShieldAlert className="animate-pulse" size={28} /><div className="flex-1"><p className="text-sm font-bold uppercase">{active.type} ACTIVE</p><p className="text-xs">Alert broadcast at {fmtTime(active.at)}. Response team, supervisors and guards notified.</p></div><Button size="sm" onClick={() => setActive(null)} icon={<X size={13} />}>Clear alert</Button></motion.div>}</AnimatePresence>
    <PageHeader title="Emergency Management" subtitle="Trigger building-wide alerts and reach emergency contacts" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{TYPES.map((t) => <button key={t.id} onClick={() => confirm(`Broadcast "${t.id}" alert to all staff?`) && trigger(t.id)} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-bad/30 bg-bad/5 p-5 text-bad transition-all hover:border-bad hover:bg-bad/10 active:scale-95"><t.icon size={30} /><span className="text-sm font-bold">{t.id}</span></button>)}</div>
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <Card title="Emergency contacts"><ul className="divide-y divide-line">{settings[0].emergencyContacts.map((c) => <li key={c.label} className="flex items-center justify-between py-2"><span className="text-sm">{c.label}</span><a href={`tel:${c.number}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"><Phone size={13} />{c.number}</a></li>)}</ul></Card>
      <Card title="Tower emergency desks"><ul className="divide-y divide-line">{towers.map((t) => <li key={t.id} className="py-2 text-xs"><p className="font-semibold">{t.name}</p><p className="text-muted">Security desk {t.securityDesk} · Emergency {t.emergencyContact}</p></li>)}</ul></Card>
    </div>
  </>
}
