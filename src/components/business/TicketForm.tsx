import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Paperclip } from 'lucide-react'
import { Button, Drawer, Field, Input, Select, Textarea } from '@/components/ui'
import { useDb } from '@/store/db'
import { useMe } from '@/hooks/useMe'
import { useLookups } from '@/hooks/useLookups'
import * as ticketService from '@/services/ticketService'
import { TICKET_CATEGORIES, PRIORITIES } from '@/utils/constants'

const schema = z.object({ subject: z.string().min(4, 'Subject is required'), description: z.string().min(5, 'Describe the issue'), category: z.string().min(1), priority: z.string().min(1), towerId: z.string().min(1, 'Select tower'), floorId: z.string().min(1, 'Select floor'), officeId: z.string().min(1, 'Select office'), preferredVisit: z.string().optional() })
type F = z.infer<typeof schema>
export function TicketForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { towers, floors, offices } = useDb(), { me, officeId } = useMe(), L = useLookups(), own = L.office(officeId), locked = me?.role.startsWith('OFFICE') && !!own
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) as never })
  const [files, setFiles] = useState<string[]>([])
  useEffect(() => { if (open) { reset({ subject: '', description: '', category: 'Electrical', priority: 'MEDIUM', towerId: locked ? own!.towerId : '', floorId: locked ? own!.floorId : '', officeId: locked ? own!.id : '', preferredVisit: 'Anytime today' }); setFiles([]) } }, [open]) // eslint-disable-line
  const w = watch(), lock = locked ? { className: 'pointer-events-none opacity-60', tabIndex: -1 } : {}
  const submit = handleSubmit((d) => { ticketService.create({ ...d, priority: d.priority as never, preferredVisit: d.preferredVisit ?? '', attachments: files }); onClose() })
  return (
    <Drawer open={open} onClose={onClose} title="Raise a ticket" subtitle="Report an issue to building management" footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>Create ticket</Button></>}>
      <form className="grid grid-cols-2 gap-3" onSubmit={submit} noValidate>
        <Field label="Subject *" error={errors.subject?.message} className="col-span-2"><Input {...register('subject')} placeholder="e.g. Electricity issue in cabin" /></Field>
        <Field label="Description *" error={errors.description?.message} className="col-span-2"><Textarea {...register('description')} /></Field>
        <Field label="Category"><Select {...register('category')} options={TICKET_CATEGORIES} /></Field><Field label="Priority"><Select {...register('priority')} options={PRIORITIES} /></Field>
        <Field label="Tower *" error={errors.towerId?.message}><Select {...register('towerId', { onChange: () => { setValue('floorId', ''); setValue('officeId', '') } })} {...lock} placeholder="Select" options={towers.map((t) => ({ value: t.id, label: t.name }))} /></Field>
        <Field label="Floor *" error={errors.floorId?.message}><Select {...register('floorId', { onChange: () => setValue('officeId', '') })} {...lock} placeholder="Select" options={floors.filter((f) => f.towerId === w.towerId).map((f) => ({ value: f.id, label: `Floor ${f.number}` }))} /></Field>
        <Field label="Office *" error={errors.officeId?.message} className="col-span-2"><Select {...register('officeId')} {...lock} placeholder="Select" options={offices.filter((o) => o.floorId === w.floorId && o.tenantId).map((o) => ({ value: o.id, label: `Office ${o.number} — ${L.tenant(o.tenantId)?.name}` }))} /></Field>
        <Field label="Preferred visit time"><Select {...register('preferredVisit')} options={['ASAP', 'Anytime today', 'Morning (9–12)', 'Afternoon (12–4)', 'After office hours']} /></Field>
        <Field label="Attachments"><label className="input flex cursor-pointer items-center gap-1.5 text-muted"><Paperclip size={13} />{files.length ? `${files.length} file(s)` : 'Attach'}<input type="file" multiple className="hidden" onChange={(e) => setFiles([...(e.target.files ?? [])].map((f) => f.name))} /></label></Field>
      </form>
    </Drawer>
  )
}
