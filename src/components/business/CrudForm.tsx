import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Drawer, Button, Field, Input, Select, Textarea } from '@/components/ui'

export interface FieldDef { name: string; label: string; type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'datetime'; required?: boolean; options?: (string | { value: string; label: string })[]; span?: 1 | 2; min?: number; placeholder?: string }
const PHONE = /^[+\d][\d\s-]{7,15}$/
/** Builds a Zod schema from field definitions so every CRUD form validates the same way. */
export function schemaFor(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    let s: z.ZodTypeAny
    if (f.type === 'number') s = z.coerce.number({ invalid_type_error: `${f.label} must be a number` }).min(f.min ?? 0, `${f.label} must be ≥ ${f.min ?? 0}`)
    else if (f.type === 'email') s = f.required ? z.string().email('Enter a valid email') : z.string().email('Enter a valid email').or(z.literal(''))
    else if (f.type === 'tel') s = f.required ? z.string().regex(PHONE, 'Enter a valid phone number') : z.string().regex(PHONE, 'Enter a valid phone number').or(z.literal(''))
    else s = f.required ? z.string().min(1, `${f.label} is required`) : z.string()
    shape[f.name] = s
  }
  return z.object(shape).passthrough()
}
export function CrudForm({ open, onClose, title, fields, initial, onSubmit, submitLabel = 'Save' }: { open: boolean; onClose: () => void; title: string; fields: FieldDef[]; initial?: Record<string, unknown> | null; onSubmit: (v: Record<string, unknown>) => void; submitLabel?: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>({ resolver: zodResolver(schemaFor(fields)) as never })
  useEffect(() => { if (open) reset(Object.fromEntries(fields.map((f) => { const v = initial?.[f.name]; return [f.name, Array.isArray(v) ? v.join(', ') : v ?? (f.type === 'number' ? 0 : '')] }))) }, [open, initial]) // eslint-disable-line
  const submit = handleSubmit((v) => { onSubmit(v); onClose() })
  return (
    <Drawer open={open} onClose={onClose} title={title} footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={submit}>{submitLabel}</Button></>}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3" noValidate>
        {fields.map((f) => {
          const err = errors[f.name]?.message as string | undefined
          return (
            <Field key={f.name} label={f.label + (f.required ? ' *' : '')} error={err} className={f.span === 2 || f.type === 'textarea' ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
              {f.type === 'select' ? <Select {...register(f.name)} options={f.options} placeholder="Select…" />
                : f.type === 'textarea' ? <Textarea {...register(f.name)} placeholder={f.placeholder} />
                : <Input {...register(f.name)} type={f.type === 'datetime' ? 'datetime-local' : f.type ?? 'text'} placeholder={f.placeholder} />}
            </Field>
          )
        })}
      </form>
    </Drawer>
  )
}
