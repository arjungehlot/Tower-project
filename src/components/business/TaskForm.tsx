import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star, MapPin, Paperclip } from 'lucide-react'
import { Avatar, Button, Drawer, Field, Input, Select, StatusBadge, Textarea } from '@/components/ui'
import { useDb } from '@/store/db'
import { useLookups } from '@/hooks/useLookups'
import { recommend } from '@/services/employeeService'
import * as taskService from '@/services/taskService'
import { STAFF_CATEGORIES, PRIORITIES } from '@/utils/constants'
import { cx } from '@/utils/helpers'

const schema = z.object({ title: z.string().min(3, 'Task title is required'), description: z.string().min(3, 'Add a short description'), category: z.string().min(1, 'Select category'), towerId: z.string().min(1, 'Select tower'), floorId: z.string().optional(), officeId: z.string().optional(), priority: z.string().min(1), deadline: z.string().min(1, 'Deadline is required').refine((d) => new Date(d) > new Date(), 'Deadline must be in the future'), notes: z.string().optional() })
type F = z.infer<typeof schema>
const inHours = (h: number) => new Date(Date.now() + h * 3600000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

/** Create-task drawer with smart staff recommendations (availability → location → workload → skill → rating). */
export function TaskForm({ open, onClose, preset }: { open: boolean; onClose: () => void; preset?: Partial<F> }) {
  const { towers, floors, offices } = useDb(), L = useLookups()
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) as never })
  const [emp, setEmp] = useState(''), [empErr, setEmpErr] = useState(false), [files, setFiles] = useState<string[]>([])
  useEffect(() => { if (open) { reset({ title: '', description: '', category: 'Electrician', towerId: towers[0]?.id, floorId: '', officeId: '', priority: 'MEDIUM', deadline: inHours(8), notes: '', ...preset }); setEmp(''); setFiles([]); setEmpErr(false) } }, [open]) // eslint-disable-line
  const w = watch()
  const recs = useMemo(() => w.category ? recommend(w.category, L.tower(w.towerId)?.name, w.title ?? '') : [], [w.category, w.towerId, w.title, open]) // eslint-disable-line
  const submit = handleSubmit((d) => { if (!emp) { setEmpErr(true); return } taskService.create({ ...d, floorId: d.floorId ?? '', officeId: d.officeId ?? '', notes: d.notes, assignedEmployeeId: emp, deadline: new Date(d.deadline).toISOString(), priority: d.priority as never, attachments: files }); onClose() })
  return (
    <Drawer open={open} onClose={onClose} title="Assign work" subtitle="Create a task and assign it to staff" width="max-w-xl" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>Create & assign</Button></>}>
      <form className="grid grid-cols-2 gap-3" onSubmit={submit} noValidate>
        <Field label="Task title *" error={errors.title?.message} className="col-span-2"><Input {...register('title')} placeholder="e.g. Fix electricity issue" /></Field>
        <Field label="Description *" error={errors.description?.message} className="col-span-2"><Textarea {...register('description')} /></Field>
        <Field label="Category *" error={errors.category?.message}><Select {...register('category')} options={STAFF_CATEGORIES} /></Field>
        <Field label="Priority"><Select {...register('priority')} options={PRIORITIES} /></Field>
        <Field label="Tower *" error={errors.towerId?.message}><Select {...register('towerId', { onChange: () => { setValue('floorId', ''); setValue('officeId', '') } })} options={towers.map((t) => ({ value: t.id, label: t.name }))} /></Field>
        <Field label="Floor"><Select {...register('floorId', { onChange: () => setValue('officeId', '') })} placeholder="Common area" options={floors.filter((f) => f.towerId === w.towerId).map((f) => ({ value: f.id, label: `Floor ${f.number}` }))} /></Field>
        <Field label="Office" className="col-span-2"><Select {...register('officeId')} placeholder="None" options={offices.filter((o) => o.floorId === w.floorId).map((o) => ({ value: o.id, label: `Office ${o.number}` }))} /></Field>
        <Field label="Deadline *" error={errors.deadline?.message}><Input type="datetime-local" {...register('deadline')} /></Field>
        <Field label="Attachments"><label className="input flex cursor-pointer items-center gap-1.5 text-muted"><Paperclip size={13} />{files.length ? `${files.length} file(s)` : 'Attach files'}<input type="file" multiple className="hidden" onChange={(e) => setFiles([...(e.target.files ?? [])].map((f) => f.name))} /></label></Field>
        <Field label="Notes" className="col-span-2"><Input {...register('notes')} /></Field>
        <div className="col-span-2">
          <p className="label">Recommended {w.category}s {empErr && <span className="normal-case text-bad">— select an employee</span>}</p>
          <div className="space-y-1.5" role="radiogroup" aria-label="Assign employee">
            {recs.map((e, i) => <button type="button" key={e.id} role="radio" aria-checked={emp === e.id} onClick={() => { setEmp(e.id); setEmpErr(false) }} className={cx('flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition-colors', emp === e.id ? 'border-brand bg-brand-soft' : 'border-line hover:bg-subtle')}>
              <Avatar name={e.name} size={30} /><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 text-xs font-semibold">{e.name}{i === 0 && e.status === 'AVAILABLE' && <span className="rounded bg-ok/10 px-1 text-[9px] font-bold text-ok">BEST MATCH</span>}</p>
                <p className="flex items-center gap-2 text-xxs text-muted"><span className="inline-flex items-center gap-0.5"><MapPin size={9} />{e.location}</span><span>{e.load} active</span><span className="inline-flex items-center gap-0.5"><Star size={9} className="fill-warn text-warn" />{e.rating || '—'}</span></p></div><StatusBadge status={e.status} /></button>)}
            {recs.length === 0 && <p className="text-xs text-muted">No staff in this category.</p>}
          </div>
        </div>
      </form>
    </Drawer>
  )
}
