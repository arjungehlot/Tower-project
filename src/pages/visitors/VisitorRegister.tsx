import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from 'lucide-react'
import { Avatar, Button, Card, Field, Input, PageHeader, Select, StatusBadge, Timeline } from '@/components/ui'
import { PhotoCapture } from '@/components/business/PhotoCapture'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import * as vs from '@/services/visitorService'
import { ID_TYPES, PURPOSES } from '@/utils/constants'
import { cx } from '@/utils/helpers'
import type { Visitor } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'), mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'), email: z.string().email('Enter a valid email').or(z.literal('')),
  idType: z.string().min(1, 'Select ID type'), idNumber: z.string().min(4, 'Enter ID number'), purpose: z.string().min(1, 'Select purpose'),
  towerId: z.string().min(1, 'Select tower'), floorId: z.string().min(1, 'Select floor'), officeId: z.string().min(1, 'Select office'), hostId: z.string().min(1, 'Select host'),
  expectedDuration: z.string().min(1), count: z.coerce.number().min(1).max(20),
})
type F = z.infer<typeof schema>
const GATE_STEPS: { title: string; fields: (keyof F)[] }[] = [{ title: 'Visitor', fields: ['name', 'mobile', 'email', 'idType', 'idNumber', 'purpose'] }, { title: 'Visit', fields: ['towerId', 'floorId', 'officeId', 'hostId', 'expectedDuration', 'count'] }, { title: 'Confirm', fields: [] }]
// Office staff only pre-invite a guest: no photo/ID (guard verifies at the gate); office & host are already known.
const INVITE_STEPS: { title: string; fields: (keyof F)[] }[] = [{ title: 'Guest details', fields: ['name', 'mobile', 'email', 'purpose', 'expectedDuration', 'count'] }, { title: 'Confirm', fields: [] }]

export default function VisitorRegister() {
  const nav = useNavigate(), { me, host, officeId } = useMe(), L = useLookups(), { towers, floors, offices, officeEmployees } = useDb()
  const isGuard = me?.role === 'SECURITY_GUARD', isOffice = !!officeId && me?.role.startsWith('OFFICE')
  const myOffice = L.office(officeId)
  const STEPS = isOffice ? INVITE_STEPS : GATE_STEPS, last = STEPS.length - 1
  const { register, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) as never, defaultValues: { idType: 'Aadhaar', idNumber: isOffice ? 'Verify at gate' : '', purpose: 'Meeting', expectedDuration: '1 hour', count: 1, towerId: isOffice ? myOffice?.towerId : '', floorId: isOffice ? myOffice?.floorId : '', officeId: isOffice ? officeId : '', hostId: isOffice ? host?.id : '' } })
  const [step, setStep] = useState(0), [photo, setPhoto] = useState(''), [created, setCreated] = useState<Visitor | null>(null), [photoErr, setPhotoErr] = useState(false)
  const lock = isOffice ? { className: 'pointer-events-none opacity-60', tabIndex: -1 } : {}
  const w = watch(), cfg = useDb((s) => s.settings[0].visitor)
  const fl = useMemo(() => floors.filter((f) => f.towerId === w.towerId), [floors, w.towerId])
  const of = useMemo(() => offices.filter((o) => o.floorId === w.floorId && o.tenantId), [offices, w.floorId])
  const hs = useMemo(() => officeEmployees.filter((h) => h.officeId === w.officeId), [officeEmployees, w.officeId])
  const next = async () => { if (!isOffice && step === 0 && cfg.requirePhoto && !photo) { setPhotoErr(true); return } setPhotoErr(false); if (await trigger(STEPS[step].fields)) setStep(step + 1) }
  const submit = handleSubmit((d) => {
    const v = vs.register({ ...d, photo, count: Number(d.count) }, 'Gate 1')
    if (isOffice) vs.approve(v.id) // invited by host → pre-approved
    setCreated(vs.get(v.id))
  })
  if (created) return (
    <div className="mx-auto max-w-md pt-6 text-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><CheckCircle2 className="mx-auto text-ok" size={52} /></motion.div>
      <h2 className="mt-3 text-lg font-bold">{isOffice ? 'Guest invited' : 'Approval request sent'}</h2>
      <p className="mt-1 text-xs text-muted">{isOffice ? 'Your guest is pre-approved. The guard has been notified and will verify ID and allow entry at the gate.' : `${L.host(created.hostId)?.name} has been notified via WhatsApp, email and in-app.`}</p>
      <Card className="mt-4 text-left"><div className="mb-3 flex items-center gap-3"><Avatar name={created.name} src={created.photo} size={44} /><div><p className="font-semibold">{created.name}</p><p className="text-xs text-muted">Office {L.officeNo(created.officeId)} · {created.purpose}</p></div><span className="ml-auto"><StatusBadge status={created.status} /></span></div><Timeline items={created.timeline} /></Card>
      <div className="mt-4 flex justify-center gap-2"><Button onClick={() => { setCreated(null); setStep(0); setPhoto(''); location.reload() }}>Register another</Button><Button variant="primary" onClick={() => nav(isGuard ? '/guard' : `/visitors/${created.id}`)}>{isGuard ? 'Back to desk' : 'View visitor'}</Button></div>
    </div>
  )
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={isOffice ? 'Invite a Guest' : 'Register Visitor'} subtitle={isOffice ? `Pre-approve someone visiting Office ${myOffice?.number ?? ''} — the guard verifies ID at the gate` : 'Capture visitor details at the gate and request host approval'} />
      <ol className="mb-4 flex items-center gap-2" aria-label="Progress">{STEPS.map((s, i) => <li key={s.title} className="flex flex-1 items-center gap-2"><span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', i <= step ? 'bg-brand text-white dark:text-slate-900' : 'bg-subtle text-muted')}>{i + 1}</span><span className={cx('text-xs font-medium', i === step ? 'text-ink' : 'text-muted')}>{s.title}</span>{i < last && <span className="h-px flex-1 bg-line" />}</li>)}</ol>
      <Card>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
            {step === 0 && isOffice && <div className="grid grid-cols-2 gap-3">
              <p className="col-span-2 rounded-lg bg-brand-soft px-3 py-2 text-xs text-brand">Guests you invite are <b>pre-approved</b>. At the gate the guard confirms their ID and lets them in — no further approval needed.</p>
              <Field label="Guest name *" error={errors.name?.message}><Input {...register('name')} placeholder="e.g. Rahul Sharma" /></Field>
              <Field label="Mobile *" error={errors.mobile?.message}><Input {...register('mobile')} inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" /></Field>
              <Field label="Email" error={errors.email?.message}><Input {...register('email')} type="email" /></Field>
              <Field label="Purpose *" error={errors.purpose?.message}><Select {...register('purpose')} options={PURPOSES} /></Field>
              <Field label="Expected duration"><Select {...register('expectedDuration')} options={['30 min', '1 hour', '2 hours', 'Half day', 'Full day']} /></Field>
              <Field label="Number of guests" error={errors.count?.message}><Input type="number" min={1} {...register('count')} /></Field>
            </div>}
            {step === 0 && !isOffice && <div className="grid gap-3 md:grid-cols-[240px_1fr]">
              <div><label className="label">Visitor photo{cfg.requirePhoto && ' *'}</label><PhotoCapture value={photo} onChange={(v) => { setPhoto(v); setPhotoErr(false) }} />{photoErr && <p role="alert" className="mt-1 text-xxs text-bad">Photo is required</p>}</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name *" error={errors.name?.message} className="col-span-2"><Input {...register('name')} placeholder="e.g. Rahul Sharma" autoFocus /></Field>
                <Field label="Mobile *" error={errors.mobile?.message}><Input {...register('mobile')} inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" /></Field>
                <Field label="Email" error={errors.email?.message}><Input {...register('email')} type="email" /></Field>
                <Field label="ID type *" error={errors.idType?.message}><Select {...register('idType')} options={ID_TYPES} /></Field>
                <Field label="ID number *" error={errors.idNumber?.message}><Input {...register('idNumber')} /></Field>
                <Field label="Purpose *" error={errors.purpose?.message} className="col-span-2"><Select {...register('purpose')} options={PURPOSES} /></Field>
              </div></div>}
            {step === 1 && !isOffice && <div className="grid grid-cols-2 gap-3">
              <Field label="Tower *" error={errors.towerId?.message}><Select {...register('towerId', { onChange: () => { setValue('floorId', ''); setValue('officeId', ''); setValue('hostId', '') } })} {...lock} placeholder="Select tower" options={towers.map((t) => ({ value: t.id, label: t.name }))} /></Field>
              <Field label="Floor *" error={errors.floorId?.message}><Select {...register('floorId', { onChange: () => { setValue('officeId', ''); setValue('hostId', '') } })} {...lock} placeholder="Select floor" options={fl.map((f) => ({ value: f.id, label: `Floor ${f.number}` }))} /></Field>
              <Field label="Office *" error={errors.officeId?.message}><Select {...register('officeId', { onChange: () => setValue('hostId', '') })} {...lock} placeholder="Select office" options={of.map((o) => ({ value: o.id, label: `${o.number} — ${L.tenant(o.tenantId)?.name}` }))} /></Field>
              <Field label="Host employee *" error={errors.hostId?.message}><Select {...register('hostId')} disabled={!w.officeId} placeholder="Select host" options={hs.map((h) => ({ value: h.id, label: `${h.name} (${h.designation})` }))} /></Field>
              <Field label="Expected duration"><Select {...register('expectedDuration')} options={['30 min', '1 hour', '2 hours', 'Half day', 'Full day']} /></Field>
              <Field label="Number of visitors" error={errors.count?.message}><Input type="number" min={1} {...register('count')} /></Field>
            </div>}
            {step === last && (() => { const g = getValues(); return <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar name={g.name} src={photo} size={isOffice ? 56 : 96} />
              <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-xs">{([['Name', g.name], ['Mobile', g.mobile], ['Email', g.email || '—'], ['ID', `${g.idType} · ${g.idNumber}`], ['Purpose', g.purpose], ['Visitors', g.count], ['Visiting', `Office ${L.officeNo(g.officeId)} · ${L.officeTenant(g.officeId)?.name}`], ['Host', L.host(g.hostId)?.name], ['Location', L.location(g.towerId, g.floorId)], ['Expected', g.expectedDuration]] as [string, unknown][]).map(([k, v]) => <div key={k}><p className="label">{k}</p><p className="font-medium">{String(v)}</p></div>)}</div></div> })()}
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex justify-between border-t pt-3">
          <Button disabled={step === 0} onClick={() => setStep(step - 1)} icon={<ArrowLeft size={14} />}>Back</Button>
          {step < last ? <Button variant="primary" onClick={next}>Next<ArrowRight size={14} /></Button> : <Button variant="primary" onClick={submit} icon={<Send size={14} />}>{isOffice ? 'Send invite' : 'Send Approval Request'}</Button>}
        </div>
      </Card>
    </div>
  )
}
